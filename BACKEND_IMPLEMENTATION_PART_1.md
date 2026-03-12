# ClinicOS Backend Implementation - Complete Code Guide
## Backend Only (Frontend handled separately)

---

## 📋 Overview

This guide contains **all backend code** needed to build the complete API layer for ClinicOS. The frontend will consume these APIs separately.

**Focus:** Node.js + Express + PostgreSQL + Prisma  
**Scope:** Authentication, Booking, Queue, Consultations, Billing, Analytics  
**Output:** Production-ready REST APIs  

---

## Part 1: Project Initialization

### Create Project Structure
```bash
mkdir clinic-backend
cd clinic-backend
npm init -y
npm install express cors helmet express-rate-limit dotenv
npm install @prisma/client prisma
npm install bcryptjs jsonwebtoken
npm install twilio nodemailer
npm install zod joi
npm install -D typescript @types/node @types/express ts-node nodemon
npm install node-cron
```

### Create Folders
```bash
mkdir -p src/{config,routes,controllers,services,repositories,middlewares,utils,types}
mkdir -p prisma
mkdir -p logs
```

---

## Part 2: Configuration Files

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `.env` Template
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clinic_db"

# JWT
JWT_SECRET="your-super-secret-key-min-32-characters-long-here"
JWT_EXPIRY="7d"

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid (Email)
SENDGRID_API_KEY="SG..."
SENDGRID_FROM_EMAIL="clinic@example.com"

# App
NODE_ENV="development"
PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Logging
LOG_LEVEL="debug"
```

### `package.json` Scripts
```json
{
  "name": "clinic-backend",
  "version": "1.0.0",
  "description": "ClinicOS Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "keywords": ["clinic", "appointment", "management"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.1.2",
    "node-cron": "^3.0.2",
    "nodemailer": "^6.9.7",
    "twilio": "^3.98.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcryptjs": "^2.4.6",
    "nodemon": "^3.0.2",
    "prisma": "^5.7.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

---

## Part 3: Prisma Database Schema

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== Users ====================
model User {
  id            String   @id @default(cuid())
  phone         String   @unique @db.VarChar(15)
  email         String?  @unique @db.VarChar(255)
  name          String   @db.VarChar(255)
  role          String   @default("RECEPTIONIST")
  isOtpVerified Boolean  @default(false)
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("users")
}

// ==================== Patients ====================
model Patient {
  id             String          @id @default(cuid())
  name           String          @db.VarChar(255)
  phone          String          @unique @db.VarChar(15)
  email          String?         @db.VarChar(255)
  age            Int?
  gender         String?         @db.VarChar(20)
  bloodGroup     String?         @db.VarChar(5)
  medicalHistory String?         @db.Text
  allergies      String?         @db.Text
  
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  appointments   Appointment[]
  consultations  Consultation[]
  prescriptions  Prescription[]

  @@map("patients")
}

// ==================== Appointments ====================
model Appointment {
  id        String   @id @default(cuid())
  patientId String
  patient   Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  date       DateTime
  timeSlot   String   @db.VarChar(10)
  duration   Int      @default(30)
  status     String   @default("BOOKED")
  reason     String?  @db.Text
  notes      String?  @db.Text

  consultation Consultation?
  billing      Billing?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([date, timeSlot])
  @@index([patientId])
  @@index([date])
  @@index([status])
  @@map("appointments")
}

// ==================== Slots ====================
model Slot {
  id           String    @id @default(cuid())
  date         DateTime
  timeSlot     String    @db.VarChar(10)
  status       String    @default("AVAILABLE")
  reservedUntil DateTime?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@unique([date, timeSlot])
  @@index([date])
  @@index([status])
  @@map("slots")
}

// ==================== Consultations ====================
model Consultation {
  id            String @id @default(cuid())
  appointmentId String @unique
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  patientId String
  patient   Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  notes         String? @db.Text
  diagnosis     String? @db.Text
  advice        String? @db.Text
  treatmentPlan String? @db.Text

  prescriptions Prescription[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([appointmentId])
  @@map("consultations")
}

// ==================== Prescriptions ====================
model Prescription {
  id            String @id @default(cuid())
  consultationId String
  consultation  Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)

  patientId String
  patient   Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  medicine   String @db.VarChar(255)
  dose       String @db.VarChar(100)
  frequency  String @db.VarChar(100)
  duration   Int
  notes      String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([consultationId])
  @@map("prescriptions")
}

// ==================== Billing ====================
model Billing {
  id             String @id @default(cuid())
  appointmentId  String @unique
  appointment    Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  consultationFee Decimal @default(0) @db.Decimal(10, 2)
  medicineCost    Decimal @default(0) @db.Decimal(10, 2)
  total           Decimal @db.Decimal(10, 2)

  paymentStatus  String @default("PENDING")
  paymentMethod  String @default("CASH")
  transactionId  String? @unique
  paidAt         DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([appointmentId])
  @@index([paymentStatus])
  @@map("billing")
}

// ==================== Notifications ====================
model Notification {
  id        String   @id @default(cuid())
  patientId String?
  phone     String?  @db.VarChar(15)
  
  type      String   // APPOINTMENT_BOOKED, REMINDER_24H, etc.
  message   String   @db.Text
  channel   String   // WHATSAPP, EMAIL, SMS
  
  sentAt    DateTime?
  status    String   @default("PENDING")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([patientId])
  @@index([status])
  @@map("notifications")
}

// ==================== OTP ====================
model OTP {
  id         String   @id @default(cuid())
  phone      String   @unique @db.VarChar(15)
  code       String   @db.VarChar(6)
  attempts   Int      @default(0)
  maxAttempts Int     @default(3)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([phone])
  @@map("otps")
}

// ==================== Clinic Settings ====================
model ClinicSettings {
  id                String @id @default(cuid())
  
  clinicName        String @db.VarChar(255)
  phone             String @db.VarChar(15)
  email             String? @db.VarChar(255)
  address           String? @db.Text
  
  workingHourStart  String @default("09:00")
  workingHourEnd    String @default("18:00")
  slotDuration      Int @default(30)
  consultationFee   Decimal @default(500) @db.Decimal(10, 2)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("clinic_settings")
}
```

---

## Part 4: Environment & Configuration

### `src/config/environment.ts`
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  // SendGrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || '',
  
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_URL: process.env.API_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Validate critical env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing environment variable: ${envVar}`);
  }
});
```

### `src/config/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

export default prisma;
```

---

## Part 5: Types & Interfaces

### `src/types/index.ts`
```typescript
import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

export interface AuthPayload {
  userId: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface OTPPayload {
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

export interface AppointmentCreateDTO {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

export interface ConsultationDTO {
  appointmentId: string;
  notes?: string;
  diagnosis?: string;
  advice?: string;
  treatmentPlan?: string;
}

export interface PrescriptionDTO {
  consultationId: string;
  medicine: string;
  dose: string;
  frequency: string;
  duration: number;
  notes?: string;
}

export interface BillingDTO {
  appointmentId: string;
  consultationFee: number;
  medicineCost: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

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
}

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
```

---

## Part 6: Middleware

### `src/middlewares/authMiddleware.ts`
```typescript
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { AuthRequest, JWTPayload } from '../types';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const prisma = require('../config/database').default;
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - Insufficient permissions',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};
```

### `src/middlewares/errorMiddleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode}: ${message}`, error);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.stack }),
  });
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### `src/middlewares/rateLimiter.ts`
```typescript
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // max 3 OTP attempts
  skipSuccessfulRequests: true,
  message: 'Too many OTP attempts, please try again later',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts
  skipSuccessfulRequests: false,
  message: 'Too many login attempts, please try again later',
});
```

---

## Part 7: Services (Business Logic)

### `src/services/otpService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import { env } from '../config/environment';

const prisma = new PrismaClient();

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

export class OTPService {
  private twilioClient = twilio(
    env.TWILIO_ACCOUNT_SID,
    env.TWILIO_AUTH_TOKEN
  );

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isValidPhone(phone)) {
        return { success: false, message: 'Invalid phone number' };
      }

      // Generate 6-digit OTP
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // Delete existing OTPs for this phone
      await prisma.oTP.deleteMany({ where: { phone } });

      // Save new OTP
      await prisma.oTP.create({
        data: {
          phone,
          code,
          expiresAt,
          attempts: 0,
        },
      });

      // Send SMS
      await this.twilioClient.messages.create({
        body: `Your ClinicOS verification code is: ${code}. Valid for 5 minutes.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ OTP sent to ${phone}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  async verifyOTP(
    phone: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
    userId?: string;
    token?: string;
  }> {
    try {
      const otpRecord = await prisma.oTP.findUnique({ where: { phone } });

      if (!otpRecord) {
        return { success: false, message: 'OTP expired or not found' };
      }

      if (otpRecord.expiresAt < new Date()) {
        await prisma.oTP.delete({ where: { phone } });
        return { success: false, message: 'OTP expired' };
      }

      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return { success: false, message: 'Max OTP attempts exceeded' };
      }

      if (otpRecord.code !== code) {
        await prisma.oTP.update({
          where: { phone },
          data: { attempts: otpRecord.attempts + 1 },
        });
        return { success: false, message: 'Invalid OTP' };
      }

      // OTP valid - create or update user
      const user = await prisma.user.upsert({
        where: { phone },
        update: { isOtpVerified: true },
        create: {
          phone,
          name: '',
          role: 'RECEPTIONIST',
          isOtpVerified: true,
        },
      });

      // Delete OTP record
      await prisma.oTP.delete({ where: { phone } });

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user.id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRY }
      );

      console.log(`✅ User ${user.id} verified via OTP`);

      return {
        success: true,
        message: 'OTP verified successfully',
        userId: user.id,
        token,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }
}

export const otpService = new OTPService();
```

### `src/services/slotService.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SlotService {
  async getAvailableSlots(dateString: string): Promise<string[]> {
    try {
      const settings = await prisma.clinicSettings.findFirst();
      if (!settings) throw new Error('Clinic settings not found');

      const [startHour, startMin] = settings.workingHourStart
        .split(':')
        .map(Number);
      const [endHour, endMin] = settings.workingHourEnd.split(':').map(Number);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Generate all slots for the day
      const slots: string[] = [];
      for (let time = startTime; time < endTime; time += settings.slotDuration) {
        const h = String(Math.floor(time / 60)).padStart(2, '0');
        const m = String(time % 60).padStart(2, '0');
        slots.push(`${h}:${m}`);
      }

      // Get booked slots for this date
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const booked = await prisma.appointment.findMany({
        where: {
          date: { gte: date, lt: nextDate },
          status: {
            in: ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED'],
          },
        },
        select: { timeSlot: true },
      });

      const bookedSlots = booked.map(a => a.timeSlot);
      const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  async getAvailableDates(daysAhead: number = 30): Promise<string[]> {
    try {
      const dates: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 1; i <= daysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Skip weekends (optional, configure based on clinic)
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          dates.push(date.toISOString().split('T')[0]);
        }
      }

      return dates;
    } catch (error) {
      console.error('Error getting available dates:', error);
      throw error;
    }
  }

  async reserveSlot(dateString: string, timeSlot: string): Promise<boolean> {
    try {
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      const reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5-minute hold

      await prisma.slot.upsert({
        where: { date_timeSlot: { date, timeSlot } },
        update: { status: 'RESERVED', reservedUntil },
        create: {
          date,
          timeSlot,
          status: 'RESERVED',
          reservedUntil,
        },
      });

      return true;
    } catch (error) {
      console.error('Error reserving slot:', error);
      return false;
    }
  }

  async releaseExpiredReservations(): Promise<void> {
    try {
      const result = await prisma.slot.updateMany({
        where: {
          status: 'RESERVED',
          reservedUntil: { lt: new Date() },
        },
        data: { status: 'AVAILABLE', reservedUntil: null },
      });

      if (result.count > 0) {
        console.log(`✅ Released ${result.count} expired slot reservations`);
      }
    } catch (error) {
      console.error('Error releasing expired reservations:', error);
    }
  }
}

export const slotService = new SlotService();
```

### `src/services/bookingService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { AppointmentCreateDTO } from '../types';
import { slotService } from './slotService';
import { messagingService } from './messagingService';

const prisma = new PrismaClient();

export class BookingService {
  async createAppointment(data: AppointmentCreateDTO) {
    try {
      // Validate slot availability
      const availableSlots = await slotService.getAvailableSlots(data.date);
      if (!availableSlots.includes(data.timeSlot)) {
        throw new Error('Selected slot is not available');
      }

      // Create or get patient
      const patient = await prisma.patient.upsert({
        where: { phone: data.patientPhone },
        update: {},
        create: {
          phone: data.patientPhone,
          name: data.patientName,
          email: data.patientEmail,
        },
      });

      // Create appointment
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(0, 0, 0, 0);

      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          date: appointmentDate,
          timeSlot: data.timeSlot,
          status: 'BOOKED',
          reason: data.reason,
        },
        include: { patient: true },
      });

      // Update slot status
      await prisma.slot.update({
        where: {
          date_timeSlot: { date: appointmentDate, timeSlot: data.timeSlot },
        },
        data: { status: 'BOOKED', reservedUntil: null },
      }).catch(() => {}); // Ignore if slot doesn't exist

      // Send confirmation notification
      await messagingService.sendBookingConfirmation(patient, appointment);

      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update appointment status
      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' },
        include: { patient: true },
      });

      // Free up slot
      await prisma.slot.updateMany({
        where: {
          date: appointment.date,
          timeSlot: appointment.timeSlot,
        },
        data: { status: 'AVAILABLE', reservedUntil: null },
      }).catch(() => {});

      // Send cancellation notification
      await messagingService.sendCancellationNotification(updated.patient, updated);

      return updated;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTimeSlot: string
  ) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check new slot availability
      const availableSlots = await slotService.getAvailableSlots(newDate);
      if (!availableSlots.includes(newTimeSlot)) {
        throw new Error('New slot is not available');
      }

      const newAppointmentDate = new Date(newDate);
      newAppointmentDate.setHours(0, 0, 0, 0);

      // Free old slot
      await prisma.slot.updateMany({
        where: {
          date: appointment.date,
          timeSlot: appointment.timeSlot,
        },
        data: { status: 'AVAILABLE', reservedUntil: null },
      }).catch(() => {});

      // Mark old appointment as rescheduled
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'RESCHEDULED' },
      });

      // Create new appointment
      const newAppointment = await prisma.appointment.create({
        data: {
          patientId: appointment.patientId,
          date: newAppointmentDate,
          timeSlot: newTimeSlot,
          status: 'BOOKED',
          reason: appointment.reason,
        },
        include: { patient: true },
      });

      // Book new slot
      await prisma.slot.upsert({
        where: { date_timeSlot: { date: newAppointmentDate, timeSlot: newTimeSlot } },
        update: { status: 'BOOKED', reservedUntil: null },
        create: {
          date: newAppointmentDate,
          timeSlot: newTimeSlot,
          status: 'BOOKED',
        },
      });

      // Send reschedule notification
      await messagingService.sendRescheduleNotification(
        appointment.patient,
        newAppointment
      );

      return newAppointment;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  async getAppointments(filters?: {
    status?: string;
    date?: string;
    patientId?: string;
  }) {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.date) {
        const date = new Date(filters.date);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        where.date = { gte: date, lt: nextDate };
      }
      if (filters?.patientId) {
        where.patientId = filters.patientId;
      }

      return await prisma.appointment.findMany({
        where,
        include: { patient: true, consultation: true, billing: true },
        orderBy: { date: 'asc' },
      });
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(appointmentId: string) {
    try {
      return await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          consultation: { include: { prescriptions: true } },
          billing: true,
        },
      });
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
```

### `src/services/queueService.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class QueueService {
  async checkInPatient(appointmentId: string) {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CHECKED_IN' },
        include: { patient: true },
      });

      return appointment;
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw error;
    }
  }

  async getQueueStatus() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all appointments for today
      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
          status: {
            in: ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED'],
          },
        },
        include: { patient: true },
        orderBy: { timeSlot: 'asc' },
      });

      // Find current patient (in consultation or checked in)
      const currentPatient = appointments.find(a =>
        ['IN_CONSULTATION', 'CHECKED_IN'].includes(a.status)
      );

      // Get waiting patients
      const waitingPatients = appointments.filter(
        a => a.status === 'BOOKED'
      );

      // Get next patient
      const nextPatient = waitingPatients[0] || null;

      return {
        currentPatient,
        nextPatient,
        waitingCount: waitingPatients.length,
        totalAppointments: appointments.length,
        waitingPatients,
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw error;
    }
  }

  async getEstimatedWaitTime(appointmentId: string): Promise<number> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Get all appointments before this one today that are not completed
      const appointmentsAhead = await prisma.appointment.findMany({
        where: {
          date: appointment.date,
          timeSlot: { lt: appointment.timeSlot },
          status: { in: ['CHECKED_IN', 'IN_CONSULTATION'] },
        },
      });

      // Assume 30 minutes per appointment
      const estimatedMinutes = appointmentsAhead.length * 30;
      return estimatedMinutes;
    } catch (error) {
      console.error('Error calculating wait time:', error);
      throw error;
    }
  }

  async startConsultation(appointmentId: string) {
    try {
      return await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'IN_CONSULTATION' },
        include: { patient: true },
      });
    } catch (error) {
      console.error('Error starting consultation:', error);
      throw error;
    }
  }

  async completeAppointment(appointmentId: string) {
    try {
      return await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
        include: { patient: true, consultation: true },
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }

  async markNoShow(appointmentId: string) {
    try {
      return await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'NO_SHOW' },
      });
    } catch (error) {
      console.error('Error marking no show:', error);
      throw error;
    }
  }
}

export const queueService = new QueueService();
```

### `src/services/consultationService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { ConsultationDTO } from '../types';

const prisma = new PrismaClient();

export class ConsultationService {
  async saveConsultation(data: ConsultationDTO) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const consultation = await prisma.consultation.upsert({
        where: { appointmentId: data.appointmentId },
        update: {
          notes: data.notes,
          diagnosis: data.diagnosis,
          advice: data.advice,
          treatmentPlan: data.treatmentPlan,
        },
        create: {
          appointmentId: data.appointmentId,
          patientId: appointment.patientId,
          notes: data.notes,
          diagnosis: data.diagnosis,
          advice: data.advice,
          treatmentPlan: data.treatmentPlan,
        },
      });

      return consultation;
    } catch (error) {
      console.error('Error saving consultation:', error);
      throw error;
    }
  }

  async getConsultation(appointmentId: string) {
    try {
      return await prisma.consultation.findUnique({
        where: { appointmentId },
        include: { prescriptions: true },
      });
    } catch (error) {
      console.error('Error getting consultation:', error);
      throw error;
    }
  }

  async getPatientHistory(patientId: string) {
    try {
      return await prisma.consultation.findMany({
        where: { patientId },
        include: { appointment: true, prescriptions: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error getting patient history:', error);
      throw error;
    }
  }
}

export const consultationService = new ConsultationService();
```

### `src/services/prescriptionService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { PrescriptionDTO } from '../types';

const prisma = new PrismaClient();

export class PrescriptionService {
  async createPrescription(data: PrescriptionDTO) {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id: data.consultationId },
      });

      if (!consultation) {
        throw new Error('Consultation not found');
      }

      const prescription = await prisma.prescription.create({
        data: {
          consultationId: data.consultationId,
          patientId: consultation.patientId,
          medicine: data.medicine,
          dose: data.dose,
          frequency: data.frequency,
          duration: data.duration,
          notes: data.notes,
        },
      });

      return prescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  async getPrescription(prescriptionId: string) {
    try {
      return await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { consultation: true, patient: true },
      });
    } catch (error) {
      console.error('Error getting prescription:', error);
      throw error;
    }
  }

  async getConsultationPrescriptions(consultationId: string) {
    try {
      return await prisma.prescription.findMany({
        where: { consultationId },
      });
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      throw error;
    }
  }

  async updatePrescription(prescriptionId: string, data: Partial<PrescriptionDTO>) {
    try {
      return await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          medicine: data.medicine,
          dose: data.dose,
          frequency: data.frequency,
          duration: data.duration,
          notes: data.notes,
        },
      });
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }

  async deletePrescription(prescriptionId: string) {
    try {
      return await prisma.prescription.delete({
        where: { id: prescriptionId },
      });
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }
}

export const prescriptionService = new PrescriptionService();
```

### `src/services/billingService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { BillingDTO } from '../types';

const prisma = new PrismaClient();

export class BillingService {
  async createBilling(data: BillingDTO) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const total = data.consultationFee + data.medicineCost;

      const billing = await prisma.billing.upsert({
        where: { appointmentId: data.appointmentId },
        update: {
          consultationFee: data.consultationFee,
          medicineCost: data.medicineCost,
          total,
        },
        create: {
          appointmentId: data.appointmentId,
          consultationFee: data.consultationFee,
          medicineCost: data.medicineCost,
          total,
          paymentStatus: 'PENDING',
        },
      });

      return billing;
    } catch (error) {
      console.error('Error creating billing:', error);
      throw error;
    }
  }

  async getBilling(appointmentId: string) {
    try {
      return await prisma.billing.findUnique({
        where: { appointmentId },
        include: { appointment: { include: { patient: true } } },
      });
    } catch (error) {
      console.error('Error getting billing:', error);
      throw error;
    }
  }

  async recordPayment(
    billingId: string,
    paymentMethod: string,
    transactionId?: string
  ) {
    try {
      return await prisma.billing.update({
        where: { id: billingId },
        data: {
          paymentStatus: 'COMPLETED',
          paymentMethod,
          transactionId,
          paidAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  async getDailyRevenue() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const billings = await prisma.billing.findMany({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: today, lt: tomorrow },
        },
      });

      const totalRevenue = billings.reduce((sum, b) => sum + Number(b.total), 0);
      return { totalRevenue, billingCount: billings.length };
    } catch (error) {
      console.error('Error getting daily revenue:', error);
      throw error;
    }
  }
}

export const billingService = new BillingService();
```

### `src/services/messagingService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { env } from '../config/environment';

const prisma = new PrismaClient();

export class MessagingService {
  private emailTransporter = nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: env.SENDGRID_API_KEY,
    },
  });

  async sendBookingConfirmation(patient: any, appointment: any) {
    try {
      const message = `Hi ${patient.name}, your appointment is confirmed for ${appointment.date.toLocaleDateString()} at ${appointment.timeSlot}. Reply CANCEL to cancel. -ClinicOS`;

      // Save notification
      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'APPOINTMENT_BOOKED',
          message,
          channel: 'WHATSAPP',
          status: 'PENDING',
        },
      });

      // Send email if available
      if (patient.email) {
        await this.sendEmail(
          patient.email,
          'Appointment Confirmation - ClinicOS',
          `Your appointment is confirmed for ${appointment.date.toLocaleDateString()} at ${appointment.timeSlot}`
        );
      }

      console.log(`✅ Booking confirmation sent to ${patient.phone}`);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  }

  async sendCancellationNotification(patient: any, appointment: any) {
    try {
      const message = `Your appointment on ${appointment.date.toLocaleDateString()} at ${appointment.timeSlot} has been cancelled. Please call to reschedule. -ClinicOS`;

      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'APPOINTMENT_CANCELLED',
          message,
          channel: 'WHATSAPP',
          status: 'PENDING',
        },
      });

      if (patient.email) {
        await this.sendEmail(
          patient.email,
          'Appointment Cancelled - ClinicOS',
          message
        );
      }

      console.log(`✅ Cancellation notification sent to ${patient.phone}`);
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  async sendRescheduleNotification(patient: any, newAppointment: any) {
    try {
      const message = `Your appointment has been rescheduled to ${newAppointment.date.toLocaleDateString()} at ${newAppointment.timeSlot}. -ClinicOS`;

      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'APPOINTMENT_RESCHEDULED',
          message,
          channel: 'WHATSAPP',
          status: 'PENDING',
        },
      });

      if (patient.email) {
        await this.sendEmail(
          patient.email,
          'Appointment Rescheduled - ClinicOS',
          message
        );
      }

      console.log(`✅ Reschedule notification sent to ${patient.phone}`);
    } catch (error) {
      console.error('Error sending reschedule notification:', error);
    }
  }

  async sendAppointmentReminder(patient: any, appointment: any) {
    try {
      const message = `Reminder: Your appointment is tomorrow at ${appointment.timeSlot}. Please arrive 10 minutes early. -ClinicOS`;

      await prisma.notification.create({
        data: {
          patientId: patient.id,
          type: 'APPOINTMENT_REMINDER_24H',
          message,
          channel: 'WHATSAPP',
          status: 'PENDING',
        },
      });

      console.log(`✅ Reminder sent to ${patient.phone}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  private async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.emailTransporter.sendMail({
        from: env.SENDGRID_FROM_EMAIL,
        to,
        subject,
        text,
        html: `<p>${text}</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

export const messagingService = new MessagingService();
```

### `src/services/analyticsService.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getTodayMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
        },
      });

      const completed = appointments.filter(a => a.status === 'COMPLETED').length;
      const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
      const noShow = appointments.filter(a => a.status === 'NO_SHOW').length;

      const billing = await prisma.billing.findMany({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: today, lt: tomorrow },
        },
      });

      const totalRevenue = billing.reduce((sum, b) => sum + Number(b.total), 0);

      return {
        totalAppointments: appointments.length,
        completed,
        cancelled,
        noShow,
        totalRevenue,
        noShowRate: appointments.length > 0 ? ((noShow / appointments.length) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error getting today metrics:', error);
      throw error;
    }
  }

  async getMonthlyMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setDate(1); // First day of month

      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: today, lt: nextMonth },
        },
      });

      const completed = appointments.filter(a => a.status === 'COMPLETED').length;
      const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;

      const billing = await prisma.billing.findMany({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: today, lt: nextMonth },
        },
      });

      const totalRevenue = billing.reduce((sum, b) => sum + Number(b.total), 0);

      return {
        totalAppointments: appointments.length,
        completed,
        cancelled,
        totalRevenue,
      };
    } catch (error) {
      console.error('Error getting monthly metrics:', error);
      throw error;
    }
  }

  async getNoShowRate() {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: last30Days },
          status: { in: ['NO_SHOW', 'COMPLETED'] },
        },
      });

      const noShow = appointments.filter(a => a.status === 'NO_SHOW').length;
      const rate = appointments.length > 0 ? ((noShow / appointments.length) * 100).toFixed(2) : 0;

      return {
        noShowCount: noShow,
        totalAppointments: appointments.length,
        rate,
      };
    } catch (error) {
      console.error('Error getting no-show rate:', error);
      throw error;
    }
  }

  async getPeakHours() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
        },
      });

      const peakHours: Record<string, number> = {};
      appointments.forEach(apt => {
        const hour = apt.timeSlot.split(':')[0];
        peakHours[hour] = (peakHours[hour] || 0) + 1;
      });

      return peakHours;
    } catch (error) {
      console.error('Error getting peak hours:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
```

---

## Part 8: Controllers

### `src/controllers/authController.ts`
```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';
import { otpService } from '../services/otpService';
import prisma from '../config/database';

export class AuthController {
  async sendOTP(req: AuthRequest, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number required',
        });
      }

      const result = await otpService.sendOTP(phone);

      if (result.success) {
        return res.json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error sending OTP',
      });
    }
  }

  async verifyOTP(req: AuthRequest, res: Response) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          message: 'Phone and code required',
        });
      }

      const result = await otpService.verifyOTP(phone, code);

      if (result.success) {
        return res.json({
          success: true,
          message: result.message,
          token: result.token,
          userId: result.userId,
        });
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error verifying OTP',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, phone: true, name: true, role: true, email: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        message: 'Profile retrieved',
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching profile',
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { name, email } = req.body;

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { ...(name && { name }), ...(email && { email }) },
      });

      return res.json({
        success: true,
        message: 'Profile updated',
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error updating profile',
      });
    }
  }
}

export const authController = new AuthController();
```

---

## Part 9: Routes (Continued in next section due to length)

Due to character limits, I'll create the routes file separately. Let me continue with the complete backend code...

### `src/routes/authRoutes.ts`
```typescript
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { otpLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/send-otp', otpLimiter, (req, res) =>
  authController.sendOTP(req, res)
);

router.post('/verify-otp', otpLimiter, (req, res) =>
  authController.verifyOTP(req, res)
);

router.get('/profile', authMiddleware, (req, res) =>
  authController.getProfile(req, res)
);

router.put('/profile', authMiddleware, (req, res) =>
  authController.updateProfile(req, res)
);

export default router;
```

### `src/routes/bookingRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware } from '../middlewares/authMiddleware';
import { bookingService } from '../services/bookingService';
import { slotService } from '../services/slotService';

const router = Router();

// Get available dates
router.get('/available-dates', async (req: AuthRequest, res: Response) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const dates = await slotService.getAvailableDates(daysAhead);
    res.json({ success: true, dates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available slots
router.get('/slots', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date required',
      });
    }

    const slots = await slotService.getAvailableSlots(date as string);
    res.json({ success: true, slots });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create appointment
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientName, patientPhone, patientEmail, date, timeSlot, reason } = req.body;

    if (!patientName || !patientPhone || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const appointment = await bookingService.createAppointment({
      patientName,
      patientPhone,
      patientEmail,
      date,
      timeSlot,
      reason,
    });

    res.json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel appointment
router.post('/cancel/:appointmentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const result = await bookingService.cancelAppointment(appointmentId);

    res.json({
      success: true,
      message: 'Appointment cancelled',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reschedule appointment
router.post('/reschedule/:appointmentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'New date and time slot required',
      });
    }

    const result = await bookingService.rescheduleAppointment(
      appointmentId,
      newDate,
      newTimeSlot
    );

    res.json({
      success: true,
      message: 'Appointment rescheduled',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

I'll continue in the next message with more routes and the main server file...
