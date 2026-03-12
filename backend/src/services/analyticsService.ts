import prisma from '../config/database';
import { AppointmentStatus, PaymentStatus } from '../types';

export class AnalyticsService {
  async getDailyStats(dateStr?: string) {
    const date = dateStr ? new Date(dateStr + 'T00:00:00.000Z') : new Date();
    date.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const [
      totalAppointments,
      completed,
      cancelled,
      noShow,
      checkedIn,
      inConsultation,
      revenue,
    ] = await Promise.all([
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay } } }),
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay }, status: AppointmentStatus.COMPLETED } }),
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay }, status: AppointmentStatus.CANCELLED } }),
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay }, status: AppointmentStatus.NO_SHOW } }),
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay }, status: AppointmentStatus.CHECKED_IN } }),
      prisma.appointment.count({ where: { date: { gte: date, lt: nextDay }, status: AppointmentStatus.IN_CONSULTATION } }),
      prisma.billing.findMany({
        where: { paidAt: { gte: date, lt: nextDay }, paymentStatus: PaymentStatus.COMPLETED },
        select: { total: true },
      }),
    ]);

    const revenueTotal = revenue.reduce((sum, b) => sum + Number(b.total), 0);
    const noShowRate = totalAppointments > 0 ? (noShow / totalAppointments) * 100 : 0;

    return {
      date: date.toISOString().split('T')[0],
      appointments_today: totalAppointments,
      completed,
      cancelled,
      no_show: noShow,
      checked_in: checkedIn,
      in_consultation: inConsultation,
      revenue_today: revenueTotal,
      no_show_rate: Math.round(noShowRate * 100) / 100,
    };
  }

  async getMonthlyRevenue(year?: number, month?: number) {
    const now = new Date();
    const y = year || now.getUTCFullYear();
    const m = month ?? now.getUTCMonth(); // 0-indexed

    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));

    const bills = await prisma.billing.findMany({
      where: {
        paidAt: { gte: start, lt: end },
        paymentStatus: PaymentStatus.COMPLETED,
      },
      select: { total: true, paidAt: true },
    });

    // Group by day
    const byDay: Record<string, number> = {};
    bills.forEach((b) => {
      const day = b.paidAt!.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + Number(b.total);
    });

    return {
      year: y,
      month: m + 1,
      total_revenue: bills.reduce((sum, b) => sum + Number(b.total), 0),
      transactions: bills.length,
      by_day: byDay,
    };
  }

  async getPeakHours() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
        status: AppointmentStatus.COMPLETED,
      },
      select: { timeSlot: true },
    });

    const hourCounts: Record<string, number> = {};
    appointments.forEach((a) => {
      const hour = a.timeSlot.split(':')[0] + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sorted = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({ hour, count }));

    return { peak_hours: sorted };
  }

  async getNoShowRate(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, noShow] = await Promise.all([
      prisma.appointment.count({ where: { date: { gte: since } } }),
      prisma.appointment.count({ where: { date: { gte: since }, status: AppointmentStatus.NO_SHOW } }),
    ]);

    return {
      period_days: days,
      total_appointments: total,
      no_shows: noShow,
      no_show_rate: total > 0 ? Math.round((noShow / total) * 10000) / 100 : 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
