'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Save, DollarSign, Percent, Receipt } from 'lucide-react'
import { settingsApi } from '@/lib/api'

interface BillingSettings {
  id?: string
  defaultConsultationFee: number
  currency: string
  paymentMethods: string[]
  autoGenerateInvoice: boolean
}

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'upi', label: 'UPI', icon: '📱' },
  { key: 'card', label: 'Card', icon: '💳' },
  { key: 'netbanking', label: 'Net Banking', icon: '🏦' },
]

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings>({
    defaultConsultationFee: 500,
    currency: 'INR',
    paymentMethods: ['cash', 'upi', 'card'],
    autoGenerateInvoice: true
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

  const handleChange = (field: keyof BillingSettings, value: string | number | boolean | string[]) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentMethodToggle = (method: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }))
  }

  // Calculate sample bill
  const calculateSampleBill = () => {
    const fee = settings.defaultConsultationFee
    const total = fee
    return { fee, total }
  }

  const sampleBill = calculateSampleBill()

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
            <CreditCard className="w-5 h-5" />
            Billing Settings
          </h2>
          <p className="text-text-secondary mt-1">
            Configure consultation fees and payment options
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
        {/* Fee Structure */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fee Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Consultation Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                <input
                  type="number"
                  className="input pl-8"
                  min="0"
                  step="50"
                  value={settings.defaultConsultationFee}
                  onChange={(e) => handleChange('defaultConsultationFee', parseFloat(e.target.value) || 0)}
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
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4">Accepted Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.key}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  settings.paymentMethods.includes(method.key)
                    ? 'border-primary bg-primary-light'
                    : 'border-brand-border hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodToggle(method.key)}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
                  checked={settings.paymentMethods.includes(method.key)}
                  onChange={() => handlePaymentMethodToggle(method.key)}
                />
                <span className="text-xl">{method.icon}</span>
                <span className="font-medium text-text-primary">{method.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Settings */}
        <div>
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoice Settings
          </h3>
          <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg">
            <input
              type="checkbox"
              id="autoGenerateInvoice"
              className="w-4 h-4 text-primary bg-white border-brand-border rounded focus:ring-primary focus:ring-2"
              checked={settings.autoGenerateInvoice}
              onChange={(e) => handleChange('autoGenerateInvoice', e.target.checked)}
            />
            <div>
              <label htmlFor="autoGenerateInvoice" className="font-medium text-text-primary cursor-pointer">
                Auto-generate Invoices
              </label>
              <p className="text-xs text-text-muted">
                Automatically create invoices when appointments are completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Bill Preview */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Sample Bill Preview</h3>
        <div className="bg-white p-4 rounded border max-w-sm">
          <div className="text-center mb-3">
            <div className="font-bold text-text-primary">MedDesk Clinic</div>
            <div className="text-xs text-text-muted">Invoice #INV-001</div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Consultation Fee</span>
              <span>₹{sampleBill.fee.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{sampleBill.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t text-xs text-text-muted">
            Payment Methods: {settings.paymentMethods.map(m => 
              PAYMENT_METHODS.find(pm => pm.key === m)?.label
            ).join(', ')}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="mt-8 p-4 bg-brand-bg border border-brand-border rounded-lg">
        <h3 className="font-semibold text-text-primary mb-3">Billing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Consultation Fee</div>
            <div className="font-medium text-text-primary">
              ₹{settings.defaultConsultationFee}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Payment Methods</div>
            <div className="font-medium text-text-primary">
              {settings.paymentMethods.length} enabled
            </div>
          </div>
          <div>
            <div className="text-text-muted">Auto Invoice</div>
            <div className="font-medium text-text-primary">
              {settings.autoGenerateInvoice ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}