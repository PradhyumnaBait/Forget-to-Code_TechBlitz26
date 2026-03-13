'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCog, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/authContext'

const RECEPTION_EMAIL = 'reception@meddesk.in'
const RECEPTION_PASSWORD = 'MedDesk@2026'

export default function ReceptionLoginPage() {
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
      // Map email to username for backend
      const username = email.split('@')[0]  // e.g. 'reception'
      const res = await fetch(`${BASE}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'reception' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        localStorage.setItem('md_token', data.data.token)
        loginStaff('reception')
        router.push('/reception')
      } else {
        setError(data.message ?? 'Invalid credentials')
      }
    } catch {
      // Backend offline — try hardcoded credentials for demo
      if (email !== RECEPTION_EMAIL || password !== RECEPTION_PASSWORD) {
        setError('Invalid credentials. Check your email and password.')
        setLoading(false); return
      }
      loginStaff('reception')
      router.push('/reception')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-indigo-100 mb-4">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Receptionist Login</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to manage the clinic desk</p>
        </div>

        <div className="card p-8 shadow-xl border-gray-200">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-6 text-xs text-indigo-700 font-medium">
            🔑 Use your clinic credentials to sign in
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" className="input pl-9" placeholder="reception@meddesk.in"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type={showPw ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 mt-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-50 disabled:scale-100">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-5">
          <Link href="/login" className="text-accent font-medium hover:underline">← Back to role selection</Link>
        </p>
      </div>
    </div>
  )
}
