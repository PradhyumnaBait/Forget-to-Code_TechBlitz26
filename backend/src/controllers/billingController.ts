import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { billingService } from '../services/billingService';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

const createBillSchema = z.object({
  appointmentId: z.string(),
  consultationFee: z.number().nonnegative(),
  medicineCost: z.number().nonnegative().optional(),
  paymentMethod: z.string().optional(),
});

export const createBill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createBillSchema.parse(req.body);
    const bill = await billingService.createBill(data);
    res.status(201).json(successResponse('Bill created', bill));
  } catch (err) {
    next(err);
  }
};

export const getBillByAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bill = await billingService.getBillByAppointment(req.params['appointmentId']!);
    if (!bill) {
      res.status(404).json(errorResponse('Bill not found'));
      return;
    }
    res.json(successResponse('Bill retrieved', bill));
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentMethod, transactionId } = z
      .object({
        paymentMethod: z.string().default('CASH'),
        transactionId: z.string().optional(),
      })
      .parse(req.body);

    const bill = await billingService.markPaymentPaid(
      req.params['id']!,
      paymentMethod,
      transactionId
    );
    res.json(successResponse('Payment recorded', bill));
  } catch (err) {
    next(err);
  }
};

export const downloadReceipt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bill = await billingService.getBillById(req.params['id']!);
    if (!bill) {
      res.status(404).json(errorResponse('Bill not found'));
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${bill.id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('MedDesk Clinic', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Receipt ID: ${bill.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Patient Details');
    doc.font('Helvetica');
    doc.text(`Name: ${bill.appointment.patient.name}`);
    doc.text(`Phone: ${bill.appointment.patient.phone}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Bill Summary');
    doc.font('Helvetica');
    doc.text(`Consultation Fee: ₹${Number(bill.consultationFee).toFixed(2)}`);
    doc.text(`Medicine Cost: ₹${Number(bill.medicineCost).toFixed(2)}`);
    doc.moveTo(50, doc.y + 5).lineTo(250, doc.y + 5).stroke();
    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Total: ₹${Number(bill.total).toFixed(2)}`);
    doc.font('Helvetica');
    doc.text(`Payment Method: ${bill.paymentMethod}`);
    doc.text(`Status: ${bill.paymentStatus}`);
    if (bill.transactionId) doc.text(`Transaction ID: ${bill.transactionId}`);

    doc.end();
  } catch (err) {
    next(err);
  }
};

export const getTodayRevenue = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const revenue = await billingService.getTodayRevenue();
    res.json(successResponse('Today\'s revenue', { revenue }));
  } catch (err) {
    next(err);
  }
};
