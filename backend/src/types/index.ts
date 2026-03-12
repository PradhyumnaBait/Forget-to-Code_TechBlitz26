import { Request } from 'express';

// ==================== Auth ====================
export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    phone: string;
    name: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

// ==================== Enums ====================
export enum UserRole {
  RECEPTIONIST = 'RECEPTIONIST',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CHECKED_IN = 'CHECKED_IN',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}

export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_REMINDER_24H = 'APPOINTMENT_REMINDER_24H',
  APPOINTMENT_REMINDER_1H = 'APPOINTMENT_REMINDER_1H',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  CONSULTATION_COMPLETED = 'CONSULTATION_COMPLETED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
}

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AIIntent {
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT',
  RESCHEDULE_APPOINTMENT = 'RESCHEDULE_APPOINTMENT',
  CHECK_APPOINTMENT = 'CHECK_APPOINTMENT',
  CLINIC_INFO = 'CLINIC_INFO',
  QUEUE_STATUS = 'QUEUE_STATUS',
  UNKNOWN = 'UNKNOWN',
}

// ==================== DTOs ====================
export interface AppointmentCreateDTO {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

export interface ConsultationCreateDTO {
  appointmentId: string;
  patientId: string;
  notes?: string;
  diagnosis?: string;
  advice?: string;
  treatmentPlan?: string;
}

export interface PrescriptionCreateDTO {
  consultationId: string;
  patientId: string;
  medicine: string;
  dose: string;
  frequency: string;
  duration: number;
  notes?: string;
}

export interface BillingCreateDTO {
  appointmentId: string;
  consultationFee: number;
  medicineCost?: number;
  paymentMethod?: string;
}

// ==================== API Response ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (
  message: string,
  error?: string
): ApiResponse => ({
  success: false,
  message,
  error,
});
