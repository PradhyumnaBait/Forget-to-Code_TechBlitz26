'use client'

import { useState } from 'react'
import { Clock, Users, AlertTriangle, Sparkles, CheckCircle, Phone, User } from 'lucide-react'

const waitlist = [
  { id: 1, name: 'Tanvi Rao', age: 24, phone: '9823456710', reason: 'Severe headache', priority: 'urgent' as const, waited: '28m' },
  { id: 2, name: 'Suresh Nair', age: 65, phone: '9011223344', reason: 'Chest discomfort (mild)', priority: 'urgent' as const, waited: '15m' },
  { id: 3, name: 'Pooja Sharma', age: 33, phone: '9988001122', reason: 'Routine blood pressure check', priority: 'normal' as const, waited: '42m' },
  { id: 4, name: 'Vikram Joshi', age: 41, phone: '9871234560', reason: 'Prescription refill', priority: 'normal' as const, waited: '55m' },
  { id: 5, name: 'Anjali Gupta', age: 29, phone: '9765432109', reason: 'Skin rash', priority: 'normal' as const, waited: '1h 10m' },
]

export default function WaitlistPage() {
  const [list, setList] = useState(waitlist)

  const callIn = (id: number) => {
    setList(l => l.filter(p => p.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Waitlist</h1>
          <p className="text-sm text-text-secondary mt-0.5">Live queue for today's unscheduled patients.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-success bg-success-light px-3 py-1.5 rounded-full border border-success/20">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            {list.length} waiting
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'In Waitlist', value: list.length.toString(), bg: 'bg-primary-light', col: 'text-primary' },
          { icon: Clock, label: 'Avg. Wait', value: '42 min', bg: 'bg-warning-light', col: 'text-warning-text' },
          { icon: AlertTriangle, label: 'Urgent', value: list.filter(p => p.priority === 'urgent').length.toString(), bg: 'bg-danger-light', col: 'text-danger' },
        ].map(({ icon: Icon, label, value, bg, col }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${col}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent notice */}
      {list.some(p => p.priority === 'urgent') && (
        <div className="flex items-center gap-3 bg-danger-light border border-danger/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
          <div>
            <p className="text-sm font-bold text-danger">Urgent patients require immediate attention</p>
            <p className="text-xs text-danger/70">Please call in urgent patients before normal-priority ones.</p>
          </div>
        </div>
      )}

      {/* Waitlist */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="w-10 h-10 text-success" />
            <div>
              <p className="text-base font-semibold text-text-primary">Waitlist is clear! 🎉</p>
              <p className="text-sm text-text-muted">All patients have been called in.</p>
            </div>
          </div>
        ) : (
          list.map((p, index) => (
            <div key={p.id} className={`card p-5 flex items-center gap-4 ${p.priority === 'urgent' ? 'border-l-4 border-l-danger' : 'border-l-4 border-l-brand-border'}`}>
              {/* Position Badge */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                p.priority === 'urgent' ? 'bg-danger text-white' : 'bg-brand-bg border border-brand-border text-text-muted'
              }`}>
                #{index + 1}
              </div>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-bold text-text-primary">{p.name}</span>
                  <span className="text-xs text-text-muted">{p.age}Y</span>
                  {p.priority === 'urgent' && (
                    <span className="badge-danger text-[10px] px-2 py-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary truncate">{p.reason}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting {p.waited}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => callIn(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    p.priority === 'urgent'
                      ? 'bg-danger text-white hover:bg-red-600'
                      : 'btn-primary'
                  }`}
                >
                  Call In
                </button>
                <button className="p-2 rounded-xl border border-brand-border text-text-muted hover:bg-brand-bg transition-colors">
                  <Sparkles className="w-4 h-4 text-accent" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
