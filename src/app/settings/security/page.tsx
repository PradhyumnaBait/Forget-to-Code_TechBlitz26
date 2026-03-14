'use client'

import { useEffect, useState } from 'react'
import { Shield, Save, Clock, Lock } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface SystemSettings {
  [key: string]: any
}

export default function SecuritySettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const sessionTimeout = Number(systemSettings.session_timeout ?? 30)
  const enable2fa = Boolean(
    typeof systemSettings.enable_2fa === 'boolean'
      ? systemSettings.enable_2fa
      : String(systemSettings.enable_2fa ?? 'false') === 'true'
  )

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getSystem()
        if (response.success && response.data) {
          setSystemSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch system settings:', error)
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
      const payload = {
        ...systemSettings,
        session_timeout: sessionTimeout,
        enable_2fa: enable2fa,
      }
      const response = await settingsApi.updateSystem(payload)
      if (response.success) {
        setMessage('Security settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save security settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateSessionTimeout = (value: number) => {
    setSystemSettings(prev => ({ ...prev, session_timeout: value }))
  }

  const toggle2fa = () => {
    setSystemSettings(prev => ({ ...prev, enable_2fa: !enable2fa }))
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
            <Shield className="w-5 h-5" />
            Security Settings
          </h2>
          <p className="text-text-secondary mt-1">
            Configure session timeout and two-factor authentication for staff access
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
        {/* Session timeout */}
        <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Session Timeout</p>
              <p className="text-xs text-text-secondary">
                Automatically log out inactive users after a period of inactivity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input w-24"
              min={5}
              value={sessionTimeout}
              onChange={(e) => updateSessionTimeout(parseInt(e.target.value) || 5)}
            />
            <span className="text-sm text-text-secondary">minutes</span>
          </div>
        </div>

        {/* 2FA */}
        <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-text-secondary">
                Require a second factor (e.g. OTP) when staff members log in.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle2fa}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enable2fa ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enable2fa ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">Note</h3>
        <p className="text-text-secondary">
          These flags are stored in the <span className="font-semibold">system settings</span>{' '}
          (`session_timeout`, `enable_2fa`) and can be used by your backend authentication and
          middleware logic to enforce stricter security policies in production.
        </p>
      </div>
    </div>
  )
}

