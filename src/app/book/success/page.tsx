'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { CheckCircle, Calendar, Download, MessageCircle } from 'lucide-react'

function to12h(t: string): string {
  if (!t) return '—'
  if (t.includes('AM') || t.includes('PM')) return t
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h)) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  } catch { return iso }
}

function formatShortDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  } catch { return iso }
}

export default function BookingSuccessPage() {
  const [appointment, setAppointment] = useState<any>(null)
  const [dateStr, setDateStr] = useState('')     // e.g. "2026-03-14"
  const [slotStr, setSlotStr] = useState('')     // e.g. "10:00"
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. read date & slot FIRST (before cleaning)
    const storedDate = sessionStorage.getItem('md_date') ?? ''
    const storedSlot = sessionStorage.getItem('md_slot') ?? ''

    // 2. read appointment object saved by confirm page
    const raw = sessionStorage.getItem('md_appointment')
    const apt = raw ? JSON.parse(raw) : null
    setAppointment(apt)

    // 3. prefer appointment fields, fall back to _date/_slot markers, then sessionStorage
    const finalDate = apt?.date ?? apt?._date ?? storedDate
    const finalSlot = apt?.timeSlot ?? apt?._slot ?? storedSlot

    setDateStr(finalDate)
    setSlotStr(finalSlot)

    // 4. clean up transient session items (keep patient for potential relogin)
    sessionStorage.removeItem('md_slot')
    sessionStorage.removeItem('md_date')
  }, [])

  const appointmentId = appointment?.id
    ? `#MED-${String(appointment.id).toUpperCase().slice(0, 16)}`
    : '#MED-CONFIRMED'

  const displayDate  = formatDate(dateStr)
  const shortDate    = formatShortDate(dateStr)
  const displayTime  = to12h(slotStr)
  const paymentLabel = appointment?.paymentMethod === 'UPI' ? '✅ Paid · UPI' : '🏥 Pay at Clinic'
  const patientName  = appointment?.patient?.name ?? '—'

  // ── PDF download via browser print API ──────────────────────────────────
  const handleDownloadPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Appointment Confirmation — MedDesk</title>
        <style>
          * { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #f8fafc; padding: 40px; color: #1e293b; }
          .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.12); max-width: 520px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 28px 32px; }
          .header h1 { color: white; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; opacity: 0.8; }
          .header .appt-id { color: white; font-size: 22px; font-weight: 700; }
          .header .status { display: inline-block; background: rgba(255,255,255,0.2); color: white; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-top: 10px; }
          .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 0 24px; }
          .body { padding: 28px 32px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; display: block; margin-bottom: 6px; }
          .field span { font-size: 15px; font-weight: 600; color: #1e293b; }
          .footer { background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          .logo { font-size: 18px; font-weight: 800; color: #3b82f6; margin-bottom: 4px; }
          .note { margin-top: 16px; padding: 12px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 12px; color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Appointment Confirmation</h1>
            <div class="appt-id">${appointmentId}</div>
            <div class="status">✓ Confirmed</div>
          </div>
          <hr class="divider"/>
          <div class="body">
            <div class="grid">
              <div class="field">
                <label>Patient</label>
                <span>${patientName}</span>
              </div>
              <div class="field">
                <label>Doctor</label>
                <span>Dr. Ananya Sharma</span>
              </div>
              <div class="field">
                <label>Date</label>
                <span>${shortDate}</span>
              </div>
              <div class="field">
                <label>Time</label>
                <span>${displayTime}</span>
              </div>
              <div class="field">
                <label>Payment</label>
                <span>${paymentLabel}</span>
              </div>
              <div class="field">
                <label>Consultation Fee</label>
                <span>₹500</span>
              </div>
            </div>
            <div class="note">
              📋 Please arrive 10 minutes early. Free cancellation up to 2 hours before your appointment.
            </div>
          </div>
          <div class="footer">
            <div class="logo">🏥 MedDesk</div>
            <div>Generated on ${new Date().toLocaleString('en-IN')} · MedDesk Clinic · meddesk.in</div>
          </div>
        </div>
      </body>
      </html>
    `
    const win = window.open('', '_blank', 'width=700,height=900')
    if (!win) return
    win.document.write(printContent)
    win.document.close()
    win.focus()
    // Slight delay so styles render before print dialog opens
    setTimeout(() => {
      win.print()
      win.close()
    }, 300)
  }

  // ── Add to Calendar (Google Calendar deep-link) ──────────────────────────
  const handleAddToCalendar = () => {
    if (!dateStr || !slotStr) return
    // Build a proper datetime string for Google Calendar
    const [h, m] = slotStr.split(':').map(Number)
    const startDt = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr)
    startDt.setHours(h, m, 0, 0)
    const endDt = new Date(startDt.getTime() + 30 * 60 * 1000)
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Doctor+Appointment+at+MedDesk&dates=${fmt(startDt)}/${fmt(endDt)}&details=Appointment+ID:+${appointmentId}%0ADoctor:+Dr.+Ananya+Sharma%0AFee:+₹500&location=MedDesk+Clinic`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Appointment Confirmed! 🎉</h1>
          <p className="text-text-secondary mt-2">
            You're all set! We'll see you on <strong>{displayDate === '—' ? 'your appointment date' : displayDate}</strong>.
          </p>
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

          {/* Dashed divider with notches */}
          <div className="relative border-b border-dashed border-brand-border mx-4">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-bg rounded-full border border-brand-border" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-bg rounded-full border border-brand-border" />
          </div>

          {/* Ticket body */}
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Patient', value: patientName },
              { label: 'Doctor', value: 'Dr. Ananya Sharma' },
              { label: 'Date', value: shortDate },
              { label: 'Time', value: displayTime },
              { label: 'Payment', value: paymentLabel },
              { label: 'Consultation Fee', value: '₹500' },
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
          <button
            onClick={handleAddToCalendar}
            className="flex flex-col items-center gap-1.5 py-3 border border-brand-border rounded-xl hover:border-primary hover:bg-primary-light transition-all text-sm text-text-secondary hover:text-primary"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Add to Calendar</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex flex-col items-center gap-1.5 py-3 border border-brand-border rounded-xl hover:border-primary hover:bg-primary-light transition-all text-sm text-text-secondary hover:text-primary"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium">Download PDF</span>
          </button>
        </div>

        {/* WhatsApp notice */}
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
