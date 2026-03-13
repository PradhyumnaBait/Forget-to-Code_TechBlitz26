'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/authContext'

export default function VerifyOtpPage() {
  const router = useRouter()
  const { loginPatient } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(45)
  const [resendLoading, setResendLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Read patient info persisted from previous step
  const patientRaw = typeof window !== 'undefined' ? sessionStorage.getItem('md_patient') : null
  const patient = patientRaw ? JSON.parse(patientRaw) : null
  const phone: string = patient?.phone ?? ''
  const displayPhone = phone.replace('+91', '')

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

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

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.verifyOtp(
        phone,
        code,
        patient?.name,
        patient?.age ? Number(patient.age) : undefined
      )
      if (res.success && res.data?.token) {
        loginPatient(res.data.token, res.data.patient as any)
        router.push('/book/select-date')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = useCallback(async () => {
    if (!phone) return
    setResendLoading(true)
    try {
      await authApi.sendOtp(phone)
      setResendCooldown(45)
      setError('')
    } catch (err) {
      setError('Could not resend OTP. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }, [phone])

  if (!phone) {
    router.replace('/book/patient-details')
    return null
  }

  return (
    <div>
      <StepProgressBar currentStep={2} />

      <div className="card p-6 shadow-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Verify Your Phone</h1>
          <p className="text-sm text-text-secondary mt-1">
            We've sent a 6-digit OTP to <strong>+91 {displayPhone}</strong>
          </p>
          <p className="text-xs text-text-muted mt-1">OTP expires in 5 minutes</p>
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

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-danger mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

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

        <p className="text-center text-sm text-text-muted mt-4">
          {resendCooldown > 0 ? (
            <>Resend in <span className="font-medium text-text-secondary">0:{String(resendCooldown).padStart(2, '0')}</span></>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="flex items-center gap-1 text-primary font-medium mx-auto hover:text-primary-hover disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {resendLoading ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
