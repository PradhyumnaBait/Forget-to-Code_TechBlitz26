'use client'

import { useState, useEffect } from 'react'
import { Clock, Save, Coffee } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface ScheduleSettings {
  id?: string
  workingDays: string[]
  startTime: string
  endTime: string
  breakStartTime: string
  breakEndTime: string
  appointmentDuration: number
  bufferTime: number
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export default function ScheduleSettingsPage() {
  const [settings, setSettings] = useState<ScheduleSettings>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    appointmentDuration: 30,
    bufferTime: 5
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getSchedule()
        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch schedule settings:', error)
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
      const response = await settingsApi.updateSchedule(settings)
      if (response.success) {
        setMessage('Schedule settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }))
  }

  const handleChange = (field: keyof ScheduleSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  // Calculate total working hours and slots
  const calculateStats = () => {
    const start = new Date(`2000-01-01T${settings.startTime}:00`)
    const end = new Date(`2000-01-01T${settings.endTime}:00`)
    const breakStart = new Date(`2000-01-01T${settings.breakStartTime}:00`)
    const breakEnd = new Date(`2000-01-01T${settings.breakEndTime}:00`)
    
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60)
    const workingMinutes = totalMinutes - breakMinutes
    const totalSlots = Math.floor(workingMinutes / (settings.appointmentDuration + settings.bufferTime))
    
    return {
      workingHours: Math.floor(workingMinutes / 60),
      workingMinutes: workingMinutes % 60,
      totalSlots
    }
  }

  const stats = calculateStats()

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
            <Clock className="w-5 h-5" />
            Doctor Schedule
          </h2>
          <p className="text-text-secondary mt-1">
            Configure working hours and appointment timing
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
        {/* Working Days */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Working Days</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.key}
                onClick={() => handleDayToggle(day.key)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  settings.workingDays.includes(day.key)
                    ? 'bg-primary text-white'
                    : 'bg-brand-bg text-text-secondary hover:bg-brand-border'
                }`}
              >
                {day.label.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                className="input"
                value={settings.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                className="input"
                value={settings.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Break Time */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            Break Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Break Start</label>
              <input
                type="time"
                className="input"
                value={settings.breakStartTime}
                onChange={(e) => handleChange('breakStartTime', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Break End</label>
              <input
                type="time"
                className="input"
                value={settings.breakEndTime}
                onChange={(e) => handleChange('breakEndTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Appointment Settings */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Appointment Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Appointment Duration (minutes)</label>
              <select
                className="input"
                value={settings.appointmentDuration}
                onChange={(e) => handleChange('appointmentDuration', parseInt(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="label">Buffer Time (minutes)</label>
              <select
                className="input"
                value={settings.bufferTime}
                onChange={(e) => handleChange('bufferTime', parseInt(e.target.value))}
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Buffer time is added between appointments for preparation
          </p>
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Schedule Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Working Days</div>
            <div className="font-medium text-text-primary">
              {settings.workingDays.length} days/week
            </div>
          </div>
          <div>
            <div className="text-text-muted">Daily Hours</div>
            <div className="font-medium text-text-primary">
              {stats.workingHours}h {stats.workingMinutes}m
            </div>
          </div>
          <div>
            <div className="text-text-muted">Max Slots/Day</div>
            <div className="font-medium text-text-primary">
              {stats.totalSlots} appointments
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}