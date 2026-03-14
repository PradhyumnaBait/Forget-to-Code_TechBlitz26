'use client'

import { useState, useEffect } from 'react'
import { Bell, Save, MessageSquare, Mail, Smartphone } from 'lucide-react'
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
    confirmationEnabled: true
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

  const handleChange = (field: keyof NotificationSettings, value: boolean | number) => {
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
            Configure automated messages and reminders
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
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-success-light text-success-text border border-success/20' 
            : 'bg-danger-light text-danger-text border border-danger/20'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Communication Channels */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Communication Channels</h3>
          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">WhatsApp Notifications</div>
                  <div className="text-sm text-text-secondary">Send appointment reminders via WhatsApp</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.whatsappEnabled}
                  onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">SMS Notifications</div>
                  <div className="text-sm text-text-secondary">Send appointment reminders via SMS</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.smsEnabled}
                  onChange={(e) => handleChange('smsEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Email Notifications</div>
                  <div className="text-sm text-text-secondary">Send appointment confirmations via email</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailEnabled}
                  onChange={(e) => handleChange('emailEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Reminder Time</label>
                <select
                  className="input"
                  value={settings.reminderTime}
                  onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
                >
                  <option value={1}>1 hour before</option>
                  <option value={2}>2 hours before</option>
                  <option value={4}>4 hours before</option>
                  <option value={12}>12 hours before</option>
                  <option value={24}>24 hours before</option>
                  <option value={48}>48 hours before</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  When to send appointment reminders
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg">
                <input
                  type="checkbox"
                  id="confirmationEnabled"
                  className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
                  checked={settings.confirmationEnabled}
                  onChange={(e) => handleChange('confirmationEnabled', e.target.checked)}
                />
                <div>
                  <label htmlFor="confirmationEnabled" className="font-medium text-text-primary cursor-pointer">
                    Booking Confirmations
                  </label>
                  <p className="text-xs text-text-muted">
                    Send confirmation when appointment is booked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Templates Preview */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Message Templates</h3>
          <div className="space-y-4">
            <div className="p-4 bg-brand-bg border border-brand-border rounded-lg">
              <div className="text-sm font-medium text-text-primary mb-2">Appointment Reminder</div>
              <div className="text-sm text-text-secondary bg-white p-3 rounded border">
                "Hi [Patient Name], this is a reminder for your appointment at MedDesk Clinic tomorrow at [Time]. Please arrive 10 minutes early. Reply CANCEL to cancel."
              </div>
            </div>
            <div className="p-4 bg-brand-bg border border-brand-border rounded-lg">
              <div className="text-sm font-medium text-text-primary mb-2">Booking Confirmation</div>
              <div className="text-sm text-text-secondary bg-white p-3 rounded border">
                "Your appointment has been confirmed for [Date] at [Time]. Consultation fee: ₹500. Address: [Clinic Address]. Thank you!"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Active Notifications</h3>
        <div className="flex flex-wrap gap-2">
          {settings.whatsappEnabled && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              WhatsApp
            </span>
          )}
          {settings.smsEnabled && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              SMS
            </span>
          )}
          {settings.emailEnabled && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Email
            </span>
          )}
          {settings.confirmationEnabled && (
            <span className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full">
              Confirmations
            </span>
          )}
          {!settings.whatsappEnabled && !settings.smsEnabled && !settings.emailEnabled && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              No notifications enabled
            </span>
          )}
        </div>
        <div className="mt-2 text-sm text-text-muted">
          Reminders sent {settings.reminderTime} hours before appointments
        </div>
      </div>
    </div>
  )
}