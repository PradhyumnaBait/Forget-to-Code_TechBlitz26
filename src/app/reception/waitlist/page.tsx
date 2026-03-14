'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Users, AlertTriangle, Sparkles, CheckCircle, Phone, UserX, Loader2, RefreshCw } from 'lucide-react'
import { queueApi } from '@/lib/api'

interface WaitingPatient {
  id: string
  status: string
  timeSlot: string
  reason?: string
  updatedAt: string
  patient: {
    name: string
    phone: string
    age?: number | null
  }
  priority?: 'urgent' | 'normal'
}

// Compute minutes since a patient joined the queue (updatedAt is used as join time)
function minutesSince(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 60) return `${diff}m`
  const h = Math.floor(diff / 60), m = diff % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function WaitlistPage() {
  const [waiting, setWaiting] = useState<WaitingPatient[]>([])
  const [current, setCurrent] = useState<WaitingPatient | null>(null)
  const [waitMin, setWaitMin] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await queueApi.list()
      setWaiting((res.data?.waiting ?? []) as WaitingPatient[])
      setCurrent((res.data?.current ?? null) as WaitingPatient | null)
      setWaitMin(res.data?.estimatedWaitMinutes ?? 0)
    } catch {
      // silent error — keep existing list
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  const handleCallIn = async (appt: WaitingPatient) => {
    setActionId(appt.id)
    try {
      await queueApi.next()
      await load()
    } catch {
      // next() promotes first waiting patient; just refresh
      await load()
    } finally {
      setActionId(null)
    }
  }

  const handleNoShow = async (appt: WaitingPatient) => {
    setActionId(appt.id)
    try {
      await queueApi.markNoShow(appt.id)
      setWaiting(prev => prev.filter(p => p.id !== appt.id))
    } catch (e: any) {
      alert(e.message ?? 'Failed to mark no-show')
    } finally {
      setActionId(null)
    }
  }

  const urgentCount = waiting.filter(p => p.priority === 'urgent').length
  const avgWait = waiting.length > 0 ? Math.round(waitMin / Math.max(1, waiting.length)) : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Waitlist</h1>
          <p className="text-sm text-text-secondary mt-0.5">Live queue for today's checked-in patients.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-success bg-success-light px-3 py-1.5 rounded-full border border-success/20">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            {waiting.length} waiting
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'In Queue', value: waiting.length.toString(), bg: 'bg-primary-light', col: 'text-primary' },
          { icon: Clock, label: 'Avg. Wait', value: `${avgWait || 15} min`, bg: 'bg-warning-light', col: 'text-warning-text' },
          { icon: AlertTriangle, label: 'Urgent', value: urgentCount.toString(), bg: 'bg-danger-light', col: 'text-danger' },
        ].map(({ icon: Icon, label, value, bg, col }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${col}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{loading ? '…' : value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Currently in consultation */}
      {current && (
        <div className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary-light/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">NOW</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">Now Consulting: {current.patient?.name}</p>
            <p className="text-xs text-text-muted">Slot {current.timeSlot} · {current.reason || 'General'}</p>
          </div>
          <span className="badge-info">In Consultation</span>
        </div>
      )}

      {/* Urgent banner */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-danger-light border border-danger/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
          <div>
            <p className="text-sm font-bold text-danger">Urgent patients require immediate attention</p>
            <p className="text-xs text-danger/70">Please call in urgent patients before normal-priority ones.</p>
          </div>
        </div>
      )}

      {/* Waitlist */}
      {loading && waiting.length === 0 ? (
        <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading queue…
        </div>
      ) : waiting.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="w-10 h-10 text-success" />
          <div>
            <p className="text-base font-semibold text-text-primary">Waitlist is clear! 🎉</p>
            <p className="text-sm text-text-muted">No patients are currently waiting in the queue.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {waiting.map((p, index) => {
            const isUrgent = p.priority === 'urgent'
            const isActing = actionId === p.id
            return (
              <div key={p.id} className={`card p-5 flex items-center gap-4 ${isUrgent ? 'border-l-4 border-l-danger' : 'border-l-4 border-l-brand-border'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  isUrgent ? 'bg-danger text-white' : 'bg-brand-bg border border-brand-border text-text-muted'
                }`}>
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-bold text-text-primary">{p.patient?.name}</span>
                    {p.patient?.age && <span className="text-xs text-text-muted">{p.patient.age}Y</span>}
                    {isUrgent && (
                      <span className="badge-danger text-[10px] px-2 py-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary truncate">{p.reason || 'General consultation'}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting {minutesSince(p.updatedAt)}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.patient?.phone}</span>
                    <span>Slot {p.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={isActing}
                    onClick={() => handleCallIn(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                      isUrgent ? 'bg-danger text-white hover:bg-red-600' : 'btn-primary'
                    }`}>
                    {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Call In'}
                  </button>
                  <button
                    disabled={isActing}
                    onClick={() => handleNoShow(p)}
                    title="Mark as No-Show"
                    className="p-2 rounded-xl border border-brand-border text-text-muted hover:bg-danger-light hover:text-danger hover:border-danger/30 transition-colors">
                    <UserX className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl border border-brand-border text-text-muted hover:bg-brand-bg transition-colors">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-xs text-text-muted mt-4 text-center flex items-center justify-center gap-1">
        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse inline-block" /> Live · refreshes every 30s
      </p>
    </div>
  )
}
