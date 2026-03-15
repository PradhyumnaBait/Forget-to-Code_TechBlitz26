'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const dateStr = selectedDate.toISOString().split('T')[0]
  const displayDate = selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })

  const isUrgent = (app: any) =>
    typeof app?.symptoms === 'string' && /urgent/i.test(app.symptoms) ||
    typeof app?.reason === 'string' && (app.reason.includes('🚨') || /urgent/i.test(app.reason))

  const notifiedRef = useRef<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const isDateToday = isToday(selectedDate)
      const aptReq = isDateToday ? appointmentApi.today() : appointmentApi.list({ date: dateStr })
      
      const [aptsRes, queueRes, statsRes] = await Promise.allSettled([
        aptReq,
        queueApi.status(), // queue status only really applies to today
        analyticsApi.today(dateStr),
      ])
      
      if (aptsRes.status === 'fulfilled') {
        const data = aptsRes.value.data as any
        const apts = data?.appointments ?? []
        setAppointments(apts)
        // Notify doctor of any urgent patients not yet notified
        if (typeof window !== 'undefined' && 'Notification' in window) {
          Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
              apts.forEach((a: any) => {
                if (isUrgent(a) && !notifiedRef.current.has(a.id)) {
                  notifiedRef.current.add(a.id)
                  new Notification('🚨 Urgent Patient Alert — MedDesk', {
                    body: `${a.patient?.name} at ${a.timeSlot} — ${a.symptoms ?? a.reason ?? 'Urgent Care'}`,
                    icon: '/logo.png',
                  })
                }
              })
            }
          })
        }
      }
      if (isDateToday && queueRes.status === 'fulfilled') setQueueData((queueRes.value as any)?.data)
      else setQueueData(null)
      
      if (statsRes.status === 'fulfilled') setStats((statsRes.value as any)?.data)
    } finally {
      setLoading(false)
    }
  }, [dateStr, selectedDate])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!isToday(selectedDate)) return
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load, selectedDate])

  const changeDate = (days: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + days)
      return d
    })
  }

  const current = appointments.find(a => a.status === 'IN_CONSULTATION')
  const nextUp = appointments.find(a => a.status === 'CHECKED_IN')
  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const waiting = appointments.filter(a => ['CHECKED_IN', 'BOOKED'].includes(a.status)).length

  const handleAISummary = async () => {
    setLoadingAI(true)
    try {
      const { aiApi } = await import('@/lib/api')
      const summary = `Summarise this clinic session: ${completed} completed, ${waiting} patients waiting. Give a brief clinical insight.`
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
      if (isToday(selectedDate)) {
        await queueApi.next()
      }
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'IN_CONSULTATION' } : a
      ))
    } catch { /* optimistic update already done */ }
  }

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b border-brand-border pb-4 gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg hover:text-primary transition-colors shadow-sm shrink-0">
            <ChevronLeft className="w-5 h-5 text-text-secondary hover:text-primary" />
          </button>
          <div className="flex flex-col shrink-0">
            <h1 className="text-lg md:text-xl font-bold text-text-primary">Dr. Sharma's Schedule</h1>
            <p className="text-xs md:text-sm text-primary font-medium">{displayDate} {isToday(selectedDate) && <span className="ml-2 badge-success text-[10px]">TODAY</span>}</p>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg hover:text-primary transition-colors shadow-sm shrink-0">
            <ChevronRight className="w-5 h-5 text-text-secondary hover:text-primary" />
          </button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button onClick={load} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg shadow-sm" title="Refresh">
            <RefreshCw className={`w-5 h-5 text-text-secondary ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <div className="h-8 w-px bg-brand-border mx-2" />
          <span className="text-sm font-semibold text-text-secondary">{toggle ? 'Available' : 'On Break'}</span>
          <button onClick={() => setToggle(!toggle)} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${toggle ? 'bg-success' : 'bg-brand-border'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${toggle ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow hover:border-primary/30 group">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><UserPlus className="w-6 h-6 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-extrabold text-text-primary">{loading ? '…' : appointments.length}</p>
            <p className="text-sm font-medium text-text-secondary">Scheduled Patients</p>
            {stats?.avgConsultationTime && <p className="text-xs font-semibold text-success flex items-center gap-1 mt-1"><TrendingUp className="w-3.5 h-3.5" /> ~{stats.avgConsultationTime}m avg</p>}
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow hover:border-success/30 group">
          <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><CheckCircle2 className="w-6 h-6 text-success" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-extrabold text-success-text">{loading ? '…' : completed}</p>
            <p className="text-sm font-medium text-text-secondary">Completed</p>
            {appointments.length > 0 && <p className="text-xs text-success font-semibold mt-1">{Math.round(completed / appointments.length * 100)}% completion</p>}
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow hover:border-warning/30 group">
          <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Clock className="w-6 h-6 text-warning" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-extrabold text-warning-text">{loading ? '…' : waiting}</p>
            <p className="text-sm font-medium text-text-secondary">Remaining</p>
            <p className="text-xs font-semibold text-text-muted mt-1">{queueData?.estimatedWaitMinutes ?? '~'} min avg wait</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Active Patients */}
        <div className="lg:col-span-2 space-y-6">
          {/* Now Consulting */}
          <div className="card p-6 border-2 border-primary/30 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-primary-light/10">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <div className="flex items-center justify-between mb-5">
              <span className="badge-info px-4 py-1.5 text-xs uppercase tracking-wider font-extrabold flex items-center shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" /> Now Consulting
              </span>
              <span className="text-base font-bold text-primary bg-primary-light px-3 py-1 rounded-lg">{current?.timeSlot ?? '—'}</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-text-muted justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /> <span className="font-medium">Loading session...</span></div>
            ) : current ? (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5 mb-6 bg-white p-4 rounded-xl shadow-sm border border-brand-border">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-accent-light to-primary-light flex items-center justify-center text-2xl font-extrabold text-accent shadow-inner">
                    {initials(current.patient?.name ?? '')}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-text-primary">{current.patient?.name} <span className="text-sm font-semibold text-text-muted ml-2 bg-brand-bg px-2 py-0.5 rounded-full">{current.patient?.age ?? '?'}{current.patient?.gender ?? ''}</span></h2>
                    <div className="flex items-start md:items-center gap-2 mt-2 text-sm text-text-secondary bg-warning-light/30 p-2 rounded-lg border border-warning/10 inline-flex">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5 md:mt-0" /> 
                      <span><strong className="text-text-primary">Chief Complaint:</strong> {current.symptoms ?? 'General consultation'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-brand-border">
                  <Link href={`/doctor/consultation?id=${current.id}`} className="btn-primary py-3 flex justify-center items-center gap-2 hover:shadow-lg transition-all text-sm uppercase tracking-wide font-bold">
                    <FileText className="w-5 h-5 shrink-0" /> Open Consultation
                  </Link>
                  <Link href={`/doctor/patients?id=${current.patientId}`} className="btn-outline py-3 flex justify-center items-center gap-2 text-primary hover:bg-primary-light border-primary/30 text-sm uppercase tracking-wide font-bold transition-all">
                    <Calendar className="w-5 h-5 shrink-0" /> Patient History
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-text-muted text-sm py-10 text-center font-medium bg-white/50 rounded-xl border border-dashed border-brand-border">
                No patient currently in consultation.<br/>Select "Call In" from the queue below.
              </div>
            )}
          </div>

          {/* Next Up */}
          {nextUp && (
            <div className="card p-5 border-l-4 border-l-warning bg-gradient-to-r from-white to-warning-light/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-warning-text uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-4 h-4 shrink-0" /> Next Up
                </span>
                <span className="badge-warning shadow-sm">Waiting</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white border-2 border-warning/20 flex items-center justify-center font-bold text-warning-text shadow-sm">
                    {initials(nextUp.patient?.name ?? '')}
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-bold text-text-primary">{nextUp.patient?.name} <span className="text-xs font-semibold text-text-muted ml-2">{nextUp.patient?.age ?? '?'}{nextUp.patient?.gender ?? ''}</span></p>
                    <p className="text-xs md:text-sm font-medium text-text-secondary mt-0.5 line-clamp-1">{nextUp.timeSlot} · {nextUp.symptoms ?? 'General'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCallIn(nextUp.id)}
                  className="w-full sm:w-auto text-sm font-bold text-white bg-primary px-5 py-2.5 rounded-xl hover:bg-primary-hover hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <PhoneCall className="w-4 h-4" /> Call In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Daily Timeline */}
        <div className="card flex flex-col h-[calc(100vh-140px)] sticky top-6 shadow-md border-brand-border/60">
          <div className="p-5 border-b border-brand-border bg-gradient-to-b from-brand-bg to-white rounded-t-xl z-10 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-text-primary tracking-tight">Timeline</h3>
            <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">{appointments.length} apps</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-0 relative">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-text-muted"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : appointments.map((app, i) => {
              const isActive = app.status === 'IN_CONSULTATION';
              const isPast = app.status === 'COMPLETED';
              
              return (
                <div key={app.id ?? i} className="relative pl-8 pb-6 last:pb-0 group">
                  {i < appointments.length - 1 && (
                    <div className={`absolute top-4 left-[13px] w-0.5 h-full ${isPast ? 'bg-success/30' : 'bg-brand-border group-hover:bg-primary/20 transition-colors'}`} />
                  )}
                  <div className={`absolute top-1.5 left-0 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 shadow-sm ${statusColor[app.status] ?? 'bg-brand-border'}`}>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>
                  <div className={`p-4 rounded-xl border transition-all ${
                    isActive ? 'border-primary/50 bg-primary-light shadow-md scale-[1.02]'
                    : isUrgent(app) ? 'border-danger/50 bg-danger-light shadow-sm'
                    : 'border-brand-border bg-white hover:border-primary/30 hover:shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-extrabold ${isActive ? 'text-primary' : isUrgent(app) ? 'text-danger' : 'text-text-primary'}`}>{app.timeSlot}</span>
                      <div className="flex items-center gap-1.5">
                        {isUrgent(app) && (
                          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-danger text-white flex items-center gap-1 animate-pulse">
                            🚨 Urgent
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isPast ? 'bg-success-light text-success-text' : isActive ? 'bg-primary text-white' : 'bg-brand-bg text-text-muted'}`}>
                          {app.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-text-primary">{app.patient?.name ?? '—'}</p>
                    <p className={`text-xs font-semibold mt-1 line-clamp-1 ${isUrgent(app) ? 'text-danger' : 'text-text-secondary'}`}>{app.symptoms ?? app.reason ?? 'General'}</p>
                  </div>
                </div>
              )
            })}
            
            {appointments.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-text-muted text-center pt-10">
                <Calendar className="w-12 h-12 mb-3 text-brand-border" />
                <p className="text-sm font-medium">No appointments scheduled.</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-brand-border bg-gradient-to-t from-brand-bg to-white rounded-b-xl flex flex-col gap-3">
            {aiSummary && (
              <div className="p-3 bg-primary-light border border-primary/20 rounded-xl text-xs font-medium text-primary leading-relaxed shadow-sm">
                <Sparkles className="w-3.5 h-3.5 inline-block mb-0.5 mr-1" /> {aiSummary}
              </div>
            )}
            <button
              onClick={handleAISummary}
              disabled={loadingAI}
              className="flex items-center gap-2 text-sm font-bold text-accent hover:text-white p-3 rounded-xl bg-white hover:bg-accent border border-brand-border hover:border-accent w-full justify-center transition-all shadow-sm group"
            >
              {loadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:text-white" />}
              {loadingAI ? 'Generating…' : 'AI Daily Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
