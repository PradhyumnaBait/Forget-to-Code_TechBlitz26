import prisma from '../config/database';
import { AppointmentStatus } from '../types';

export class QueueService {
  async checkIn(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) throw new Error('Appointment not found');
    if (appointment.status !== AppointmentStatus.BOOKED) {
      throw new Error(`Cannot check in — status is ${appointment.status}`);
    }

    // Count current queue position
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayStart = new Date(todayStr + 'T00:00:00.000Z');
    const todayEnd = new Date(todayStr + 'T00:00:00.000Z');
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const queuePos = await prisma.appointment.count({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        status: AppointmentStatus.CHECKED_IN,
      },
    });

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CHECKED_IN,
        queuePos: queuePos + 1,
      },
      include: { patient: true },
    });
  }

  async getCurrentQueue() {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayStart = new Date(todayStr + 'T00:00:00.000Z');
    const todayEnd = new Date(todayStr + 'T00:00:00.000Z');
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const queue = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        status: {
          in: [AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_CONSULTATION],
        },
      },
      include: { patient: true },
      orderBy: [{ queuePos: 'asc' }, { timeSlot: 'asc' }],
    });

    const current = queue.find(
      (a) => a.status === AppointmentStatus.IN_CONSULTATION
    );
    const waiting = queue.filter(
      (a) => a.status === AppointmentStatus.CHECKED_IN
    );

    const waitTimePerPatient = 15; // avg mins per consultation
    return {
      current: current || null,
      next: waiting[0] || null,
      waiting,
      queueLength: waiting.length,
      estimatedWaitMinutes: waiting.length * waitTimePerPatient,
    };
  }

  async startConsultation(appointmentId: string) {
    // Mark any current IN_CONSULTATION as completed first
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayStart = new Date(todayStr + 'T00:00:00.000Z');
    const todayEnd = new Date(todayStr + 'T00:00:00.000Z');
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    await prisma.appointment.updateMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        status: AppointmentStatus.IN_CONSULTATION,
      },
      data: { status: AppointmentStatus.COMPLETED },
    });

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.IN_CONSULTATION },
      include: { patient: true },
    });
  }

  async completeConsultation(appointmentId: string) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.COMPLETED },
      include: { patient: true },
    });
  }

  async markNoShow(appointmentId: string) {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.NO_SHOW },
      include: { patient: true },
    });

    // Release slot
    const dateStr = appointment.date.toISOString().split('T')[0];
    const { slotService } = await import('./slotService');
    await slotService.releaseSlot(dateStr, appointment.timeSlot);

    return appointment;
  }

  async getQueuePosition(appointmentId: string): Promise<number | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { queuePos: true },
    });
    return appointment?.queuePos ?? null;
  }
}

export const queueService = new QueueService();
