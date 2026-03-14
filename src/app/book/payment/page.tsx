'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, CheckCircle, QrCode, CreditCard, Smartphone, ScanLine } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { bookingApi } from '@/lib/api'

type PayMode = 'upi' | 'card' | 'qr'

export default function PaymentPage() {
  const router = useRouter()
  const [consultationFee, setConsultationFee] = useState(500)
  const [mode, setMode] = useState<PayMode>('upi')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    bookingApi.getClinicInfo().then((r) => {
      if (r.success && r.data?.consultationFee) setConsultationFee(r.data.consultationFee)
    }).catch(() => {})
  }, [])

  const handlePay = () => {
    setLoading(true)
    setTimeout(() => router.push('/book/success'), 1500)
  }

  return (
    <div>
      <StepProgressBar currentStep={5} />

      <div className="card p-6 shadow-md">
        {/* Amount Banner */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 mb-6 flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-medium opacity-80">Amount to Pay</p>
            <p className="text-3xl font-extrabold">₹{consultationFee}</p>
            <p className="text-xs opacity-70 mt-1">Dr. Ananya Sharma · Mar 18 · 10:30 AM</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Method Tabs */}
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Choose Payment Method</p>
        <div className="flex gap-2 mb-5">
          {([
            { id: 'upi', icon: Smartphone, label: 'UPI' },
            { id: 'card', icon: CreditCard, label: 'Card' },
            { id: 'qr', icon: QrCode, label: 'QR Code' },
          ] as { id: PayMode; icon: typeof Smartphone; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                mode === id
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-brand-border text-text-muted bg-white hover:bg-brand-bg'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* UPI */}
        {mode === 'upi' && (
          <div className="space-y-4">
            <div>
              <label className="label">UPI ID</label>
              <input
                type="text"
                className="input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <button key={app} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">
                  {app}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        {mode === 'card' && (
          <div className="space-y-3">
            <div>
              <label className="label">Card Number</label>
              <input type="text" className="input" placeholder="1234 5678 9012 3456" maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Expiry</label>
                <input type="text" className="input" placeholder="MM / YY" />
              </div>
              <div>
                <label className="label">CVV</label>
                <input type="password" className="input" placeholder="• • •" maxLength={4} />
              </div>
            </div>
            <div>
              <label className="label">Name on Card</label>
              <input type="text" className="input" placeholder="Rahul Mehta" />
            </div>
          </div>
        )}

        {/* QR */}
        {mode === 'qr' && (
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="w-40 h-40 bg-brand-bg border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center gap-2 text-text-muted">
              <ScanLine className="w-10 h-10" />
              <p className="text-xs text-center px-3">Load this at your UPI app's scanner</p>
            </div>
            <p className="text-xs text-text-muted">Scan with GPay / PhonePe / Paytm</p>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 py-4 my-3 border-y border-brand-border">
          {['256-bit Encrypted', 'PCI DSS Compliant', 'RBI Approved'].map(badge => (
            <div key={badge} className="flex items-center gap-1 text-xs text-text-muted">
              <CheckCircle className="w-3 h-3 text-success" />
              {badge}
            </div>
          ))}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>Pay ₹{consultationFee} Securely <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}
