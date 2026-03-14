'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Settings, 
  Building2, 
  Clock, 
  FileText, 
  Bell, 
  CreditCard, 
  Users, 
  Shield, 
  Bot,
  Palette
} from 'lucide-react'

const settingsNavigation = [
  { name: 'Overview', href: '/settings', icon: Settings },
  { name: 'Clinic Info', href: '/settings/clinic', icon: Building2 },
  { name: 'Doctor Schedule', href: '/settings/schedule', icon: Clock },
  { name: 'Appointment Rules', href: '/settings/rules', icon: FileText },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
  { name: 'User Management', href: '/settings/users', icon: Users },
  { name: 'Security', href: '/settings/security', icon: Shield },
  { name: 'AI Assistant', href: '/settings/ai', icon: Bot },
  { name: 'Preferences', href: '/settings/preferences', icon: Palette },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { settingsApi } = await import('@/lib/api')
        await settingsApi.getAll()
        setAuthChecked(true)
      } catch {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname || '/settings')}`)
      }
    }
    checkAuth()
  }, [router, pathname])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Verifying admin access…</p>
          <p className="text-sm text-text-muted mt-2">Redirecting to login if needed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Manage your clinic configuration and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary'
                        : 'text-text-secondary hover:bg-brand-bg hover:text-text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}