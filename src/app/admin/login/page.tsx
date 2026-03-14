'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { Lock, Mail, LogIn, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/settings'
  const [email, setEmail] = useState('admin@meddesk.in')
  const [password, setPassword] = useState('MedDesk@2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.adminLogin(email, password)
      if (res.success && res.data?.token) {
        // Reuse the same token storage key used across the app
        if (typeof window !== 'undefined') {
          localStorage.setItem('md_token', res.data.token)
        }
        router.push(redirectTo)
      } else {
        setError('Invalid admin credentials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-brand-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Admin Access</h1>
            <p className="text-xs text-text-secondary">
              Only authorised admins can modify system settings.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 mb-3 p-3 rounded-lg bg-danger-light text-danger-text text-sm border border-danger/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="label">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                className="input pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                className="input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Default demo credentials: <span className="font-mono">admin@meddesk.in</span> /{' '}
              <span className="font-mono">MedDesk@2026</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in…' : 'Login as Admin'}
          </button>
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </form>
      </div>
    </div>
  )
}

