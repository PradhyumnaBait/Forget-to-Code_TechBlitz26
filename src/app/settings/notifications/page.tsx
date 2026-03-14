'use client'

import { useEffect, useState } from 'react'
import { Bell, Save, MessageCircle, Mail, Smartphone } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface NotificationSettings {
  id?: string
  whatsappEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  reminderTime: number
  confirmationEnabled: boolean
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    whatsappEnabled: false,
    smsEnabled: true,
    emailEnabled: true,
    reminderTime: 24,
    confirmationEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getNotifications()
        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch notification settings:', error)
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
      const response = await settingsApi.updateNotifications(settings)
      if (response.success) {
        setMessage('Notification settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] as any }))
  }

  const handleChange = (field: keyof NotificationSettings, value: number) => {
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
            <Bell className="w-5 h-5" />
            Notification Settings
          </h2>
          <p className="text-text-secondary mt-1">
            Configure automated WhatsApp, SMS and email notifications
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
        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-text-primary">WhatsApp Notifications</p>
                <p className="text-xs text-text-secondary">
                  Appointment confirmations and reminders on WhatsApp.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('whatsappEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.whatsappEnabled ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.whatsappEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-text-primary">SMS Reminders</p>
                <p className="text-xs text-text-secondary">
                  Simple text reminders for upcoming appointments.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('smsEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.smsEnabled ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.smsEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Email Confirmations</p>
                <p className="text-xs text-text-secondary">
                  Detailed confirmation emails with clinic details.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailEnabled ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.emailEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reminder config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Reminder Time (hours before appointment)</label>
            <select
              className="input"
              value={settings.reminderTime}
              onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
            >
              <option value={1}>1 hour before</option>
              <option value={2}>2 hours before</option>
              <option value={6}>6 hours before</option>
              <option value={12}>12 hours before</option>
              <option value={24}>24 hours before</option>
            </select>
            <p className="text-xs text-text-muted mt-1">
              Controls when reminder messages are sent to patients.
            </p>
          </div>

          <div className="flex items-center justify-between border border-brand-border rounded-lg p-4">
            <div>
              <p className="font-medium text-text-primary">Send Confirmation Messages</p>
              <p className="text-xs text-text-secondary">
                Automatically send confirmation when an appointment is booked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('confirmationEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.confirmationEnabled ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  settings.confirmationEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">Summary</h3>
        <p className="text-text-secondary">
          Reminders will be sent{' '}
          <span className="font-semibold">{settings.reminderTime} hours</span> before each
          appointment. Enabled channels:{' '}
          <span className="font-semibold">
            {[
              settings.whatsappEnabled && 'WhatsApp',
              settings.smsEnabled && 'SMS',
              settings.emailEnabled && 'Email',
            ]
              .filter(Boolean)
              .join(', ') || 'None'}
          </span>
          .
        </p>
      </div>
    </div>
  )
}

