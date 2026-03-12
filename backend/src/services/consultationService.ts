import prisma from '../config/database';
import { ConsultationCreateDTO } from '../types';

export class ConsultationService {
  async startConsultation(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) throw new Error('Appointment not found');

    // Check if consultation already exists
    const existing = await prisma.consultation.findUnique({
      where: { appointmentId },
    });
    if (existing) return existing;

    return prisma.consultation.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
      },
      include: { prescriptions: true },
    });
  }

  async saveNotes(data: ConsultationCreateDTO) {
    const { appointmentId, patientId, notes, diagnosis, advice, treatmentPlan } =
      data;

    return prisma.consultation.upsert({
      where: { appointmentId },
      update: { notes, diagnosis, advice, treatmentPlan },
      create: {
        appointmentId,
        patientId,
        notes,
        diagnosis,
        advice,
        treatmentPlan,
      },
      include: { prescriptions: true },
    });
  }

  async getConsultationById(id: string) {
    return prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        prescriptions: true,
        appointment: true,
      },
    });
  }

  async getConsultationByAppointment(appointmentId: string) {
    return prisma.consultation.findUnique({
      where: { appointmentId },
      include: {
        patient: true,
        prescriptions: true,
        appointment: true,
      },
    });
  }

  async getPatientHistory(patientId: string) {
    return prisma.consultation.findMany({
      where: { patientId },
      include: {
        prescriptions: true,
        appointment: { select: { date: true, timeSlot: true, reason: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const consultationService = new ConsultationService();
