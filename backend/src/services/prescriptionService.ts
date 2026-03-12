import prisma from '../config/database';
import { PrescriptionCreateDTO } from '../types';

export class PrescriptionService {
  async createPrescription(data: PrescriptionCreateDTO) {
    return prisma.prescription.create({
      data,
      include: { consultation: true },
    });
  }

  async createBulkPrescriptions(
    consultationId: string,
    patientId: string,
    medicines: Omit<PrescriptionCreateDTO, 'consultationId' | 'patientId'>[]
  ) {
    const data = medicines.map((m) => ({ ...m, consultationId, patientId }));
    return prisma.prescription.createMany({ data });
  }

  async getPrescriptionById(id: string) {
    return prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            patient: true,
            appointment: true,
          },
        },
        patient: true,
      },
    });
  }

  async getPrescriptionsByConsultation(consultationId: string) {
    return prisma.prescription.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePrescription(
    id: string,
    data: Partial<PrescriptionCreateDTO>
  ) {
    return prisma.prescription.update({ where: { id }, data });
  }

  async deletePrescription(id: string) {
    return prisma.prescription.delete({ where: { id } });
  }
}

export const prescriptionService = new PrescriptionService();
