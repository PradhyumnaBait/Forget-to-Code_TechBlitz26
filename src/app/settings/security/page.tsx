'use client'

import { useState } from 'react'
import { Shield, Save, Lock, Clock, Smartphone, Eye, EyeOff } from 'lucide-react'

interface SecuritySettings {
  sessionTimeout: number
  twoFactorEnabled: boolean
  passwordMinLength: number
  requireSpecialChars: boolean
  maxLoginAttempts: number
  lockoutDuration: number
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    twoFactorEnabled: false,
    passwordMinLength: 8,
    requireSpecialChars: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')

  const handleSave = () => {
    setMessage('Security settings saved successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match!')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    setMessage('Password changed successfully!')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordForm(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleChange = (field: keyof SecuritySettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
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
            Configure security policies and authentication
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 btn-primary"
        >
          <Save className="w-4 h-4" />
          Save Changes
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
        {/* Password Change */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password Management
          </h3>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-secondary"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handlePasswordChange} className="btn-primary">
                  Update Password
                </button>
                <button 
                  onClick={() => setShowPasswordForm(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Session Management */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Session Management
          </h3>
          <div className="max-w-md">
            <label className="label">Session Timeout (minutes)</label>
            <select
              className="input"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
            <p className="text-xs text-text-muted mt-1">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Two-Factor Authentication
          </h3>
          <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg max-w-md">
            <input
              type="checkbox"
              id="twoFactorEnabled"
              className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
              checked={settings.twoFactorEnabled}
              onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
            />
            <div>
              <label htmlFor="twoFactorEnabled" className="font-medium text-text-primary cursor-pointer">
                Enable Two-Factor Authentication
              </label>
              <p className="text-xs text-text-muted">
                Require SMS verification for login
              </p>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Password Policy</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="label">Minimum Password Length</label>
              <select
                className="input"
                value={settings.passwordMinLength}
                onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
              >
                <option value={6}>6 characters</option>
                <option value={8}>8 characters</option>
                <option value={10}>10 characters</option>
                <option value={12}>12 characters</option>
              </select>
            </div>
            <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg">
              <input
                type="checkbox"
                id="requireSpecialChars"
                className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
                checked={settings.requireSpecialChars}
                onChange={(e) => handleChange('requireSpecialChars', e.target.checked)}
              />
              <div>
                <label htmlFor="requireSpecialChars" className="font-medium text-text-primary cursor-pointer">
                  Require Special Characters
                </label>
                <p className="text-xs text-text-muted">
                  Passwords must contain at least one special character
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Security */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Login Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="label">Max Login Attempts</label>
              <select
                className="input"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              >
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
            </div>
            <div>
              <label className="label">Lockout Duration (minutes)</label>
              <select
                className="input"
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Security Summary */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Security Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Session Timeout</div>
            <div className="font-medium text-text-primary">{settings.sessionTimeout} minutes</div>
          </div>
          <div>
            <div className="text-text-muted">Two-Factor Auth</div>
            <div className="font-medium text-text-primary">
              {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Password Length</div>
            <div className="font-medium text-text-primary">{settings.passwordMinLength}+ characters</div>
          </div>
          <div>
            <div className="text-text-muted">Login Attempts</div>
            <div className="font-medium text-text-primary">{settings.maxLoginAttempts} max</div>
          </div>
        </div>
      </div>
    </div>
  )
}