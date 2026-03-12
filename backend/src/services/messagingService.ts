import prisma from '../config/database';
import { twilioClient } from '../config/twilio';
import { env } from '../config/environment';
import { NotificationChannel } from '../types';

class MessagingService {
  private async logNotification(
    phone: string,
    type: string,
    message: string,
    status: string,
    patientId?: string,
    appointmentId?: string
  ) {
    await prisma.notification.create({
      data: { phone, type, message, channel: NotificationChannel.WHATSAPP, status, patientId, appointmentId },
    });
  }

  private async send(phone: string, message: string): Promise<boolean> {
    if (twilioClient && env.TWILIO_ENABLED) {
      try {
        const from = env.TWILIO_WHATSAPP_NUMBER
          ? `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`
          : env.TWILIO_PHONE_NUMBER;
        await twilioClient.messages.create({
          body: message,
          from,
          to: env.TWILIO_WHATSAPP_NUMBER ? `whatsapp:${phone}` : phone,
        });
        return true;
      } catch (err) {
        console.error('[Twilio Error]', err);
        return false;
      }
    } else {
      console.log(`\n📲 [DEV MSG → ${phone}]:\n${message}\n`);
      return true;
    }
  }

  async sendAppointmentConfirmation(
    phone: string,
    name: string,
    date: string,
    timeSlot: string,
    appointmentId: string
  ) {
    const message = `✅ Hello ${name}!\n\nYour appointment at MedDesk Clinic has been *confirmed*.\n\n📅 Date: ${date}\n🕐 Time: ${timeSlot}\n\nPlease arrive 10 minutes early. Reply *STATUS* to check your queue position.`;
    const ok = await this.send(phone, message);
    await this.logNotification(phone, 'APPOINTMENT_BOOKED', message, ok ? 'SENT' : 'FAILED', undefined, appointmentId);
  }

  async sendCancellationNotification(
    phone: string,
    name: string,
    date: string,
    timeSlot: string
  ) {
    const message = `❌ Hello ${name},\n\nYour appointment on *${date}* at *${timeSlot}* has been *cancelled*.\n\nTo rebook, please visit our website or reply *BOOK* here.`;
    const ok = await this.send(phone, message);
    await this.logNotification(phone, 'APPOINTMENT_CANCELLED', message, ok ? 'SENT' : 'FAILED');
  }

  async sendRescheduleNotification(
    phone: string,
    name: string,
    newDate: string,
    newTimeSlot: string
  ) {
    const message = `🔄 Hello ${name},\n\nYour appointment has been *rescheduled*.\n\n📅 New Date: ${newDate}\n🕐 New Time: ${newTimeSlot}\n\nWe look forward to seeing you!`;
    const ok = await this.send(phone, message);
    await this.logNotification(phone, 'APPOINTMENT_RESCHEDULED', message, ok ? 'SENT' : 'FAILED');
  }

  async sendReminder(
    phone: string,
    name: string,
    date: string,
    timeSlot: string,
    hoursAhead: number
  ) {
    const msg = hoursAhead <= 1
      ? `⏰ Reminder: Your appointment at MedDesk is in *1 hour* (${timeSlot}). Please head over soon!`
      : `📅 Reminder, ${name}! Your appointment tomorrow at *${timeSlot}* is confirmed. See you then!`;
    const ok = await this.send(phone, msg);
    await this.logNotification(phone, `APPOINTMENT_REMINDER_${hoursAhead}H`, msg, ok ? 'SENT' : 'FAILED');
  }

  async sendPaymentReceipt(
    phone: string,
    name: string,
    total: number,
    method: string,
    billingId: string
  ) {
    const message = `🧾 *MedDesk Payment Receipt*\n\nThank you, ${name}!\n\n💰 Amount Paid: ₹${total.toFixed(2)}\n💳 Method: ${method}\n🆔 Receipt ID: ${billingId}\n\nGet well soon! 🌿`;
    const ok = await this.send(phone, message);
    await this.logNotification(phone, 'PAYMENT_RECEIVED', message, ok ? 'SENT' : 'FAILED');
  }

  async sendCustomMessage(phone: string, message: string): Promise<boolean> {
    return this.send(phone, message);
  }
}

export const messagingService = new MessagingService();
