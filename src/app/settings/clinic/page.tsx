'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, Phone, Mail, DollarSign, Save, ExternalLink } from 'lucide-react'
import { settingsApi } from '@/lib/api'
import { useSettings } from '@/lib/settingsContext'

interface ClinicSettings {
  id?: string
  clinicName: string
  address: string
  phone: string
  email: string
  consultationFee: number
  locationLink: string
}

export default function ClinicSettingsPage() {
  const { updateClinicSettings } = useSettings()
  const [settings, setSettings] = useState<ClinicSettings>({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    consultationFee: 500,
    locationLink: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getClinic()
        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch clinic settings:', error)
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
      const response = await settingsApi.updateClinic(settings)
      if (response.success) {
        // Update the global settings context
        updateClinicSettings(settings)
        setMessage('Clinic settings saved successfully! Changes will be reflected across the website.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof ClinicSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
            <Building2 className="w-5 h-5" />
            Clinic Information
          </h2>
          <p className="text-text-secondary mt-1">
            Manage your clinic's basic information and contact details
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

      <div className="space-y-6">
        {/* Clinic Name */}
        <div>
          <label className="label">Clinic Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. MedDesk Clinic"
            value={settings.clinicName}
            onChange={(e) => handleChange('clinicName', e.target.value)}
          />
        </div>

        {/* Address */}
        <div>
          <label className="label">Address</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Enter clinic address"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="tel"
                className="input pl-9"
                placeholder="+91 9876543210"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                className="input pl-9"
                placeholder="info@meddesk.in"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Consultation Fee */}
        <div>
          <label className="label">Default Consultation Fee</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="number"
              className="input pl-9"
              placeholder="500"
              value={settings.consultationFee}
              onChange={(e) => handleChange('consultationFee', parseFloat(e.target.value) || 0)}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            This will be used as the default fee for new appointments
          </p>
        </div>

        {/* Google Maps Location */}
        <div>
          <label className="label">Google Maps Location (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="url"
              className="input pl-9 pr-10"
              placeholder="https://maps.google.com/..."
              value={settings.locationLink}
              onChange={(e) => handleChange('locationLink', e.target.value)}
            />
            {settings.locationLink && (
              <a
                href={settings.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Share this link with patients for easy navigation
          </p>
        </div>
      </div>

      {/* Preview Card */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Preview</h3>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-text-primary">{settings.clinicName || 'Clinic Name'}</div>
          {settings.address && <div className="text-text-secondary">{settings.address}</div>}
          <div className="flex gap-4 text-text-muted">
            {settings.phone && <span>📞 {settings.phone}</span>}
            {settings.email && <span>✉️ {settings.email}</span>}
          </div>
          {settings.consultationFee > 0 && (
            <div className="text-primary font-medium">Consultation: ₹{settings.consultationFee}</div>
          )}
        </div>
      </div>
    </div>
  )
}