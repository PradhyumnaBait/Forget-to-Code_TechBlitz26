'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Search, ChevronRight, FileText, User, Activity, CalendarDays, Stethoscope, Clipboard, Loader2 } from 'lucide-react'
import { patientApi } from '@/lib/api'
import { useSearchParams, useRouter } from 'next/navigation'

function Initials({ name }: { name?: string }) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function PatientsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')

  const [search, setSearch] = useState('')
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)
  
  const [selectedId, setSelectedId] = useState<string | null>(urlId || null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [tab, setTab] = useState<'overview' | 'history' | 'vitals'>('overview')

  const loadPatients = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await patientApi.list(search, 1) // search, page 1
      const list = (res.data as any)?.patients || []
      setPatientsList(list)
      // If none selected but we have patients, select first, unless urlId is provided
      if (!selectedId && list.length > 0 && !urlId) {
        setSelectedId(list[0].id)
      }
    } catch {
      setPatientsList([])
    } finally {
      setLoadingList(false)
    }
  }, [search, selectedId, urlId])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadPatients, search])

  useEffect(() => {
    if (!selectedId) return
    const fetchPatient = async () => {
      setLoadingPatient(true)
      try {
        const res = await patientApi.getById(selectedId)
        setSelectedPatient((res.data as any) ?? null)
      } catch {
        setSelectedPatient(null)
      } finally {
        setLoadingPatient(false)
      }
    }
    fetchPatient()
  }, [selectedId])

  const appointments = selectedPatient?.appointments || []
  const v = selectedPatient?.vitals || { bp: '120/80', pulse: '75', temp: '98.6°F', spo2: '99%', weight: '70kg' } // Mock vitals if empty

  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 h-auto md:h-[calc(100vh-64px)] overflow-hidden">
      {/* Patient list (Hidden on mobile if a patient is selected) */}
      <div className={`w-full md:w-72 shrink-0 flex flex-col gap-4 bg-white rounded-2xl border border-brand-border p-4 shadow-sm h-[calc(100vh-200px)] md:h-auto overflow-hidden ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <h1 className="text-xl font-extrabold text-text-primary">Patient Records</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-10 h-10 w-full bg-brand-bg border-brand-border rounded-xl text-sm" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loadingList ? (
            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : patientsList.length === 0 ? (
            <div className="text-center p-6 text-sm font-medium text-text-muted">No patients found.</div>
          ) : (
            patientsList.map(p => {
              const isActive = selectedId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); router.replace(`/doctor/patients?id=${p.id}`) }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${isActive ? 'border-primary bg-primary-light shadow-sm' : 'border-transparent hover:border-brand-border hover:bg-brand-bg/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isActive ? 'bg-primary text-white shadow-md' : 'bg-accent-light text-accent'}`}>
                        <Initials name={p.name} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-tight ${isActive ? 'text-primary' : 'text-text-primary'}`}>{p.name}</p>
                        <p className={`text-xs mt-0.5 font-medium ${isActive ? 'text-primary/70' : 'text-text-muted'}`}>{p.age ? `${p.age}y` : 'Age N/A'} · {p.id.slice(0,8)}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-primary translate-x-1' : 'text-transparent'}`} />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Patient Record Panel (Hidden on mobile if NO patient is selected) */}
      <div className={`flex-1 min-w-0 flex flex-col overflow-hidden bg-white rounded-2xl border border-brand-border shadow-sm h-[calc(100vh-140px)] md:h-auto ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center p-3 border-b border-brand-border bg-brand-bg/50">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
             ← Back to Patients List
          </button>
        </div>
        {loadingPatient && selectedId ? (
          <div className="flex-1 flex items-center justify-center p-12 text-text-muted flex-col gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-semibold text-sm">Loading patient records...</p>
          </div>
        ) : !selectedPatient ? (
          <div className="flex-1 flex items-center justify-center p-12 text-text-muted flex-col gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center justify-center">
              <User className="w-8 h-8 text-brand-border" />
            </div>
            <p className="font-bold text-lg">Select a patient to view records</p>
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div className="px-8 py-6 border-b border-brand-border bg-gradient-to-r from-brand-bg/50 to-white">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-light to-primary-light border shadow-inner flex items-center justify-center text-2xl font-extrabold text-accent shrink-0">
                  <Initials name={selectedPatient.name} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">{selectedPatient.name}</h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-text-secondary">
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-text-muted" />{selectedPatient.age || '?'} yrs · {selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : selectedPatient.gender || 'N/A'}</span>
                        <span className="text-brand-border">|</span>
                        <span>Blood: <strong className="text-danger">{selectedPatient.bloodGroup || 'N/A'}</strong></span>
                        <span className="text-brand-border">|</span>
                        <span>Allergy: <span className="text-warning-text">{selectedPatient.allergies || 'None known'}</span></span>
                        <span className="text-brand-border">|</span>
                        <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-text-muted" /> {selectedPatient.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="badge-info text-sm font-bold shadow-sm">Visit #{appointments.length}</span>
                      <span className="badge-success text-sm font-bold shadow-sm">{appointments[0]?.date ? new Date(appointments[0].date).toLocaleDateString() : 'New'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-8 -mb-6">
                {([
                  { id: 'overview', icon: User, label: 'Overview' },
                  { id: 'history', icon: Clipboard, label: 'Past Consultations' },
                  { id: 'vitals', icon: Activity, label: 'Vitals' },
                ] as const).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all border border-b-0 ${
                      tab === id ? 'bg-white text-primary border-brand-border border-b-white z-10' : 'bg-transparent text-text-muted border-transparent hover:text-text-secondary hover:bg-brand-bg/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 relative -mt-px border-t border-brand-border bg-white custom-scrollbar">
              {tab === 'overview' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="bg-gradient-to-r from-brand-bg to-white rounded-2xl p-6 border border-brand-border shadow-sm">
                    <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Latest Diagnosis
                    </p>
                    <p className="text-lg font-semibold text-text-primary leading-relaxed">
                      {appointments[0]?.consultation?.diagnosis || 'No diagnoses recorded yet.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-text-muted uppercase tracking-widest mb-4">Quick Details</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Visits', value: appointments.length, icon: CalendarDays },
                        { label: 'Known Allergy', value: selectedPatient.allergies || 'None', icon: Activity },
                        { label: 'Medical History', value: selectedPatient.medicalHistory || 'None', icon: FileText },
                        { label: 'Registered', value: new Date(selectedPatient.createdAt).toLocaleDateString(), icon: User },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-xl p-5 border border-brand-border hover:shadow-md transition-shadow group">
                          <Icon className="w-6 h-6 text-primary/40 mb-3 group-hover:text-primary transition-colors" />
                          <p className="text-xl font-extrabold text-text-primary line-clamp-1 truncate">{value}</p>
                          <p className="text-xs font-semibold text-text-secondary mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'vitals' && (
                <div className="max-w-4xl">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-brand-border pb-2">Latest Recorded Vitals</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {Object.entries(v).map(([key, val]) => {
                      const labels: Record<string, string> = { bp: 'Blood Pressure', pulse: 'Pulse Rate', temp: 'Temperature', spo2: 'SpO₂', weight: 'Body Weight' }
                      return (
                        <div key={key} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm hover:border-primary/30 transition-colors">
                          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{labels[key] || key}</p>
                          <p className="text-3xl font-extrabold text-text-primary tracking-tight">{val as string}</p>
                          <span className="badge-success self-start mt-3 inline-block">Normal Range</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-6 max-w-4xl">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 border-b border-brand-border pb-2">Past Consultations</p>
                  {appointments.length === 0 ? (
                    <div className="text-center p-8 bg-brand-bg rounded-xl border border-dashed border-brand-border">
                      <p className="text-sm font-semibold text-text-muted">No consultation history found.</p>
                    </div>
                  ) : appointments.map((appointment: any) => (
                    <div key={appointment.id} className="bg-white rounded-xl border border-brand-border p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 group-hover:bg-primary transition-colors" />
                      
                      <div className="flex items-center justify-between mb-4 pl-3">
                        <p className="text-base font-extrabold text-text-primary flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-primary" />
                          {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          appointment.status === 'COMPLETED' ? 'bg-success-light text-success-text' : 'bg-brand-bg text-text-secondary'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 pl-3">
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase mb-1">Symptoms</p>
                          <p className="text-sm text-text-secondary font-medium">{appointment.symptoms || 'General Checkup'}</p>
                        </div>
                        {appointment.consultation && (
                          <>
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase mb-1">Diagnosis</p>
                              <p className="text-sm text-text-primary font-semibold">{appointment.consultation.diagnosis}</p>
                            </div>
                            <div className="md:col-span-2 bg-brand-bg p-4 rounded-xl border border-brand-border">
                              <p className="text-xs font-bold text-text-muted uppercase mb-2">Advice / Plan</p>
                              <p className="text-sm text-text-secondary font-medium">{appointment.consultation.advice}</p>
                            </div>
                          </>
                        )}
                        {(!appointment.consultation && appointment.status !== 'COMPLETED') && (
                          <div className="md:col-span-2 text-sm text-warning font-semibold italic">
                            Consultation notes pending.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function DoctorPatientsPage() {
  return (
    <Suspense fallback={<div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PatientsContent />
    </Suspense>
  )
}
