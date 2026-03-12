import prisma from '../config/database';
import { AppointmentCreateDTO, AppointmentStatus } from '../types';
import { slotService } from './slotService';
import { messagingService } from './messagingService';

export class BookingService {
  async createAppointment(data: AppointmentCreateDTO) {
    const { patientName, patientPhone, patientEmail, date, timeSlot, reason } = data;

    // Find or create patient
    const patient = await prisma.patient.upsert({
      where: { phone: patientPhone },
      update: { name: patientName, email: patientEmail },
      create: { name: patientName, phone: patientPhone, email: patientEmail },
    });

    // Parse date correctly
    const appointmentDate = new Date(date + 'T00:00:00.000Z');

    // Create appointment (unique constraint on [date, timeSlot] prevents doubles)
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        date: appointmentDate,
        timeSlot,
        reason,
        status: AppointmentStatus.BOOKED,
      },
      include: { patient: true },
    });

    // Mark slot as booked
    await slotService.markSlotBooked(date, timeSlot);

    // Send confirmation WhatsApp/SMS
    await messagingService.sendAppointmentConfirmation(
      patient.phone,
      patient.name,
      date,
      timeSlot,
      appointment.id
    );

    return appointment;
  }

  async cancelAppointment(
    appointmentId: string,
    reason?: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) throw new Error('Appointment not found');
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed appointment');
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED, notes: reason },
    });

    // Release the slot
    const dateStr = appointment.date.toISOString().split('T')[0];
    await slotService.releaseSlot(dateStr, appointment.timeSlot);

    // Notify patient
    await messagingService.sendCancellationNotification(
      appointment.patient.phone,
      appointment.patient.name,
      dateStr,
      appointment.timeSlot
    );

    return updated;
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTimeSlot: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) throw new Error('Appointment not found');

    // Release old slot
    const oldDateStr = appointment.date.toISOString().split('T')[0];
    await slotService.releaseSlot(oldDateStr, appointment.timeSlot);

    // Book new slot
    await slotService.markSlotBooked(newDate, newTimeSlot);

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: new Date(newDate + 'T00:00:00.000Z'),
        timeSlot: newTimeSlot,
        status: AppointmentStatus.BOOKED,
      },
      include: { patient: true },
    });

    // Notify patient
    await messagingService.sendRescheduleNotification(
      appointment.patient.phone,
      appointment.patient.name,
      newDate,
      newTimeSlot
    );

    return updated;
  }

  async getAppointmentById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        consultation: {
          include: { prescriptions: true },
        },
        billing: true,
      },
    });
  }

  async listAppointments(options: {
    date?: string;
    status?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }) {
    const { date, status, patientId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (date) {
      const d = new Date(date + 'T00:00:00.000Z');
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where['date'] = { gte: d, lt: next };
    }

    if (status) where['status'] = status;
    if (patientId) where['patientId'] = patientId;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: { patient: true, billing: true },
        orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }

  async getTodayAppointments() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.appointment.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { patient: true, billing: true },
      orderBy: { timeSlot: 'asc' },
    });
  }
}

export const bookingService = new BookingService();
