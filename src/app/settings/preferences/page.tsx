'use client'

import { useEffect, useState } from 'react'
import { Palette, BarChart2, Globe, Save, Download } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface SystemSettings {
  [key: string]: any
}

type ThemeOption = 'light' | 'dark'
type AnalyticsView = 'last_7_days' | 'this_month' | 'last_month'

export default function PreferencesSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const theme: ThemeOption = (systemSettings.theme as ThemeOption) ?? 'light'
  const language = (systemSettings.language as string) ?? 'en'
  const analyticsView: AnalyticsView =
    (systemSettings.analytics_default_view as AnalyticsView) ?? 'last_7_days'
  const exportFormats: string[] = Array.isArray(systemSettings.export_formats)
    ? systemSettings.export_formats
    : ['csv', 'pdf']

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
        theme,
        language,
        analytics_default_view: analyticsView,
        export_formats: exportFormats,
      }
      const response = await settingsApi.updateSystem(payload)
      if (response.success) {
        setMessage('Preferences saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateTheme = (value: ThemeOption) => {
    setSystemSettings(prev => ({ ...prev, theme: value }))
  }

  const updateLanguage = (value: string) => {
    setSystemSettings(prev => ({ ...prev, language: value }))
  }

  const updateAnalyticsView = (value: AnalyticsView) => {
    setSystemSettings(prev => ({ ...prev, analytics_default_view: value }))
  }

  const toggleExportFormat = (format: string) => {
    setSystemSettings(prev => {
      const current: string[] = Array.isArray(prev.export_formats)
        ? prev.export_formats
        : exportFormats
      const exists = current.includes(format)
      return {
        ...prev,
        export_formats: exists ? current.filter(f => f !== format) : [...current, format],
      }
    })
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

  const EXPORT_OPTIONS = [
    { key: 'csv', label: 'CSV' },
    { key: 'pdf', label: 'PDF' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Preferences
          </h2>
          <p className="text-text-secondary mt-1">
            Configure UI theme, language and analytics defaults
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

      <div className="space-y-8">
        {/* Theme */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            UI Theme
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['light', 'dark'] as ThemeOption[]).map(option => {
              const active = theme === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateTheme(option)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-brand-border bg-white text-text-secondary hover:bg-brand-bg'
                  }`}
                >
                  <span className="font-medium">
                    {option === 'light' ? 'Light' : 'Dark'} theme
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full border ${
                      active ? 'bg-primary border-primary' : 'border-brand-border'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Language
          </h3>
          <select
            className="input max-w-xs"
            value={language}
            onChange={(e) => updateLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
          <p className="text-xs text-text-muted mt-1">
            This controls the default language for patient-facing communication (future-ready).
          </p>
        </div>

        {/* Analytics default view */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Analytics Default View
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'last_7_days', label: 'Last 7 Days' },
              { key: 'this_month', label: 'This Month' },
              { key: 'last_month', label: 'Last Month' },
            ].map(option => {
              const active = analyticsView === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => updateAnalyticsView(option.key as AnalyticsView)}
                  className={`p-3 rounded-lg border text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-brand-border bg-white text-text-secondary hover:bg-brand-bg'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Export formats */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Formats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            {EXPORT_OPTIONS.map(option => {
              const active = exportFormats.includes(option.key)
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleExportFormat(option.key)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-brand-border bg-white text-text-secondary hover:bg-brand-bg'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span
                    className={`w-4 h-4 rounded-full border ${
                      active ? 'bg-primary border-primary' : 'border-brand-border'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-1">
            These formats will be used when exporting analytics and billing reports.
          </p>
        </div>
      </div>
    </div>
  )
}

