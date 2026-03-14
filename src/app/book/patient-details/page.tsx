'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Phone, Hash, FileText, ArrowRight, AlertCircle, TestTube } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { authApi } from '@/lib/api'

export default function PatientDetailsPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', age: '', symptoms: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const useDemoData = (phoneNumber: string, name: string) => {
    setForm(f => ({ ...f, phone: phoneNumber, name: name, age: '30' }))
    setErrors({})
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const phone = `+91${form.phone}`
      await authApi.sendOtp(phone)
      // Persist form to sessionStorage for next steps
      sessionStorage.setItem('md_patient', JSON.stringify({ ...form, phone }))
      router.push('/book/verify-otp')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <StepProgressBar currentStep={1} />

      <div className="card p-6 shadow-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Patient Details</h1>
          <p className="text-sm text-text-secondary mt-1">
            We need a few details to book your appointment securely.
          </p>
        </div>

        {/* Demo Data Helper */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TestTube className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-800">Quick Demo Data</span>
          </div>
          <p className="text-xs text-cyan-700 mb-3">
            Use these demo phone numbers for testing. The actual backend-generated OTP will be displayed on the next page.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => useDemoData('9999999999', 'Demo Patient')}
              className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-md transition-colors"
            >
              📱 9999999999 (Demo Patient)
            </button>
            <button
              type="button"
              onClick={() => useDemoData('9876543210', 'Test User')}
              className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-md transition-colors"
            >
              📱 9876543210 (Test User)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Full Name <span className="text-danger">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                className={`input pl-9 ${errors.name ? 'border-danger focus:ring-danger' : ''}`}
                placeholder="e.g. Rahul Mehta"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            {errors.name && (
              <p className="flex items-center gap-1 text-xs text-danger mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number <span className="text-danger">*</span></label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 border border-brand-border rounded-lg bg-brand-bg text-sm text-text-secondary font-medium shrink-0">
                +91
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  maxLength={10}
                  className={`input pl-9 ${errors.phone ? 'border-danger focus:ring-danger' : ''}`}
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="flex items-center gap-1 text-xs text-danger mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="label">
              Age <span className="text-text-muted text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                min={1}
                max={120}
                className="input pl-9"
                placeholder="e.g. 32"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
              />
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="label">
              Symptoms / Reason for Visit{' '}
              <span className="text-text-muted text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <textarea
                rows={3}
                className="input pl-9 resize-none"
                placeholder="Briefly describe your symptoms..."
                value={form.symptoms}
                onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
              />
            </div>
          </div>

          {apiError && (
            <p className="flex items-center gap-1.5 text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 btn-primary py-3 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Send OTP <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-4">
          Already have an appointment?{' '}
          <Link href="#" className="text-primary font-medium hover:text-primary-hover">
            Check status
          </Link>
        </p>
      </div>
    </div>
  )
}
