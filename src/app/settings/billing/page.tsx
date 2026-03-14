'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Save, IndianRupee, Percent, Wallet } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface BillingSettings {
  id?: string
  defaultConsultationFee: number
  taxPercentage: number
  currency: string
  paymentMethods: string[]
  autoGenerateInvoice: boolean
}

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash' },
  { key: 'upi', label: 'UPI' },
  { key: 'card', label: 'Card' },
]

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings>({
    defaultConsultationFee: 500,
    taxPercentage: 18,
    currency: 'INR',
    paymentMethods: ['cash', 'upi', 'card'],
    autoGenerateInvoice: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getBilling()
        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch billing settings:', error)
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
      const response = await settingsApi.updateBilling(settings)
      if (response.success) {
        setMessage('Billing settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof BillingSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const togglePaymentMethod = (method: string) => {
    setSettings(prev => {
      const exists = prev.paymentMethods.includes(method)
      return {
        ...prev,
        paymentMethods: exists
          ? prev.paymentMethods.filter(m => m !== method)
          : [...prev.paymentMethods, method],
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

  const taxAmount =
    (settings.defaultConsultationFee * (Number(settings.taxPercentage) || 0)) / 100
  const total = settings.defaultConsultationFee + taxAmount

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing Settings
          </h2>
          <p className="text-text-secondary mt-1">
            Configure default consultation fees, taxes and accepted payment methods
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
        {/* Fee & tax */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Default Consultation Fee</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                className="input pl-9"
                min={0}
                value={settings.defaultConsultationFee}
                onChange={(e) =>
                  handleChange(
                    'defaultConsultationFee',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Tax Percentage (GST)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                className="input pl-9"
                min={0}
                max={100}
                value={settings.taxPercentage}
                onChange={(e) =>
                  handleChange('taxPercentage', parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Accepted Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const active = settings.paymentMethods.includes(method.key)
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => togglePaymentMethod(method.key)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    active
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-brand-border bg-white text-text-secondary hover:bg-brand-bg'
                  }`}
                >
                  <span className="text-sm font-medium">{method.label}</span>
                  <span
                    className={`w-4 h-4 rounded-full border ${
                      active ? 'bg-primary border-primary' : 'border-brand-border'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-2">
            These options will be shown in the billing and payment screens.
          </p>
        </div>

        {/* Invoice behaviour */}
        <div className="flex items-center justify-between border border-brand-border rounded-lg p-4">
          <div>
            <p className="font-medium text-text-primary">Auto-generate Invoice</p>
            <p className="text-sm text-text-secondary">
              Automatically create an invoice when billing is confirmed.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleChange('autoGenerateInvoice', !settings.autoGenerateInvoice)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoGenerateInvoice ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                settings.autoGenerateInvoice ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg text-sm">
        <h3 className="font-semibold text-text-primary mb-2">Preview</h3>
        <p className="text-text-secondary">
          Consultation fee:{' '}
          <span className="font-semibold">
            {settings.currency === 'INR' ? '₹' : '$'}
            {settings.defaultConsultationFee.toFixed(2)}
          </span>{' '}
          +{' '}
          <span className="font-semibold">
            {settings.taxPercentage.toFixed(2)}% tax ({settings.currency === 'INR' ? '₹' : '$'}
            {taxAmount.toFixed(2)})
          </span>{' '}
          ={' '}
          <span className="font-semibold">
            {settings.currency === 'INR' ? '₹' : '$'}
            {total.toFixed(2)}
          </span>
          . Accepted payments:{' '}
          <span className="font-semibold">
            {settings.paymentMethods.length
              ? settings.paymentMethods
                  .map((m) => PAYMENT_METHODS.find(pm => pm.key === m)?.label || m)
                  .join(', ')
              : 'None'}
          </span>
          .
        </p>
      </div>
    </div>
  )
}

