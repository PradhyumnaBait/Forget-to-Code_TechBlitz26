'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Copy, Check, User } from 'lucide-react'
import { useAuth } from '@/lib/authContext'

// Hardcoded demo credentials for staff (doctor login)
const DOCTOR_EMAIL = 'doctor@meddesk.in'
const DOCTOR_PASSWORD = 'demo_password'

export default function DoctorLoginPage() {
  const router = useRouter()
  const { loginStaff } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const useCredentials = () => {
    setEmail(DOCTOR_EMAIL)
    setPassword(DOCTOR_PASSWORD)
    setError('')
  }

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
          {/* Demo Credentials Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Doctor Auto-Login</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                <div>
                  <div className="text-xs text-green-600 font-medium">Email</div>
                  <code className="text-sm font-mono text-green-900">{DOCTOR_EMAIL}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(DOCTOR_EMAIL, 'email')}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                >
                  {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedEmail ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              {/* Removed password copy box to prevent git leaks */}
            </div>
            
            <button
              onClick={useCredentials}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Use These Credentials
            </button>
            
            <p className="text-xs text-green-600 mt-2">
              💡 Click "Use These Credentials" to auto-fill the form below for quick testing.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="Enter email address"
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
                  placeholder="Enter password"
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
