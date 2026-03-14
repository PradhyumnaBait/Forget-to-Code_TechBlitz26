'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { settingsApi } from '@/lib/api'

interface ClinicSettings {
  clinicName: string
  address: string
  phone: string
  email: string
  consultationFee: number
  locationLink: string
}

interface ScheduleSettings {
  workingDays: string[]
  startTime: string
  endTime: string
  breakStartTime: string
  breakEndTime: string
  appointmentDuration: number
  bufferTime: number
}

interface AppSettings {
  clinic: ClinicSettings
  schedule: ScheduleSettings
  isLoaded: boolean
}

interface SettingsContextType {
  settings: AppSettings
  refreshSettings: () => Promise<void>
  updateClinicSettings: (newSettings: Partial<ClinicSettings>) => void
  updateScheduleSettings: (newSettings: Partial<ScheduleSettings>) => void
}

const defaultSettings: AppSettings = {
  clinic: {
    clinicName: 'MedDesk Clinic',
    address: 'Andheri West, Mumbai',
    phone: '+91 9876543210',
    email: 'info@meddesk.in',
    consultationFee: 500,
    locationLink: ''
  },
  schedule: {
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    appointmentDuration: 30,
    bufferTime: 5
  },
  isLoaded: false
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  const refreshSettings = useCallback(async () => {
    try {
      const [clinicRes, scheduleRes] = await Promise.all([
        settingsApi.getClinic(),
        settingsApi.getSchedule()
      ])

      setSettings(prev => ({
        ...prev,
        clinic: clinicRes.success ? clinicRes.data : prev.clinic,
        schedule: scheduleRes.success ? scheduleRes.data : prev.schedule,
        isLoaded: true
      }))
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSettings(prev => ({ ...prev, isLoaded: true }))
    }
  }, [])

  const updateClinicSettings = useCallback((newSettings: Partial<ClinicSettings>) => {
    setSettings(prev => ({
      ...prev,
      clinic: { ...prev.clinic, ...newSettings }
    }))
  }, [])

  const updateScheduleSettings = useCallback((newSettings: Partial<ScheduleSettings>) => {
    setSettings(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...newSettings }
    }))
  }, [])

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  return (
    <SettingsContext.Provider value={{
      settings,
      refreshSettings,
      updateClinicSettings,
      updateScheduleSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}