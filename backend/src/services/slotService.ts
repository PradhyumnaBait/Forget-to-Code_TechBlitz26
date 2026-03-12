import prisma from '../config/database';
import { AppointmentStatus } from '../types';

// Doctor works Mon–Sat by default (1=Mon...6=Sat)
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];
const SLOT_DURATION_MINUTES = 30;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMins: number
): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + durationMins <= end) {
    slots.push(minutesToTime(current));
    current += durationMins;
  }

  return slots;
}

export class SlotService {
  async getAvailableDates(daysAhead = 14): Promise<string[]> {
    const settings = await this.getClinicSettings();
    const workingDays = settings.workingDays
      .split(',')
      .map(Number);

    const dates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // JS getDay(): 0=Sun, 1=Mon ... 6=Sat
      // Our convention: 1=Mon ... 7=Sun
      const jsDay = date.getDay();
      const ourDay = jsDay === 0 ? 7 : jsDay;

      if (workingDays.includes(ourDay)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    return dates;
  }

  async getAvailableSlots(dateStr: string): Promise<string[]> {
    const settings = await this.getClinicSettings();
    const allSlots = generateTimeSlots(
      settings.workingHourStart,
      settings.workingHourEnd,
      settings.slotDuration
    );

    const date = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get booked/reserved slots for the day
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: date, lt: nextDay },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.RESCHEDULED, AppointmentStatus.NO_SHOW] },
      },
      select: { timeSlot: true },
    });

    const reservedSlots = await prisma.slot.findMany({
      where: {
        date: { gte: date, lt: nextDay },
        status: 'RESERVED',
        reservedUntil: { gt: new Date() },
      },
      select: { timeSlot: true },
    });

    const unavailable = new Set([
      ...bookedAppointments.map((a) => a.timeSlot),
      ...reservedSlots.map((s) => s.timeSlot),
    ]);

    return allSlots.filter((slot) => !unavailable.has(slot));
  }

  async reserveSlot(dateStr: string, timeSlot: string): Promise<boolean> {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      await prisma.slot.upsert({
        where: {
          date_timeSlot: { date, timeSlot },
        },
        update: { status: 'RESERVED', reservedUntil },
        create: { date, timeSlot, status: 'RESERVED', reservedUntil },
      });
      return true;
    } catch {
      return false;
    }
  }

  async markSlotBooked(dateStr: string, timeSlot: string): Promise<void> {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    await prisma.slot.upsert({
      where: { date_timeSlot: { date, timeSlot } },
      update: { status: 'BOOKED', reservedUntil: null },
      create: { date, timeSlot, status: 'BOOKED' },
    });
  }

  async releaseSlot(dateStr: string, timeSlot: string): Promise<void> {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    await prisma.slot.upsert({
      where: { date_timeSlot: { date, timeSlot } },
      update: { status: 'AVAILABLE', reservedUntil: null },
      create: { date, timeSlot, status: 'AVAILABLE' },
    });
  }

  // Release expired reservations — called by cron
  async releaseExpiredReservations(): Promise<number> {
    const result = await prisma.slot.updateMany({
      where: {
        status: 'RESERVED',
        reservedUntil: { lt: new Date() },
      },
      data: { status: 'AVAILABLE', reservedUntil: null },
    });
    return result.count;
  }

  private async getClinicSettings() {
    let settings = await prisma.clinicSettings.findFirst();
    if (!settings) {
      // Create defaults
      settings = await prisma.clinicSettings.create({
        data: {
          clinicName: 'MedDesk Clinic',
          phone: '+91000000000',
          workingHourStart: '09:00',
          workingHourEnd: '18:00',
          slotDuration: SLOT_DURATION_MINUTES,
          consultationFee: 500,
          workingDays: '1,2,3,4,5,6',
        },
      });
    }
    return settings;
  }
}

export const slotService = new SlotService();
