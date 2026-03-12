import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { prescriptionService } from '../services/prescriptionService';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

const prescriptionSchema = z.object({
  consultationId: z.string(),
  patientId: z.string(),
  medicine: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.number().int().positive(),
  notes: z.string().optional(),
});

const bulkSchema = z.object({
  consultationId: z.string(),
  patientId: z.string(),
  medicines: z.array(
    z.object({
      medicine: z.string(),
      dose: z.string(),
      frequency: z.string(),
      duration: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ).min(1),
});

export const createPrescription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = prescriptionSchema.parse(req.body);
    const prescription = await prescriptionService.createPrescription(data);
    res.status(201).json(successResponse('Prescription created', prescription));
  } catch (err) {
    next(err);
  }
};

export const createBulkPrescriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { consultationId, patientId, medicines } = bulkSchema.parse(req.body);
    const result = await prescriptionService.createBulkPrescriptions(consultationId, patientId, medicines);
    res.status(201).json(successResponse(`${result.count} prescriptions created`, { count: result.count }));
  } catch (err) {
    next(err);
  }
};

export const getPrescriptionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params['id']!);
    if (!prescription) {
      res.status(404).json(errorResponse('Prescription not found'));
      return;
    }
    res.json(successResponse('Prescription retrieved', prescription));
  } catch (err) {
    next(err);
  }
};

export const downloadPrescriptionPDF = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params['id']!);
    if (!prescription) {
      res.status(404).json(errorResponse('Prescription not found'));
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prescription-${prescription.id}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MedDesk Clinic', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Consultation Prescription', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Patient info
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Information');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Name: ${prescription.patient.name}`);
    doc.text(`Phone: ${prescription.patient.phone}`);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown();

    // Prescription
    doc.fontSize(12).font('Helvetica-Bold').text('Prescription');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Medicine: ${prescription.medicine}`);
    doc.text(`Dose: ${prescription.dose}`);
    doc.text(`Frequency: ${prescription.frequency}`);
    doc.text(`Duration: ${prescription.duration} days`);
    if (prescription.notes) doc.text(`Notes: ${prescription.notes}`);

    // Diagnosis
    if (prescription.consultation.diagnosis) {
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text('Diagnosis');
      doc.fontSize(10).font('Helvetica').text(prescription.consultation.diagnosis);
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};

export const deletePrescription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prescriptionService.deletePrescription(req.params['id']!);
    res.json(successResponse('Prescription deleted'));
  } catch (err) {
    next(err);
  }
};
