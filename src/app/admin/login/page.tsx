'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { Lock, Mail, LogIn, ArrowLeft } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/settings'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        // Force a page turn instead of client-side routing to guarantee fresh context loading for Settings Layout
        window.location.href = redirectTo || '/settings'
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
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  )
}

