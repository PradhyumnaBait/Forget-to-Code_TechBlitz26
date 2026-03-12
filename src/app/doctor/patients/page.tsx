'use client'

import { useState } from 'react'
import { Search, ChevronRight, FileText, User, Activity, CalendarDays, Stethoscope, Clipboard } from 'lucide-react'

const patients = [
  { id: 'P001', name: 'Priya Singh', age: 32, gender: 'F', phone: '9988776655', lastVisit: 'Today', visits: 7, blood: 'B+', allergy: 'Penicillin', chronic: 'Hypothyroidism', diagnosis: 'Thyroid review; TSH slightly elevated', vitals: { bp: '118/76', pulse: '72', temp: '98.4°F', spo2: '99%', weight: '58kg' } },
  { id: 'P002', name: 'Amit Kumar', age: 45, gender: 'M', phone: '9123456789', lastVisit: '3 days ago', visits: 2, blood: 'O+', allergy: 'None known', chronic: 'None', diagnosis: 'Lumbar muscle strain', vitals: { bp: '124/82', pulse: '80', temp: '98.6°F', spo2: '98%', weight: '76kg' } },
  { id: 'P003', name: 'Kavya Pillai', age: 35, gender: 'F', phone: '8765432198', lastVisit: '1 week ago', visits: 9, blood: 'A+', allergy: 'Sulfonamides', chronic: 'Hypertension', diagnosis: 'BP controlled; medication review', vitals: { bp: '132/86', pulse: '78', temp: '98.2°F', spo2: '97%', weight: '64kg' } },
]

const prescriptionHistory = [
  { date: 'Mar 13', meds: ['Levothyroxine 50mcg', 'Calcium + Vit D3'] },
  { date: 'Feb 10', meds: ['Metoprolol 25mg', 'Amlodipine 5mg'] },
  { date: 'Jan 5', meds: ['Paracetamol 500mg'] },
]

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(patients[0])
  const [tab, setTab] = useState<'overview' | 'history' | 'vitals'>('overview')

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  )

  return (
    <div className="p-6 flex gap-5 h-[calc(100vh-64px)]">
      {/* Patient list */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <h1 className="text-lg font-bold text-text-primary">Patient Records</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-9 h-9 text-sm" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected.id === p.id ? 'border-primary bg-primary-light shadow-sm' : 'border-brand-border bg-white hover:bg-brand-bg'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selected.id === p.id ? 'bg-primary text-white' : 'bg-accent-light text-accent'}`}>
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-tight">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.age}{p.gender} · {p.id}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <p className="text-xs text-text-secondary mt-2 pl-10 truncate">{p.diagnosis}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Patient Record Panel */}
      <div className="flex-1 min-w-0 card flex flex-col overflow-hidden">
        {/* Patient header */}
        <div className="px-6 py-5 border-b border-brand-border bg-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center text-xl font-extrabold text-accent shrink-0">
              {selected.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-text-secondary">
                    <span>{selected.age} yrs · {selected.gender === 'M' ? 'Male' : 'Female'}</span>
                    <span className="text-text-muted">|</span>
                    <span>Blood: <strong className="text-danger">{selected.blood}</strong></span>
                    <span className="text-text-muted">|</span>
                    <span>Allergy: <span className="text-warning-text font-medium">{selected.allergy}</span></span>
                    <span className="text-text-muted">|</span>
                    <span>Chronic: {selected.chronic}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="badge-info text-xs">Visit #{selected.visits}</span>
                  <span className="badge-success text-xs">{selected.lastVisit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-brand-border -mb-5 pb-0">
            {([
              { id: 'overview', icon: User, label: 'Overview' },
              { id: 'vitals', icon: Activity, label: 'Vitals' },
              { id: 'history', icon: Clipboard, label: 'Rx History' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-brand-bg rounded-xl p-4 border border-brand-border">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" /> Current Diagnosis
                </p>
                <p className="text-base font-semibold text-text-primary">{selected.diagnosis}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Quick Vitals</p>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(selected.vitals).map(([key, val]) => (
                    <div key={key} className="card p-3 text-center border-0 shadow-sm">
                      <p className="text-xs text-text-muted capitalize mb-1">{key === 'bp' ? 'BP' : key === 'spo2' ? 'SpO₂' : key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="text-sm font-extrabold text-text-primary">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Visits', value: selected.visits, sub: 'at this clinic', icon: CalendarDays },
                  { label: 'Known Allergy', value: selected.allergy, sub: 'flag before prescribing', icon: Activity },
                  { label: 'Chronic Condition', value: selected.chronic || 'None', sub: 'long-term tracking', icon: FileText },
                ].map(({ label, value, sub, icon: Icon }) => (
                  <div key={label} className="bg-brand-bg rounded-xl p-4 border border-brand-border">
                    <Icon className="w-5 h-5 text-text-muted mb-2" />
                    <p className="text-base font-bold text-text-primary">{value}</p>
                    <p className="text-xs text-text-secondary font-medium">{label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'vitals' && (
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Current Visit Vitals</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(selected.vitals).map(([key, val]) => {
                  const labels: Record<string, string> = { bp: 'Blood Pressure', pulse: 'Pulse Rate', temp: 'Temperature', spo2: 'SpO₂', weight: 'Body Weight' }
                  return (
                    <div key={key} className="card p-5 flex flex-col gap-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{labels[key] || key}</p>
                      <p className="text-3xl font-extrabold text-text-primary">{val}</p>
                      <span className="badge-success self-start">Normal</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Prescription History</p>
              {prescriptionHistory.map(({ date, meds }) => (
                <div key={date} className="card p-4 border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-text-primary flex items-center gap-2"><CalendarDays className="w-4 h-4 text-text-muted" />{date}, 2026</p>
                    <button className="text-xs text-primary font-medium hover:underline">View PDF</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meds.map(med => (
                      <span key={med} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-medium text-text-secondary">
                        💊 {med}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
