'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle, Calendar, Download, MessageCircle } from 'lucide-react'

function to12h(t: string): string {
  if (!t) return t
  if (t.includes('AM') || t.includes('PM')) return t
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function BookingSuccessPage() {
  const [appointment, setAppointment] = useState<any>(null)
  const [dateStr, setDateStr] = useState('')
  const [slotStr, setSlotStr] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('md_appointment')
    if (raw) setAppointment(JSON.parse(raw))
    setDateStr(sessionStorage.getItem('md_date') ?? '')
    setSlotStr(sessionStorage.getItem('md_slot') ?? '')
    // Clean up after read
    sessionStorage.removeItem('md_slot')
    sessionStorage.removeItem('md_date')
  }, [])

  const appointmentId = appointment?.id
    ? `#MED-${String(appointment.id).slice(0, 12).toUpperCase()}`
    : '#MED-CONFIRMED'

  const displayDate = dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : 'your appointment date'

  const displayShortDate = dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : ''

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Appointment Confirmed! 🎉</h1>
          <p className="text-text-secondary mt-2">You're all set! We'll see you on <strong>{displayDate}</strong>.</p>
        </div>

        {/* Ticket card */}
        <div className="bg-white border border-brand-border rounded-2xl shadow-md overflow-hidden mb-5">
          {/* Ticket top */}
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 font-medium uppercase tracking-widest">Appointment ID</p>
              <p className="text-white font-bold text-lg">{appointmentId}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Dashed divider */}
          <div className="relative border-b border-dashed border-brand-border mx-4">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-bg rounded-full border border-brand-border" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-bg rounded-full border border-brand-border" />
          </div>

          {/* Ticket body */}
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Doctor', value: 'Dr. Ananya Sharma' },
              { label: 'Date', value: displayShortDate || '—' },
              { label: 'Time', value: to12h(slotStr) || '—' },
              { label: 'Payment', value: appointment?.paymentMethod === 'UPI' ? 'Paid · UPI' : 'Pay at Clinic' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-muted font-medium uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button className="flex flex-col items-center gap-1.5 py-3 border border-brand-border rounded-xl hover:border-primary hover:bg-primary-light transition-all text-sm text-text-secondary hover:text-primary">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Add to Calendar</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 py-3 border border-brand-border rounded-xl hover:border-primary hover:bg-primary-light transition-all text-sm text-text-secondary hover:text-primary">
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium">Download PDF</span>
          </button>
        </div>

        {/* Confirmation notice */}
        <div className="flex items-center justify-center gap-4 text-sm text-text-muted mb-5">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-success" /> WhatsApp confirmation sent
          </span>
        </div>

        <Link href="/" className="block text-center text-sm text-primary font-medium hover:text-primary-hover">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
