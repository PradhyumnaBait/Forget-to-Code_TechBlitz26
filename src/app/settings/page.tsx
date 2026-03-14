'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Clock, 
  FileText, 
  Bell, 
  CreditCard, 
  Users,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface SettingsOverview {
  clinic?: any
  schedule?: any
  rules?: any
  notifications?: any
  billing?: any
  system?: any
}

export default function SettingsOverviewPage() {
  const [settings, setSettings] = useState<SettingsOverview>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getAll()
        if (response.success) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const settingsCards = [
    {
      title: 'Clinic Information',
      description: 'Basic clinic details and contact information',
      href: '/settings/clinic',
      icon: Building2,
      status: settings.clinic?.clinicName ? 'complete' : 'incomplete',
      value: settings.clinic?.clinicName || 'Not configured'
    },
    {
      title: 'Doctor Schedule',
      description: 'Working hours and appointment duration',
      href: '/settings/schedule',
      icon: Clock,
      status: settings.schedule?.startTime ? 'complete' : 'incomplete',
      value: settings.schedule?.startTime ? 
        `${settings.schedule.startTime} - ${settings.schedule.endTime}` : 
        'Not configured'
    },
    {
      title: 'Appointment Rules',
      description: 'Booking limits and cancellation policies',
      href: '/settings/rules',
      icon: FileText,
      status: settings.rules?.maxAppointmentsPerDay ? 'complete' : 'incomplete',
      value: settings.rules?.maxAppointmentsPerDay ? 
        `${settings.rules.maxAppointmentsPerDay} appointments/day` : 
        'Not configured'
    },
    {
      title: 'Notifications',
      description: 'SMS, WhatsApp and email settings',
      href: '/settings/notifications',
      icon: Bell,
      status: 'complete',
      value: settings.notifications?.smsEnabled ? 'SMS Enabled' : 'SMS Disabled'
    },
    {
      title: 'Billing Settings',
      description: 'Consultation fees and payment methods',
      href: '/settings/billing',
      icon: CreditCard,
      status: settings.billing?.defaultConsultationFee ? 'complete' : 'incomplete',
      value: settings.billing?.defaultConsultationFee ? 
        `₹${settings.billing.defaultConsultationFee}` : 
        'Not configured'
    },
    {
      title: 'User Management',
      description: 'Staff accounts and permissions',
      href: '/settings/users',
      icon: Users,
      status: 'complete',
      value: 'Doctor & Reception accounts'
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Settings Overview</h2>
        <p className="text-text-secondary mt-1">
          Configure your clinic management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group block p-4 border border-brand-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    {card.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    {card.description}
                  </p>
                  <p className="text-xs font-medium text-text-muted">
                    {card.value}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-success-light border border-success/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-success">
            {Object.values(settings).filter(Boolean).length}
          </div>
          <div className="text-sm text-success-text">Configured Modules</div>
        </div>
        <div className="bg-primary-light border border-primary/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">
            ₹{settings.billing?.defaultConsultationFee || 500}
          </div>
          <div className="text-sm text-primary">Consultation Fee</div>
        </div>
        <div className="bg-warning-light border border-warning/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-warning">
            {settings.schedule?.appointmentDuration || 30}min
          </div>
          <div className="text-sm text-warning-text">Appointment Duration</div>
        </div>
      </div>
    </div>
  )
}