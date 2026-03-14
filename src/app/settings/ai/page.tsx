'use client'

import { useEffect, useState } from 'react'
import { Bot, Save, MessageSquare, PhoneCall } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface SystemSettings {
  [key: string]: any
}

export default function AiAssistantSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const aiEnabled = Boolean(
    typeof systemSettings.ai_assistant_enabled === 'boolean'
      ? systemSettings.ai_assistant_enabled
      : String(systemSettings.ai_assistant_enabled ?? 'true') === 'true'
  )
  const symptomCheckerEnabled = Boolean(
    typeof systemSettings.ai_symptom_checker_enabled === 'boolean'
      ? systemSettings.ai_symptom_checker_enabled
      : String(systemSettings.ai_symptom_checker_enabled ?? 'false') === 'true'
  )
  const whatsappBotEnabled = Boolean(
    typeof systemSettings.ai_whatsapp_bot_enabled === 'boolean'
      ? systemSettings.ai_whatsapp_bot_enabled
      : String(systemSettings.ai_whatsapp_bot_enabled ?? 'false') === 'true'
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
        ai_assistant_enabled: aiEnabled,
        ai_symptom_checker_enabled: symptomCheckerEnabled,
        ai_whatsapp_bot_enabled: whatsappBotEnabled,
      }
      const response = await settingsApi.updateSystem(payload)
      if (response.success) {
        setMessage('AI Assistant settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save AI settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key: 'ai_assistant_enabled' | 'ai_symptom_checker_enabled' | 'ai_whatsapp_bot_enabled') => {
    setSystemSettings(prev => {
      const current =
        key === 'ai_assistant_enabled'
          ? aiEnabled
          : key === 'ai_symptom_checker_enabled'
          ? symptomCheckerEnabled
          : whatsappBotEnabled
      return { ...prev, [key]: !current }
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
            <Bot className="w-5 h-5" />
            AI Assistant
          </h2>
          <p className="text-text-secondary mt-1">
            Control AI features like chat assistant, symptom checker and WhatsApp bot
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
        {/* Master toggle */}
        <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Enable AI Assistant</p>
              <p className="text-xs text-text-secondary">
                Turn the MedDesk AI assistant on or off for the entire clinic.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('ai_assistant_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aiEnabled ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                aiEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Symptom checker */}
        <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Symptom Checker</p>
              <p className="text-xs text-text-secondary">
                Allow patients to describe symptoms and get triage suggestions before booking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('ai_symptom_checker_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              symptomCheckerEnabled ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                symptomCheckerEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* WhatsApp bot */}
        <div className="border border-brand-border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary">WhatsApp Bot</p>
              <p className="text-xs text-text-secondary">
                Allow patients to chat with an AI bot on WhatsApp for bookings and FAQs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('ai_whatsapp_bot_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              whatsappBotEnabled ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                whatsappBotEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">Integration</h3>
        <p className="text-text-secondary">
          These flags are stored in the <span className="font-semibold">system settings</span>{' '}
          (`ai_assistant_enabled`, `ai_symptom_checker_enabled`, `ai_whatsapp_bot_enabled`) so you
          can conditionally enable or disable AI features in your backend routes, cron jobs and
          WhatsApp integrations.
        </p>
      </div>
    </div>
  )
}

