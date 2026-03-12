'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function DoctorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    // Demo: any credentials work
    setLoading(true)
    setTimeout(() => router.push('/doctor'), 1000)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-md mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Doctor Login</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to access your dashboard</p>
        </div>

        <div className="card p-6 shadow-md">
          {/* Demo hint */}
          <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-3 mb-5 text-xs text-primary font-medium">
            🔑 Demo mode — enter any email & password to continue
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="doctor@meddesk.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-brand-border text-primary" />
                Remember me
              </label>
              <button type="button" className="text-primary hover:underline font-medium">Forgot password?</button>
            </div>

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
