'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, IndianRupee, ArrowRight, ArrowLeft, Stethoscope, Hash, Info } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import Link from 'next/link'

export default function ConfirmPage() {
  const router = useRouter()
  const [payMode, setPayMode] = useState<'upi' | 'clinic'>('upi')
  const [loading, setLoading] = useState(false)

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => router.push('/book/success'), 1000)
  }

  const rows = [
    { icon: Stethoscope, label: 'Doctor', value: 'Dr. Ananya Sharma' },
    { icon: User, label: 'Patient', value: 'Rahul Mehta' },
    { icon: Calendar, label: 'Date', value: 'Wednesday, March 18, 2026' },
    { icon: Clock, label: 'Time', value: '10:30 AM' },
    { icon: Hash, label: 'Queue', value: '#7 in queue today' },
    { icon: IndianRupee, label: 'Fee', value: '₹500' },
  ]

  return (
    <div>
      <StepProgressBar currentStep={5} />

      <div className="card p-6 shadow-md">
        <h1 className="text-xl font-bold text-text-primary mb-1">Review Your Appointment</h1>
        <p className="text-sm text-text-secondary mb-6">Confirm the details before proceeding to payment.</p>

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

        {/* Actions */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3 mb-3"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>{payMode === 'upi' ? 'Confirm & Pay ₹500' : 'Confirm Booking'} <ArrowRight className="w-4 h-4" /></>
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
