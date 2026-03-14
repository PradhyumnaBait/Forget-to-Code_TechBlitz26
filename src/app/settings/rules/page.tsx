'use client'

import { useState, useEffect } from 'react'
import { FileText, Save, Users, Clock, Calendar } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface RulesSettings {
  id?: string
  maxAppointmentsPerDay: number
  allowWalkIns: boolean
  cancellationTimeLimit: number
  rescheduleLimit: number
  advanceBookingDays: number
}

export default function AppointmentRulesPage() {
  const [settings, setSettings] = useState<RulesSettings>({
    maxAppointmentsPerDay: 40,
    allowWalkIns: true,
    cancellationTimeLimit: 2,
    rescheduleLimit: 3,
    advanceBookingDays: 30
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
        setMessage('Failed to load appointment rules. Please refresh the page.')
        setTimeout(() => setMessage(''), 3000)
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

  const handleChange = (field: keyof RulesSettings, value: string | number | boolean) => {
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
            <FileText className="w-5 h-5" />
            Appointment Rules
          </h2>
          <p className="text-text-secondary mt-1">
            Configure booking limits and appointment policies
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
        {/* Daily Limits */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Daily Appointment Limits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Maximum Appointments Per Day</label>
              <input
                type="number"
                className="input"
                min="1"
                max="100"
                value={settings.maxAppointmentsPerDay}
                onChange={(e) => handleChange('maxAppointmentsPerDay', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-text-muted mt-1">
                Total appointments allowed per day including walk-ins
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg">
              <input
                type="checkbox"
                id="allowWalkIns"
                className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
                checked={settings.allowWalkIns}
                onChange={(e) => handleChange('allowWalkIns', e.target.checked)}
              />
              <div>
                <label htmlFor="allowWalkIns" className="font-medium text-text-primary cursor-pointer">
                  Allow Walk-in Appointments
                </label>
                <p className="text-xs text-text-muted">
                  Patients can visit without prior booking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation & Rescheduling */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Cancellation & Rescheduling
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Cancellation Time Limit (hours)</label>
              <select
                className="input"
                value={settings.cancellationTimeLimit}
                onChange={(e) => handleChange('cancellationTimeLimit', parseInt(e.target.value))}
              >
                <option value={1}>1 hour before</option>
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={12}>12 hours before</option>
                <option value={24}>24 hours before</option>
              </select>
              <p className="text-xs text-text-muted mt-1">
                Minimum time required before appointment to cancel
              </p>
            </div>
            <div>
              <label className="label">Maximum Reschedules Allowed</label>
              <select
                className="input"
                value={settings.rescheduleLimit}
                onChange={(e) => handleChange('rescheduleLimit', parseInt(e.target.value))}
              >
                <option value={1}>1 reschedule</option>
                <option value={2}>2 reschedules</option>
                <option value={3}>3 reschedules</option>
                <option value={5}>5 reschedules</option>
                <option value={0}>Unlimited</option>
              </select>
              <p className="text-xs text-text-muted mt-1">
                How many times a patient can reschedule the same appointment
              </p>
            </div>
          </div>
        </div>

        {/* Advance Booking */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Advance Booking
          </h3>
          <div>
            <label className="label">Advance Booking Days</label>
            <select
              className="input max-w-xs"
              value={settings.advanceBookingDays}
              onChange={(e) => handleChange('advanceBookingDays', parseInt(e.target.value))}
            >
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
              <option value={30}>1 month</option>
              <option value={60}>2 months</option>
              <option value={90}>3 months</option>
            </select>
            <p className="text-xs text-text-muted mt-1">
              How far in advance patients can book appointments
            </p>
          </div>
        </div>
      </div>

      {/* Rules Summary */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Current Rules Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Max Daily Appointments</div>
            <div className="font-medium text-text-primary">
              {settings.maxAppointmentsPerDay} appointments
            </div>
          </div>
          <div>
            <div className="text-text-muted">Walk-ins</div>
            <div className="font-medium text-text-primary">
              {settings.allowWalkIns ? 'Allowed' : 'Not Allowed'}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Cancellation Limit</div>
            <div className="font-medium text-text-primary">
              {settings.cancellationTimeLimit} hours before
            </div>
          </div>
          <div>
            <div className="text-text-muted">Advance Booking</div>
            <div className="font-medium text-text-primary">
              {settings.advanceBookingDays} days ahead
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}