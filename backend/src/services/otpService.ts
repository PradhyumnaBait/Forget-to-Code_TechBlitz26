import prisma from '../config/database';
import { env } from '../config/environment';
import { twilioClient } from '../config/twilio';
import jwt from 'jsonwebtoken';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class OTPService {
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert OTP record
    await prisma.oTP.upsert({
      where: { phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone, code, expiresAt, attempts: 0, maxAttempts: MAX_OTP_ATTEMPTS },
    });

    if (twilioClient && env.TWILIO_ENABLED) {
      try {
        await twilioClient.messages.create({
          body: `Your MedDesk verification code is: ${code}. Valid for 5 minutes.`,
          from: env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      } catch (err) {
        console.error('Twilio send error:', err);
        return { success: false, message: 'Failed to send OTP via SMS' };
      }
    } else {
      // Dev mode — log to console
      console.log(`\n📱 [DEV MODE] OTP for ${phone}: ${code}\n`);
    }

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOTP(
    phone: string,
    code: string,
    name?: string,
    age?: number
  ): Promise<{ success: boolean; message: string; token?: string; patientId?: string }> {
    const record = await prisma.oTP.findUnique({ where: { phone } });

    if (!record) {
      return { success: false, message: 'OTP not found or already used' };
    }

    if (record.expiresAt < new Date()) {
      await prisma.oTP.delete({ where: { phone } });
      return { success: false, message: 'OTP has expired' };
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      return { success: false, message: 'Maximum OTP attempts exceeded. Request a new OTP.' };
    }

    if (record.code !== code) {
      await prisma.oTP.update({
        where: { phone },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_OTP_ATTEMPTS - record.attempts - 1;
      return { success: false, message: `Invalid OTP. ${remaining} attempts remaining.` };
    }

    // Valid — delete OTP
    await prisma.oTP.delete({ where: { phone } });

    // Upsert patient — use provided name if given, else keep existing or default
    const realName = name && name.trim().length > 0 ? name.trim() : undefined;
    const patient = await prisma.patient.upsert({
      where: { phone },
      update: {
        // Only update name if we have a real one (not 'New Patient')
        ...(realName ? { name: realName } : {}),
        ...(age ? { age } : {}),
      },
      create: { phone, name: realName ?? 'New Patient', age },
    });

    const token = jwt.sign({ userId: patient.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    } as jwt.SignOptions);

    return { success: true, message: 'OTP verified', token, patientId: patient.id };
  }
}

export const otpService = new OTPService();
