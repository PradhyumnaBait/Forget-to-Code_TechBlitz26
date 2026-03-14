/**
 * MedDesk API Client
 * Centralises all backend calls. Base URL is read from the env var
 * NEXT_PUBLIC_API_URL (default: http://localhost:3001/api)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('md_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) =>
    request<{ success: boolean; message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string, name?: string, age?: number) =>
    request<{ success: boolean; data: { token: string; patient: Record<string, unknown> } }>(
      '/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, otp, name, age }) }
    ),

  getCurrentOtp: (phone: string) =>
    request<{ success: boolean; data: { otp: string; expiresAt: string; attemptsRemaining: number } }>(
      `/auth/current-otp?phone=${encodeURIComponent(phone)}`
    ),

  getProfile: () =>
    request<{ success: boolean; data: Record<string, unknown> }>('/auth/profile'),

  updateProfile: (data: { name?: string; age?: number; gender?: string }) =>
    request<{ success: boolean; data: Record<string, unknown> }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─── Booking ────────────────────────────────────────────────────────────
export const bookingApi = {
  getAvailableDates: () =>
    request<{ success: boolean; data: { dates: string[] } }>('/bookings/available-dates'),

  getSlots: (date: string) =>
    request<{ success: boolean; data: { date: string; availableSlots: string[] } }>(
      `/bookings/slots?date=${date}`
    ),

  reserveSlot: (date: string, timeSlot: string) =>
    request<{ success: boolean; message: string }>('/bookings/reserve-slot', {
      method: 'POST',
      body: JSON.stringify({ date, timeSlot }),
    }),

  createAppointment: (payload: {
    date: string;
    timeSlot: string;
    symptoms?: string;
    paymentMethod?: string;
  }) =>
    request<{ success: boolean; data: Record<string, unknown> }>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  walkIn: (payload: {
    patientName: string;
    patientPhone: string;
    date: string;
    timeSlot: string;
    reason?: string;
  }) =>
    request<{ success: boolean; data: Record<string, unknown> }>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelAppointment: (id: string) =>
    request<{ success: boolean }>(`/bookings/cancel/${id}`, { method: 'POST' }),

  rescheduleAppointment: (id: string, date: string, timeSlot: string) =>
    request<{ success: boolean }>(`/bookings/reschedule/${id}`, {
      method: 'POST',
      body: JSON.stringify({ date, timeSlot }),
    }),
};

// ─── Appointments ───────────────────────────────────────────────────────
export const appointmentApi = {
  list: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ success: boolean; data: { appointments: unknown[] } }>(
      `/appointments${qs ? `?${qs}` : ''}`
    );
  },
  today: () =>
    request<{ success: boolean; data: { appointments: unknown[]; count: number } }>(
      '/appointments/today'
    ),
  getById: (id: string) =>
    request<{ success: boolean; data: unknown }>(`/appointments/${id}`),
};

// ─── Queue ──────────────────────────────────────────────────────────────
export const queueApi = {
  status: () =>
    request<{ success: boolean; data: unknown }>('/queue/status'),

  list: () =>
    request<{ success: boolean; data: {
      appointments: any[];
      waiting: any[];
      current: any | null;
      estimatedWaitMinutes: number;
      total: number;
    } }>('/queue/list'),

  position: (appointmentId: string) =>
    request<{ success: boolean; data: unknown }>(`/queue/position/${appointmentId}`),

  checkIn: (appointmentId: string) =>
    request<{ success: boolean }>(`/queue/check-in/${appointmentId}`, { method: 'POST' }),

  next: () =>
    request<{ success: boolean; data: unknown }>('/queue/next', { method: 'POST' }),

  complete: (appointmentId: string) =>
    request<{ success: boolean }>(`/queue/complete/${appointmentId}`, { method: 'POST' }),

  markNoShow: (appointmentId: string) =>
    request<{ success: boolean }>(`/queue/no-show/${appointmentId}`, { method: 'POST' }),
};

// ─── Patients ───────────────────────────────────────────────────────────
export const patientApi = {
  list: (search?: string, page = 1) => {
    const qs = new URLSearchParams({
      ...(search ? { search } : {}),
      page: String(page),
    }).toString();
    return request<{ success: boolean; data: { patients: unknown[]; total: number } }>(
      `/patients?${qs}`
    );
  },
  getById: (id: string) =>
    request<{ success: boolean; data: unknown }>(`/patients/${id}`),
  search: (phone?: string, name?: string) => {
    const qs = new URLSearchParams({
      ...(phone ? { phone } : {}),
      ...(name ? { name } : {}),
    }).toString();
    return request<{ success: boolean; data: { patients: unknown[] } }>(
      `/patients/search?${qs}`
    );
  },
  create: (data: { name: string; phone: string; age?: number; gender?: string }) =>
    request<{ success: boolean; data: unknown }>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    request<{ success: boolean; data: unknown }>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/patients/${id}`, { method: 'DELETE' }),
};

// ─── Consultation ────────────────────────────────────────────────────────
export const consultationApi = {
  start: (appointmentId: string) =>
    request<{ success: boolean; data: unknown }>('/consultations/start', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    }),

  saveNotes: (payload: {
    appointmentId: string;
    patientId: string;
    notes?: string;
    diagnosis?: string;
    advice?: string;
    treatmentPlan?: string;
  }) =>
    request<{ success: boolean; data: unknown }>('/consultations/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getById: (id: string) =>
    request<{ success: boolean; data: unknown }>(`/consultations/${id}`),

  history: (patientId: string) =>
    request<{ success: boolean; data: { history: unknown[]; count: number } }>(
      `/consultations/history/${patientId}`
    ),
};

// ─── Prescriptions ───────────────────────────────────────────────────────
export const prescriptionApi = {
  create: (data: {
    consultationId: string;
    patientId: string;
    medicine: string;
    dose: string;
    frequency: string;
    duration: number;
    notes?: string;
  }) =>
    request<{ success: boolean; data: unknown }>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBulk: (data: {
    consultationId: string;
    patientId: string;
    medicines: { medicine: string; dose: string; frequency: string; duration: number; notes?: string }[];
  }) =>
    request<{ success: boolean; data: { count: number } }>('/prescriptions/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    request<{ success: boolean; data: unknown }>(`/prescriptions/${id}`),

  delete: (id: string) =>
    request<{ success: boolean }>(`/prescriptions/${id}`, { method: 'DELETE' }),

  pdfUrl: (id: string) => `${BASE}/prescriptions/${id}/pdf`,
};

// ─── Billing ─────────────────────────────────────────────────────────────
export const billingApi = {
  create: (data: { appointmentId: string; consultationFee: number; medicineCost?: number }) =>
    request<{ success: boolean; data: unknown }>('/billing/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByAppointment: (appointmentId: string) =>
    request<{ success: boolean; data: unknown }>(`/billing/appointment/${appointmentId}`),

  confirmPayment: (id: string, paymentMethod: string, transactionId?: string) =>
    request<{ success: boolean; data: unknown }>(`/billing/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, transactionId }),
    }),

  todayRevenue: () =>
    request<{ success: boolean; data: { revenue: number } }>('/billing/revenue/today'),

  receiptUrl: (id: string) => `${BASE}/billing/${id}/receipt`,
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const analyticsApi = {
  today: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<{ success: boolean; data: unknown }>(`/analytics/today${qs}`);
  },
  monthlyRevenue: (year?: number, month?: number) => {
    const qs = new URLSearchParams({
      ...(year !== undefined ? { year: String(year) } : {}),
      ...(month !== undefined ? { month: String(month) } : {}),
    }).toString();
    return request<{ success: boolean; data: unknown }>(`/analytics/revenue${qs ? `?${qs}` : ''}`);
  },
  peakHours: () => request<{ success: boolean; data: unknown }>('/analytics/peak-hours'),
  noShowRate: (days = 30) =>
    request<{ success: boolean; data: unknown }>(`/analytics/no-show-rate?days=${days}`),
};

// ─── AI ──────────────────────────────────────────────────────────────────
export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export const aiApi = {
  chat: (message: string, history?: ChatMessage[]) =>
    request<{ success: boolean; data: { reply: string } }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  detectIntent: (message: string) =>
    request<{ success: boolean; data: { intent: string; confidence: number } }>('/ai/intent', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ─── WhatsApp ─────────────────────────────────────────────────────────────
export const whatsappApi = {
  sendMessage: (phone: string, message: string) =>
    request<{ success: boolean }>('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, message }),
    }),
};
