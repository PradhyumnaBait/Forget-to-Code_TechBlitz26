import cron from 'node-cron';
import prisma from '../config/database';
import { messagingService } from '../services/messagingService';
import { slotService } from '../services/slotService';
import { AppointmentStatus } from '../types';

export function startScheduler() {
  // ─── Release expired slot reservations every 5 minutes ───
  cron.schedule('*/5 * * * *', async () => {
    try {
      const released = await slotService.releaseExpiredReservations();
      if (released > 0) {
        console.log(`[Cron] Released ${released} expired slot reservation(s)`);
      }
    } catch (err) {
      console.error('[Cron] releaseExpiredReservations error:', err);
    }
  });

  // ─── Send 24-hour appointment reminders — runs every hour ───
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: in24h, lt: in25h },
          status: AppointmentStatus.BOOKED,
        },
        include: { patient: true },
      });

      for (const apt of appointments) {
        await messagingService.sendReminder(
          apt.patient.phone,
          apt.patient.name,
          apt.date.toISOString().split('T')[0],
          apt.timeSlot,
          24
        );
      }

      if (appointments.length > 0) {
        console.log(`[Cron] Sent 24h reminders to ${appointments.length} patient(s)`);
      }
    } catch (err) {
      console.error('[Cron] 24h reminder error:', err);
    }
  });

  // ─── Send 1-hour appointment reminders — runs every hour ───
  cron.schedule('15 * * * *', async () => {
    try {
      const now = new Date();
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      const in1h15m = new Date(now.getTime() + 75 * 60 * 1000);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: in1h, lt: in1h15m },
          status: AppointmentStatus.BOOKED,
        },
        include: { patient: true },
      });

      for (const apt of appointments) {
        await messagingService.sendReminder(
          apt.patient.phone,
          apt.patient.name,
          apt.date.toISOString().split('T')[0],
          apt.timeSlot,
          1
        );
      }

      if (appointments.length > 0) {
        console.log(`[Cron] Sent 1h reminders to ${appointments.length} patient(s)`);
      }
    } catch (err) {
      console.error('[Cron] 1h reminder error:', err);
    }
  });

  console.log('✅ Scheduler started (slot cleanup, 24h & 1h reminders)');
}
