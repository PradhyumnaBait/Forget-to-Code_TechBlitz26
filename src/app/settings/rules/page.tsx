'use client'

import { useEffect, useState } from 'react'
import { FileText, Save } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface AppointmentRulesSettings {
  id?: string
  maxAppointmentsPerDay: number
  allowWalkIns: boolean
  cancellationTimeLimit: number
  rescheduleLimit: number
  advanceBookingDays: number
}

export default function AppointmentRulesSettingsPage() {
  const [settings, setSettings] = useState<AppointmentRulesSettings>({
    maxAppointmentsPerDay: 40,
    allowWalkIns: true,
    cancellationTimeLimit: 2,
    rescheduleLimit: 3,
    advanceBookingDays: 30,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getRules()
        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch appointment rules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await settingsApi.updateRules(settings)
      if (response.success) {
        setMessage('Appointment rules saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof AppointmentRulesSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Appointment Rules
          </h2>
          <p className="text-text-secondary mt-1">
            Control how appointments are booked, cancelled and rescheduled
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-success-light text-success-text border border-success/20'
              : 'bg-danger-light text-danger-text border border-danger/20'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="label">Max Appointments Per Day</label>
          <input
            type="number"
            className="input"
            min={1}
            value={settings.maxAppointmentsPerDay}
            onChange={(e) =>
              handleChange('maxAppointmentsPerDay', parseInt(e.target.value) || 1)
            }
          />
          <p className="text-xs text-text-muted mt-1">
            Limits the total number of appointments that can be booked per day.
          </p>
        </div>

        <div className="flex items-center justify-between border border-brand-border rounded-lg p-4">
          <div>
            <p className="font-medium text-text-primary">Allow Walk-in Patients</p>
            <p className="text-sm text-text-secondary">
              Enable reception to add patients without prior booking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('allowWalkIns', !settings.allowWalkIns)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.allowWalkIns ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                settings.allowWalkIns ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Cancellation Time Limit (hours)</label>
            <input
              type="number"
              className="input"
              min={1}
              value={settings.cancellationTimeLimit}
              onChange={(e) =>
                handleChange('cancellationTimeLimit', parseInt(e.target.value) || 1)
              }
            />
            <p className="text-xs text-text-muted mt-1">
              How many hours before the appointment patients can cancel.
            </p>
          </div>

          <div>
            <label className="label">Reschedule Limit</label>
            <input
              type="number"
              className="input"
              min={0}
              value={settings.rescheduleLimit}
              onChange={(e) =>
                handleChange('rescheduleLimit', parseInt(e.target.value) || 0)
              }
            />
            <p className="text-xs text-text-muted mt-1">
              Maximum number of times a single appointment can be rescheduled.
            </p>
          </div>

          <div>
            <label className="label">Advance Booking Window (days)</label>
            <input
              type="number"
              className="input"
              min={1}
              value={settings.advanceBookingDays}
              onChange={(e) =>
                handleChange('advanceBookingDays', parseInt(e.target.value) || 1)
              }
            />
            <p className="text-xs text-text-muted mt-1">
              How many days in advance patients can book appointments.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">Summary</h3>
        <p className="text-text-secondary">
          Up to <span className="font-semibold">{settings.maxAppointmentsPerDay}</span> appointments
          can be booked per day.{' '}
          {settings.allowWalkIns
            ? 'Walk-in appointments are allowed.'
            : 'Walk-in appointments are disabled.'}{' '}
          Cancellations are allowed up to{' '}
          <span className="font-semibold">{settings.cancellationTimeLimit} hours</span> before the
          appointment, with a maximum of{' '}
          <span className="font-semibold">{settings.rescheduleLimit}</span> reschedules. Patients
          can book up to{' '}
          <span className="font-semibold">{settings.advanceBookingDays} days</span> in advance.
        </p>
      </div>
    </div>
  )
}

