'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/authContext'

// Hardcoded demo credentials for staff (doctor login)
const DOCTOR_EMAIL = 'doctor@meddesk.in'
const DOCTOR_PASSWORD = 'MedDesk@2026'

export default function DoctorLoginPage() {
  const router = useRouter()
  const { loginStaff } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const username = email.split('@')[0]   // 'doctor'
      const res = await fetch(`${BASE}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'doctor' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        localStorage.setItem('md_token', data.data.token)
        loginStaff('doctor')
        router.push('/doctor')
      } else {
        setError(data.message ?? 'Invalid credentials')
      }
    } catch {
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-md mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Doctor Login</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to access your dashboard</p>
        </div>

        <div className="card p-6 shadow-md">
          <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-3 mb-5 text-xs text-primary font-medium">
            🔑 Demo Mode: Use any email and password to sign in
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="any-email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="any-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 btn-primary py-3 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-5">
          <Link href="/login" className="text-primary font-medium hover:underline">← Back to role selection</Link>
        </p>
      </div>
    </div>
  )
}
