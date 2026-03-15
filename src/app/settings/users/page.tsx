'use client'

import { useState, useEffect } from 'react'
import { Users, Save, UserPlus, Shield, Mail, Key, Trash2, Plus, Edit } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'reception' | 'admin'
  status: 'active' | 'inactive'
  isDefault?: boolean
}

const DEFAULT_USERS: User[] = [
  {
    id: 'default-doctor',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@meddesk.in',
    role: 'doctor',
    status: 'active',
    isDefault: true
  },
  {
    id: 'default-reception',
    name: 'Reception Staff',
    email: 'reception@meddesk.in',
    role: 'reception',
    status: 'active',
    isDefault: true
  }
]

const ROLE_PERMISSIONS = {
  admin: ['Full system access', 'Manage settings', 'User management', 'View all data'],
  doctor: ['View appointments', 'Manage consultations', 'View patient records', 'Generate prescriptions'],
  reception: ['Manage bookings', 'Handle walk-ins', 'Process billing', 'Manage queue']
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'reception' as 'doctor' | 'reception',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Here you would save to backend
      setMessage('User settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save user settings.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage('Please fill in all fields.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      isDefault: false
    }

    setUsers(prev => [...prev, user])
    setNewUser({ name: '', email: '', role: 'reception', password: '' })
    setShowAddForm(false)
    setMessage('User added successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user?.isDefault) {
      setMessage('Cannot delete default users.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      setMessage('User deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const toggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user?.isDefault) {
      setMessage('Cannot modify default users.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'doctor': return 'bg-blue-100 text-blue-800'
      case 'reception': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
            Manage staff accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 btn-secondary"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 btn-primary"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
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

      {/* Add User Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-brand-border rounded-lg bg-brand-bg">
          <h3 className="font-semibold text-text-primary mb-4">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'doctor' | 'reception' }))}
              >
                <option value="reception">Reception</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAddUser} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Current Users */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Current Users</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary flex items-center gap-2">
                      {user.name}
                      {user.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                    title={`${user.status === 'active' ? 'Active' : 'Inactive'} - Click to toggle`}
                  ></button>
                  {!user.isDefault && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Role Permissions */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role Permissions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ROLE_PERMISSIONS).filter(([role]) => role !== 'admin').map(([role, permissions]) => (
              <div key={role} className="p-4 border border-brand-border rounded-lg">
                <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mb-3 ${getRoleColor(role)}`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
                <ul className="space-y-1 text-sm">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2 text-text-secondary">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Login Credentials Info */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Default Login Credentials
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800 mb-3">
              <strong>Default Staff Accounts:</strong> These accounts are pre-configured for system access
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-blue-800 mb-1">Doctor Login</div>
                <div className="text-gray-600">doctor@meddesk.in</div>
                <div className="text-gray-600">••••••••</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-green-800 mb-1">Reception Login</div>
                <div className="text-gray-600">reception@meddesk.in</div>
                <div className="text-gray-600">••••••••</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Total Users</div>
            <div className="font-medium text-text-primary">{users.length}</div>
          </div>
          <div>
            <div className="text-text-muted">Active Users</div>
            <div className="font-medium text-text-primary">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Doctors</div>
            <div className="font-medium text-text-primary">
              {users.filter(u => u.role === 'doctor').length}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Staff</div>
            <div className="font-medium text-text-primary">
              {users.filter(u => u.role === 'reception').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}