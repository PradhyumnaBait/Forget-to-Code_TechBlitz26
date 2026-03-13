import prisma from '../config/database';
import { BillingCreateDTO, PaymentStatus } from '../types';
import { messagingService } from './messagingService';

export class BillingService {
  async createBill(data: BillingCreateDTO) {
    const { appointmentId, consultationFee, medicineCost = 0, paymentMethod = 'CASH' } = data;

    const total = consultationFee + medicineCost;

    const existing = await prisma.billing.findUnique({ where: { appointmentId } });
    if (existing) {
      return prisma.billing.update({
        where: { appointmentId },
        data: { consultationFee, medicineCost, total, paymentMethod },
        include: { appointment: { include: { patient: true } } },
      });
    }

    return prisma.billing.create({
      data: {
        appointmentId,
        consultationFee,
        medicineCost,
        total,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: { appointment: { include: { patient: true } } },
    });
  }

  async getBillByAppointment(appointmentId: string) {
    return prisma.billing.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            patient: true,
            consultation: { include: { prescriptions: true } },
          },
        },
      },
    });
  }

  async getBillById(id: string) {
    return prisma.billing.findUnique({
      where: { id },
      include: {
        appointment: { include: { patient: true } },
      },
    });
  }

  async markPaymentPaid(
    billingId: string,
    paymentMethod: string = 'CASH',
    transactionId?: string
  ) {
    const bill = await prisma.billing.update({
      where: { id: billingId },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod,
        transactionId,
        paidAt: new Date(),
      },
      include: {
        appointment: { include: { patient: true } },
      },
    });

    // Send payment receipt via WhatsApp
    await messagingService.sendPaymentReceipt(
      bill.appointment.patient.phone,
      bill.appointment.patient.name,
      Number(bill.total),
      bill.paymentMethod,
      bill.id
    );

    return bill;
  }

  async getTodayRevenue() {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const today = new Date(todayStr + 'T00:00:00.000Z');
    const tomorrow = new Date(todayStr + 'T00:00:00.000Z');
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const bills = await prisma.billing.findMany({
      where: {
        paidAt: { gte: today, lt: tomorrow },
        paymentStatus: PaymentStatus.COMPLETED,
      },
      select: { total: true },
    });

    return bills.reduce((sum, b) => sum + Number(b.total), 0);
  }
}

export const billingService = new BillingService();
