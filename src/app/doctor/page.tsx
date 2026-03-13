'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle2, AlertCircle, Clock, ChevronLeft, ChevronRight, FileText, UserPlus, Sparkles, TrendingUp, PhoneCall, Loader2, RefreshCw } from 'lucide-react'
import { appointmentApi, queueApi, analyticsApi } from '@/lib/api'

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-success',
  IN_CONSULTATION: 'bg-primary',
  NO_SHOW: 'bg-danger',
  CHECKED_IN: 'bg-warning',
  BOOKED: 'bg-warning',
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [toggle, setToggle] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [queueData, setQueueData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aptsRes, queueRes, statsRes] = await Promise.allSettled([
        appointmentApi.today(),
        queueApi.status(),
        analyticsApi.today(),
      ])
      if (aptsRes.status === 'fulfilled') setAppointments((aptsRes.value.data as any)?.appointments ?? [])
      if (queueRes.status === 'fulfilled') setQueueData((queueRes.value as any)?.data)
      if (statsRes.status === 'fulfilled') setStats((statsRes.value as any)?.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s so new appointments from the Appointments Interface appear automatically
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const current = appointments.find(a => a.status === 'IN_CONSULTATION')
  const nextUp = appointments.find(a => a.status === 'CHECKED_IN')
  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const waiting = appointments.filter(a => ['CHECKED_IN', 'BOOKED'].includes(a.status)).length

  const handleAISummary = async () => {
    setLoadingAI(true)
    try {
      const { aiApi } = await import('@/lib/api')
      const summary = `Summarise today's clinic session: ${completed} completed, ${waiting} patients waiting. Give a brief clinical insight.`
      const res = await aiApi.chat(summary)
      setAiSummary(res.data?.reply ?? '')
    } catch {
      setAiSummary('Unable to generate summary at this time.')
    } finally {
      setLoadingAI(false)
    }
  }

  const handleCallIn = async (appointmentId: string) => {
    try {
      await queueApi.next()
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'IN_CONSULTATION' } : a
      ))
    } catch { /* optimistic update already done */ }
  }

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="p-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Dr. Sharma's Schedule — {today}</h1>
          <button className="p-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-bg" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-sm font-medium text-text-secondary">{toggle ? 'Available' : 'On Break'}</span>
          <button onClick={() => setToggle(!toggle)} className={`w-11 h-6 rounded-full relative transition-colors ${toggle ? 'bg-success' : 'bg-brand-border'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${toggle ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="card-hover p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center shrink-0"><UserPlus className="w-5 h-5 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-text-primary">{loading ? '…' : appointments.length}</p>
            <p className="text-xs text-text-secondary">Today's Patients</p>
            {stats?.avgConsultationTime && <p className="text-xs font-medium text-success flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> ~{stats.avgConsultationTime}m avg</p>}
          </div>
        </div>
        <div className="card-hover p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-success" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-success-text">{loading ? '…' : completed}</p>
            <p className="text-xs text-text-secondary">Completed</p>
            {appointments.length > 0 && <p className="text-xs text-success font-medium mt-0.5">{Math.round(completed / appointments.length * 100)}% completion</p>}
          </div>
        </div>
        <div className="card-hover p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-warning-light flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-warning" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-warning-text">{loading ? '…' : waiting}</p>
            <p className="text-xs text-text-secondary">Remaining</p>
            <p className="text-xs text-text-muted mt-0.5">{queueData?.estimatedWaitMinutes ?? '~'} min avg wait</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Active Patients */}
        <div className="lg:col-span-2 space-y-6">
          {/* Now Consulting */}
          <div className="card p-6 border-2 border-primary/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex items-center justify-between mb-4">
              <span className="badge-info px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1" /> Now Consulting
              </span>
              <span className="text-sm font-semibold text-text-primary">{current?.timeSlot ?? '—'}</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
            ) : current ? (
              <>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center text-lg font-bold text-accent">
                    {initials(current.patient?.name ?? '')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{current.patient?.name} <span className="text-sm font-medium text-text-muted ml-2">{current.patient?.age ?? '?'}{current.patient?.gender ?? ''}</span></h2>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-text-secondary">
                      <AlertCircle className="w-4 h-4" /> Chief Complaint: <span className="text-text-primary font-medium">{current.symptoms ?? 'General consultation'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-brand-border">
                  <Link href={`/doctor/consultation?id=${current.id}`} className="btn-primary py-2.5 flex justify-center items-center gap-2 hover:scale-[1.01] transition-transform">
                    <FileText className="w-4 h-4" /> Open Notes & Prescription
                  </Link>
                  <Link href={`/doctor/patients?id=${current.patientId}`} className="btn-outline py-2.5 flex justify-center items-center gap-2 text-primary hover:bg-primary-light border-primary/30">
                    <Calendar className="w-4 h-4" /> Patient History
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-text-muted text-sm py-4">No patient currently in consultation. Call in the next patient.</div>
            )}
          </div>

          {/* Next Up */}
          {nextUp && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Next Up</span>
                <span className="badge-warning">Waiting</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center font-bold text-text-secondary">
                    {initials(nextUp.patient?.name ?? '')}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">{nextUp.patient?.name} <span className="text-xs font-medium text-text-muted ml-1">{nextUp.patient?.age ?? '?'}{nextUp.patient?.gender ?? ''}</span></p>
                    <p className="text-sm text-text-secondary">{nextUp.timeSlot} · {nextUp.symptoms ?? 'General'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCallIn(nextUp.id)}
                  className="text-sm font-medium text-white bg-primary px-3 py-1.5 rounded-xl hover:bg-primary-hover hover:scale-[1.04] active:scale-95 transition-all duration-200 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Daily Timeline */}
        <div className="card flex flex-col h-[calc(100vh-140px)] sticky top-6">
          <div className="p-4 border-b border-brand-border bg-white rounded-t-xl z-10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Daily Timeline</h3>
            <span className="text-xs text-text-muted">{appointments.length} apps</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-0">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /></div>
            ) : appointments.map((app, i) => (
              <div key={app.id ?? i} className="relative pl-6 pb-6 last:pb-0">
                {i < appointments.length - 1 && (
                  <div className="absolute top-3 left-[9px] w-0.5 h-full bg-brand-border" />
                )}
                <div className={`absolute top-1.5 left-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 ${statusColor[app.status] ?? 'bg-warning'}`}>
                  {app.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className={`p-3 rounded-xl border transition-all duration-150 hover:shadow-sm ${app.status === 'IN_CONSULTATION' ? 'border-primary/50 bg-primary-light shadow-sm' : 'border-brand-border bg-white hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-text-primary">{app.timeSlot}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${app.status === 'COMPLETED' ? 'text-success-text' : app.status === 'IN_CONSULTATION' ? 'text-primary' : 'text-text-muted'}`}>
                      {app.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{app.patient?.name ?? '—'}</p>
                  <p className="text-xs text-text-secondary truncate">{app.symptoms ?? 'General'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-brand-border bg-brand-bg rounded-b-xl flex justify-center">
            <button
              onClick={handleAISummary}
              disabled={loadingAI}
              className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent-hover p-2 rounded-lg bg-white shadow-sm border border-brand-border w-full justify-center"
            >
              {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loadingAI ? 'Generating…' : 'AI Daily Summary'}
            </button>
          </div>

          {aiSummary && (
            <div className="m-3 mt-0 p-3 bg-primary-light border border-primary/20 rounded-xl text-xs text-primary leading-relaxed">
              {aiSummary}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
