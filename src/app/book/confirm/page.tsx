'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, IndianRupee, ArrowRight, ArrowLeft, Stethoscope, Hash, Info, AlertCircle, Loader2 } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import Link from 'next/link'
import { bookingApi, analyticsApi } from '@/lib/api'

function to12h(t: string): string {
  if (!t) return t
  if (t.includes('AM') || t.includes('PM')) return t
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function ConfirmPage() {
  const router = useRouter()
  const [payMode, setPayMode] = useState<'upi' | 'clinic'>('clinic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consultationFee, setConsultationFee] = useState(500)

  // Read sessionStorage
  const patientRaw = typeof window !== 'undefined' ? sessionStorage.getItem('md_patient') : null
  const patient = patientRaw ? JSON.parse(patientRaw) : null
  const dateStr: string = typeof window !== 'undefined' ? sessionStorage.getItem('md_date') ?? '' : ''
  const slotStr: string = typeof window !== 'undefined' ? sessionStorage.getItem('md_slot') ?? '' : ''

  const displayDate = dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '—'

  // Get settings to show actual fee
  useEffect(() => {
    analyticsApi.today().then((res: any) => {
      if (res?.data?.settings?.consultationFee) {
        setConsultationFee(Number(res.data.settings.consultationFee))
      }
    }).catch(() => {})
  }, [])

  if (!dateStr || !slotStr) {
    router.replace('/book/select-date')
    return null
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingApi.createAppointment({
        date: dateStr,
        timeSlot: slotStr,
        symptoms: patient?.symptoms,
        paymentMethod: payMode === 'upi' ? 'UPI' : 'AT_CLINIC',
      })
      if (res.success && res.data) {
        // Store appointment id for success page
        sessionStorage.setItem('md_appointment', JSON.stringify(res.data))
        router.push('/book/success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const rows = [
    { icon: Stethoscope, label: 'Doctor', value: 'Dr. Ananya Sharma' },
    { icon: User, label: 'Patient', value: patient?.name ?? '—' },
    { icon: Calendar, label: 'Date', value: displayDate },
    { icon: Clock, label: 'Time', value: to12h(slotStr) },
    { icon: IndianRupee, label: 'Consultation Fee', value: `₹${consultationFee}` },
  ]

  return (
    <div>
      <StepProgressBar currentStep={5} />

      <div className="card p-6 shadow-md">
        <h1 className="text-xl font-bold text-text-primary mb-1">Review Your Appointment</h1>
        <p className="text-sm text-text-secondary mb-6">Confirm the details before booking.</p>

        {/* Summary rows */}
        <div className="space-y-3 mb-6">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-brand-border last:border-0">
              <div className="w-8 h-8 bg-brand-bg rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-text-muted" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-text-secondary">{label}</span>
                <span className="text-sm font-semibold text-text-primary">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Payment mode */}
        <div className="mb-5">
          <p className="text-sm font-medium text-text-primary mb-3">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {(['upi', 'clinic'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPayMode(mode)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                  payMode === mode
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-brand-border text-text-secondary hover:border-primary/40'
                }`}
              >
                {mode === 'upi' ? '📱 Pay Now (UPI)' : '🏥 Pay at Clinic'}
              </button>
            ))}
          </div>
        </div>

        {/* Policy note */}
        <div className="flex items-start gap-2 bg-brand-bg rounded-lg px-3 py-2.5 mb-5">
          <Info className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <p className="text-xs text-text-secondary">Free cancellation up to 2 hours before your appointment.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Actions */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3 mb-3"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
          ) : (
            <>{payMode === 'upi' ? `Confirm & Pay ₹${consultationFee}` : 'Confirm Booking'} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <Link
          href="/book/select-slot"
          className="w-full flex items-center justify-center gap-2 btn-outline py-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Change Slot
        </Link>
      </div>
    </div>
  )
}
