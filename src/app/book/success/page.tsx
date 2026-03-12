import Link from 'next/link'
import { CheckCircle, Calendar, RotateCcw, Download, MessageCircle, Mail } from 'lucide-react'

export default function BookingSuccessPage() {
  const appointmentId = '#MED-20260318-007'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Appointment Confirmed! 🎉</h1>
          <p className="text-text-secondary mt-2">You're all set! We'll see you on <strong>Wednesday, March 18</strong>.</p>
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
              { label: 'Date', value: 'March 18, 2026' },
              { label: 'Time', value: '10:30 AM' },
              { label: 'Payment', value: 'Paid ₹500 · UPI' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-muted font-medium uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Calendar, label: 'Add to Calendar' },
            { icon: RotateCcw, label: 'Reschedule' },
            { icon: Download, label: 'Download PDF' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-1.5 py-3 border border-brand-border rounded-xl hover:border-primary hover:bg-primary-light transition-all text-sm text-text-secondary hover:text-primary">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Confirmation notice */}
        <div className="flex items-center justify-center gap-4 text-sm text-text-muted mb-5">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-success" /> WhatsApp sent
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-primary" /> Email sent
          </span>
        </div>

        <Link href="/" className="block text-center text-sm text-primary font-medium hover:text-primary-hover">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
