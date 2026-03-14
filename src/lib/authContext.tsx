'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi } from '@/lib/api'

interface Patient {
  id: string
  name: string
  phone: string
  age?: number
  gender?: string
}

interface AuthContextType {
  token: string | null
  patient: Patient | null
  staffRole: 'doctor' | 'reception' | 'admin' | null
  isAuthenticated: boolean
  loginPatient: (token: string, patient: Patient) => void
  loginStaff: (role: 'doctor' | 'reception' | 'admin') => void
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [staffRole, setStaffRole] = useState<'doctor' | 'reception' | 'admin' | null>(null)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem('md_token')
    const p = localStorage.getItem('md_patient_data')
    const s = localStorage.getItem('md_staff_role') as 'doctor' | 'reception' | 'admin' | null
    if (t) setToken(t)
    if (p) {
      try { setPatient(JSON.parse(p)) } catch { /* ignore */ }
    }
    if (s) setStaffRole(s)
  }, [])

  const loginPatient = useCallback((t: string, p: Patient) => {
    localStorage.setItem('md_token', t)
    localStorage.setItem('md_patient_data', JSON.stringify(p))
    setToken(t)
    setPatient(p)
    setStaffRole(null)
  }, [])

  const loginStaff = useCallback((role: 'doctor' | 'reception' | 'admin') => {
    localStorage.setItem('md_staff_role', role)
    setStaffRole(role)
    setToken(null)
    setPatient(null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('md_token')
    localStorage.removeItem('md_patient_data')
    localStorage.removeItem('md_staff_role')
    setToken(null)
    setPatient(null)
    setStaffRole(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) return
    try {
      const res = await authApi.getProfile()
      if (res.success && res.data) {
        const p = res.data as Patient
        setPatient(p)
        localStorage.setItem('md_patient_data', JSON.stringify(p))
      }
    } catch { /* silent fail */ }
  }, [token])

  return (
    <AuthContext.Provider value={{
      token,
      patient,
      staffRole,
      isAuthenticated: !!(token || staffRole),
      loginPatient,
      loginStaff,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
