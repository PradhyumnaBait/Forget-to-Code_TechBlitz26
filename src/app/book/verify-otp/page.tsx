'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(45)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    setError('')
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return }
    if (code !== '123456') { setError('Invalid OTP. Please try again.'); return }
    setLoading(true)
    setTimeout(() => router.push('/book/select-date'), 800)
  }

  return (
    <div>
      <StepProgressBar currentStep={2} />

      <div className="card p-6 shadow-md">
        {/* Icon + title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Verify Your Phone</h1>
          <p className="text-sm text-text-secondary mt-1">
            We've sent a 6-digit OTP to <strong>+91 98765 43210</strong>
          </p>
          <p className="text-xs text-text-muted mt-1">OTP expires in 10 minutes · Use 123456 to test</p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2.5 justify-center mb-5">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition-colors ${
                error
                  ? 'border-danger text-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                  : digit
                  ? 'border-primary text-primary bg-primary-light'
                  : 'border-brand-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-danger mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Verify OTP <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-text-muted mt-4">
          {resendCooldown > 0 ? (
            <>Resend in <span className="font-medium text-text-secondary">0:{String(resendCooldown).padStart(2, '0')}</span></>
          ) : (
            <button
              onClick={() => setResendCooldown(45)}
              className="flex items-center gap-1 text-primary font-medium mx-auto hover:text-primary-hover"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
