'use client'

import { useEffect, useState } from 'react'
import { Users, Save, Plus, Trash2, Shield } from 'lucide-react'
import { settingsApi } from '@/lib/api'

type Role = 'admin' | 'doctor' | 'reception'

interface StaffUser {
  id: string
  name: string
  role: Role
  email?: string
  phone?: string
  active: boolean
}

interface SystemSettingsResponse {
  [key: string]: any
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  doctor: 'Doctor',
  reception: 'Receptionist',
}

const DEFAULT_USER_IDS = new Set(['doctor-1', 'reception-1'])

export default function UserManagementSettingsPage() {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await settingsApi.getSystem()
        if (response.success) {
          const data = response.data as SystemSettingsResponse
          const storedUsers = (data.staff_users || data.users) as StaffUser[] | undefined

          if (Array.isArray(storedUsers) && storedUsers.length > 0) {
            setUsers(storedUsers)
          } else {
            // Seed with sensible defaults for demo
            setUsers([
              {
                id: 'admin-1',
                name: 'Admin User',
                role: 'admin',
                email: 'admin@meddesk.in',
                phone: '+91 9000000001',
                active: true,
              },
              {
                id: 'doctor-1',
                name: 'Dr. Ananya Sharma',
                role: 'doctor',
                email: 'doctor@meddesk.in',
                phone: '+91 9000000002',
                active: true,
              },
              {
                id: 'reception-1',
                name: 'Priya Nair',
                role: 'reception',
                email: 'reception@meddesk.in',
                phone: '+91 9000000003',
                active: true,
              },
            ])
          }
        }
      } catch (error) {
        console.error('Failed to fetch system settings for users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // Store under a dedicated system setting key
      const response = await settingsApi.updateSystem({ staff_users: users })
      if (response.success) {
        setMessage('User management settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save users. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const addUser = () => {
    const newUser: StaffUser = {
      id: `user-${Date.now()}`,
      name: '',
      role: 'reception',
      email: '',
      phone: '',
      active: true,
    }
    setUsers(prev => [...prev, newUser])
  }

  const updateUser = (id: string, field: keyof StaffUser, value: any) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, [field]: value } : u)))
  }

  const deleteUser = (id: string) => {
    if (DEFAULT_USER_IDS.has(id)) return
    setUsers(prev => prev.filter(u => u.id !== id))
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
            <Users className="w-5 h-5" />
            User Management
          </h2>
          <p className="text-text-secondary mt-1">
            Manage staff users and roles for the clinic
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addUser}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-brand-border text-text-primary hover:bg-brand-bg"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
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

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border border-brand-border rounded-lg p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  placeholder="Full name"
                  value={user.name}
                  onChange={(e) => updateUser(user.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={user.role}
                  onChange={(e) => updateUser(user.id, 'role', e.target.value as Role)}
                >
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="reception">Receptionist</option>
                </select>
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="user@meddesk.in"
                  value={user.email ?? ''}
                  onChange={(e) => updateUser(user.id, 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+91 ..."
                  value={user.phone ?? ''}
                  onChange={(e) => updateUser(user.id, 'phone', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-3">
              <button
                type="button"
                onClick={() => updateUser(user.id, 'active', !user.active)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                  user.active
                    ? 'bg-success-light text-success-text'
                    : 'bg-slate-100 text-text-muted'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user.active ? 'Active' : 'Disabled'}
              </button>
              <button
                type="button"
                onClick={() => deleteUser(user.id)}
                disabled={DEFAULT_USER_IDS.has(user.id)}
                className={`p-2 rounded-full ${
                  DEFAULT_USER_IDS.has(user.id)
                    ? 'text-text-muted cursor-not-allowed'
                    : 'hover:bg-danger-light text-danger'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-sm text-text-secondary border border-dashed border-brand-border rounded-lg p-6 text-center">
            No staff users configured yet. Click <span className="font-semibold">Add User</span> to
            create your first clinic staff account.
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">How this works</h3>
        <p className="text-text-secondary">
          This screen manages a list of staff users and roles that is stored in the{' '}
          <span className="font-semibold">system settings</span> (`staff_users`). It is ideal for a
          hackathon/demo environment where you want to showcase role-based access without building a
          full authentication system for each staff member.
        </p>
      </div>
    </div>
  )
}

