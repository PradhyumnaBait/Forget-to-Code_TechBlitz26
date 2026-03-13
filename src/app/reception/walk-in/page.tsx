'use client'

import { useState } from 'react'
import { User, Phone, Hash, FileText, ChevronDown, Clock, CheckCircle, ArrowRight, Activity, Users } from 'lucide-react'

const slots = [
  { time: '10:30 AM', status: 'available' },
  { time: '11:00 AM', status: 'available' },
  { time: '11:30 AM', status: 'booked' },
  { time: '12:00 PM', status: 'reserved' },
  { time: '2:00 PM', status: 'available' },
  { time: '2:30 PM', status: 'available' },
]

export default function WalkInPage() {
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }, 1000)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Register Walk-In Patient</h1>
        <p className="text-sm text-text-secondary mt-0.5">For patients arriving without a prior appointment.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Registration Form */}
        <div className="lg:col-span-3 card p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name <span className="text-danger">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input required type="text" className="input pl-9" placeholder="e.g. Ramesh Patel" />
                </div>
              </div>
              <div>
                <label className="label">Phone Number <span className="text-danger">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border border-brand-border rounded-lg bg-brand-bg text-sm text-text-secondary font-medium shrink-0">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input required type="tel" maxLength={10} className="input pl-9" placeholder="98765 43210" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="number" className="input pl-9" placeholder="e.g. 45" />
                </div>
              </div>
              <div>
                <label className="label">Gender</label>
                <div className="relative">
                  <select className="input appearance-none pr-9 bg-white">
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Symptoms / Chief Complaint</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <textarea rows={3} className="input pl-9 resize-none" placeholder="Briefly describe the issue..." />
              </div>
            </div>

            <div>
              <label className="label mb-2">Priority Level</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 hover:scale-[1.02] ${
                    priority === 'normal'
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-brand-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  <User className="w-4 h-4" /> Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all duration-150 hover:scale-[1.02] ${
                    priority === 'urgent'
                      ? 'border-danger bg-danger-light text-danger-text'
                      : 'border-brand-border text-text-secondary hover:border-danger/40'
                  }`}
                >
                  <Activity className="w-4 h-4" /> Urgent Care
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 btn-primary py-3">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Find Next Available Slot & Register <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Availability Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slots */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-between">
              Available Slots Today
              <span className="text-xs font-normal text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Live
              </span>
            </h2>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {slots.map(({ time, status }) => (
                <div
                  key={time}
                  className={`text-center py-2 px-1 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    status === 'available' ? 'border-primary/30 bg-primary-light text-primary hover:scale-[1.02]' :
                    status === 'reserved' ? 'border-warning/30 bg-warning-light text-warning-text' :
                    'border-brand-border bg-brand-bg text-text-muted opacity-60'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-text-muted text-center pt-3 border-t border-brand-border">
              Patients without a slot are added to the waitlist.
            </p>
          </div>

          {/* Queue Widget */}
          <div className="card p-5 bg-gradient-to-br from-white to-brand-bg">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Queue Status</h2>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">6</p>
                <p className="text-xs text-text-secondary">patients waiting</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">45m</p>
                <p className="text-xs text-text-secondary">estimated wait</p>
              </div>
            </div>
            
            <button className="w-full mt-5 py-2 text-sm font-medium text-text-secondary border border-brand-border rounded-xl hover:bg-white hover:border-text-muted hover:scale-[1.01] transition-all duration-150">
              Add to Waitlist Instead
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {success && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <CheckCircle className="w-5 h-5 text-success" />
          <p className="text-sm font-medium">Walk-in registered! Assigned to closest available slot.</p>
        </div>
      )}
    </div>
  )
}
