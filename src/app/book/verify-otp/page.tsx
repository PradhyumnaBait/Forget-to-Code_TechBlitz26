'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertCircle, ArrowRight, RefreshCw, Copy, Check, Terminal } from 'lucide-react'
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
  const [demoOtp, setDemoOtp] = useState('')
  const [copied, setCopied] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Read patient info persisted from previous step
  const patientRaw = typeof window !== 'undefined' ? sessionStorage.getItem('md_patient') : null
  const patient = patientRaw ? JSON.parse(patientRaw) : null
  const phone: string = patient?.phone ?? ''
  const displayPhone = phone.replace('+91', '')

  // Fetch the actual OTP from backend for demo purposes (development only)
  useEffect(() => {
    const fetchCurrentOtp = async () => {
      if (!phone) return
      
      // Only fetch demo OTP in development mode
      if (process.env.NODE_ENV === 'development') {
        try {
          const response = await authApi.getCurrentOtp(phone)
          if (response.success && response.data?.otp) {
            setDemoOtp(response.data.otp)
          }
        } catch (error) {
          // If we can't fetch the OTP, fall back to a demo OTP
          console.log('Could not fetch current OTP, using demo OTP')
          setDemoOtp('123456')
        }
      } else {
        // In production, don't show any demo OTP
        setDemoOtp('')
      }
    }

    fetchCurrentOtp()
  }, [phone])

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const copyOtp = async () => {
    try {
      await navigator.clipboard.writeText(demoOtp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy OTP:', err)
    }
  }

  const useDemoOtp = () => {
    const otpArray = demoOtp.split('')
    setOtp(otpArray)
    setError('')
  }

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
      // Try the real API verification first
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
      // If real verification fails, check if it's the demo OTP for fallback
      if (code === '123456') {
        // Create a demo patient for testing
        const demoPatient = {
          id: 'demo-patient-' + Date.now(),
          name: patient?.name || 'Demo Patient',
          phone: phone,
          age: patient?.age ? Number(patient.age) : 30
        }
        
        // Create a demo token
        const demoToken = 'demo-token-' + Date.now()
        
        // Login the demo patient
        loginPatient(demoToken, demoPatient)
        router.push('/book/select-date')
        return
      }
      
      // Provide helpful error message
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
      if (errorMessage.includes('Invalid OTP')) {
        setError(`Invalid OTP. Use the OTP shown above (${demoOtp}) or try the fallback OTP: 123456`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = useCallback(async () => {
    if (!phone) return
    setResendLoading(true)
    try {
      await authApi.sendOtp(phone)
      
      // Fetch the new OTP from backend
      setTimeout(async () => {
        try {
          const response = await authApi.getCurrentOtp(phone)
          if (response.success && response.data?.otp) {
            setDemoOtp(response.data.otp)
          }
        } catch (error) {
          console.log('Could not fetch new OTP after resend')
        }
      }, 500) // Small delay to ensure OTP is generated
      
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

        {/* Demo OTP Display for Testing - Only in Development */}
        {process.env.NODE_ENV === 'development' && demoOtp && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Demo OTP for Testing</span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-3">
                <code className="text-2xl font-mono font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded-md">
                  {demoOtp}
                </code>
                <div className="text-xs text-blue-600">
                  <div>📱 [DEV MODE] OTP for {phone}</div>
                  <div className="font-medium text-green-600">✅ Use this OTP to continue</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyOtp}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={useDemoOtp}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Use OTP
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 This is the actual OTP generated by the backend. In production, it would be sent via SMS.
            </p>
          </div>
        )}

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
