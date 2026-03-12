'use client'

import { useState } from 'react'
import { Search, Plus, Phone, CalendarDays, FileText, MoreHorizontal, User, ChevronRight } from 'lucide-react'

const patients = [
  { id: 'P001', name: 'Rahul Mehta', age: 28, gender: 'M', phone: '9876543210', lastVisit: 'Mar 13, 2026', visits: 4, diagnosis: 'Viral fever' },
  { id: 'P002', name: 'Priya Singh', age: 32, gender: 'F', phone: '9988776655', lastVisit: 'Mar 13, 2026', visits: 7, diagnosis: 'Thyroid — on medication' },
  { id: 'P003', name: 'Amit Kumar', age: 45, gender: 'M', phone: '9123456789', lastVisit: 'Mar 10, 2026', visits: 2, diagnosis: 'Back pain, muscle strain' },
  { id: 'P004', name: 'Sona Rajan', age: 29, gender: 'F', phone: '9009988776', lastVisit: 'Mar 5, 2026', visits: 1, diagnosis: 'URTI' },
  { id: 'P005', name: 'Kavya Pillai', age: 35, gender: 'F', phone: '8765432198', lastVisit: 'Feb 28, 2026', visits: 9, diagnosis: 'Hypertension — stable' },
  { id: 'P006', name: 'Nikhil Das', age: 52, gender: 'M', phone: '9922334455', lastVisit: 'Feb 20, 2026', visits: 3, diagnosis: 'T2DM, routine' },
  { id: 'P007', name: 'Divya Menon', age: 26, gender: 'F', phone: '9811223344', lastVisit: 'Feb 10, 2026', visits: 5, diagnosis: 'Anxiety, sleep issues' },
  { id: 'P008', name: 'Arjun Sharma', age: 38, gender: 'M', phone: '9776655443', lastVisit: 'Jan 30, 2026', visits: 6, diagnosis: 'Migraine management' },
]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof patients[0] | null>(null)

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  return (
    <div className="p-6 flex gap-5 h-[calc(100vh-64px)]">
      {/* Left: Patient List */}
      <div className="flex flex-col flex-1 min-w-0 max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-text-primary">Patients</h1>
          <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Register New
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9 h-10 text-sm"
            placeholder="Search by name, ID or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <p className="text-xs text-text-muted mb-3">{filtered.length} patients found</p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === p.id
                  ? 'border-primary bg-primary-light shadow-sm'
                  : 'border-brand-border bg-white hover:border-text-muted hover:bg-brand-bg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    selected?.id === p.id ? 'bg-primary text-white' : 'bg-brand-bg border border-brand-border text-text-secondary'
                  }`}>
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.age}{p.gender} · {p.id}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <p className="text-xs text-text-secondary mt-2 line-clamp-1 pl-12">{p.diagnosis}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Patient Detail Panel */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className="card p-6 h-full overflow-y-auto">
            {/* Patient Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-brand-border">
              <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center text-xl font-extrabold text-accent shrink-0">
                {selected.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selected.age} yrs · {selected.gender === 'M' ? 'Male' : 'Female'}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.phone}</span>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-brand-bg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Patient ID', value: selected.id },
                { label: 'Total Visits', value: `${selected.visits} visits` },
                { label: 'Last Visit', value: selected.lastVisit },
              ].map(({ label, value }) => (
                <div key={label} className="bg-brand-bg rounded-xl p-3 border border-brand-border">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-text-primary">{value}</p>
                </div>
              ))}
            </div>

            {/* Chief Diagnosis */}
            <div className="mb-6">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Current Diagnosis</p>
              <div className="bg-warning-light border border-warning/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-text-primary">{selected.diagnosis}</p>
              </div>
            </div>

            {/* Visit History */}
            <div className="mb-6">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Visit History</p>
              <div className="space-y-2">
                {Array.from({ length: Math.min(selected.visits, 4) }, (_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                    <div className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary">Visit #{selected.visits - i}</p>
                        <span className="text-xs text-text-muted">Mar {13 - i * 7}, 2026</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">{selected.diagnosis}</p>
                    </div>
                    <button className="text-xs text-primary font-medium hover:underline shrink-0">View</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 btn-primary py-2.5 text-sm">
                <CalendarDays className="w-4 h-4" /> Book Appointment
              </button>
              <button className="flex items-center justify-center gap-2 btn-outline py-2.5 text-sm text-primary border-primary/30 hover:bg-primary-light">
                <FileText className="w-4 h-4" /> View Full Records
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-10 h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-brand-bg rounded-2xl border-2 border-dashed border-brand-border flex items-center justify-center">
              <User className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-secondary">Select a patient</p>
              <p className="text-sm text-text-muted mt-1">Click on any patient from the list to view their details.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
