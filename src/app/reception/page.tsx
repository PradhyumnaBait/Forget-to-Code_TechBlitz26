'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Bell, Users, CalendarClock, Clock, UserPlus, Search, CalendarX, Send, Loader2, RefreshCw } from 'lucide-react'
import { appointmentApi, queueApi, analyticsApi } from '@/lib/api'

type AppStatus = 'COMPLETED' | 'IN_CONSULTATION' | 'CHECKED_IN' | 'BOOKED' | 'NO_SHOW' | 'CANCELLED'

const statusConfig: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: 'Completed', cls: 'badge-success' },
  IN_CONSULTATION: { label: 'In Consultation', cls: 'badge-info' },
  CHECKED_IN: { label: 'Waiting', cls: 'badge-warning' },
  BOOKED: { label: 'Booked', cls: 'badge-warning' },
  NO_SHOW: { label: 'No-show', cls: 'badge-danger' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-danger' },
}

const quickActions = [
  { icon: UserPlus, label: 'Register Walk-In', href: '/reception/walk-in', color: 'bg-primary-light text-primary hover:bg-primary hover:text-white' },
  { icon: Search, label: 'Search Patient', href: '/reception/patients', color: 'bg-accent-light text-accent hover:bg-accent hover:text-white' },
  { icon: CalendarX, label: 'Appointments', href: '/reception/appointments', color: 'bg-warning-light text-warning-text hover:bg-warning hover:text-white' },
  { icon: Send, label: 'Billing', href: '/reception/billing', color: 'bg-success-light text-success-text hover:bg-success hover:text-white' },
]

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [queueData, setQueueData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aptsRes, queueRes, statsRes] = await Promise.allSettled([
        appointmentApi.today(),
        queueApi.status(),
        analyticsApi.today(),
      ])
      if (aptsRes.status === 'fulfilled' && aptsRes.value.success) {
        setAppointments((aptsRes.value.data as any).appointments ?? [])
      }
      if (queueRes.status === 'fulfilled' && queueRes.value.success) {
        setQueueData((queueRes.value as any).data)
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats((statsRes.value as any).data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s so new appointments appear without manual reload
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const totalToday = appointments.length
  const queueSize = queueData?.totalInQueue ?? 0
  const consultingPatient = queueData?.current?.patient?.name ?? 'None'
  const estimatedWait = queueData?.estimatedWaitMinutes ?? 0

  const kpis = [
    {
      label: "Today's Appointments", value: String(totalToday),
      sub: loading ? '…' : `${appointments.filter(a => a.status === 'COMPLETED').length} completed`,
      subCls: 'text-success', icon: CalendarClock, iconCls: 'bg-primary-light text-primary',
    },
    {
      label: 'Current Queue', value: String(queueSize),
      sub: '● Live', subCls: 'text-success font-medium',
      icon: Users, iconCls: 'bg-success-light text-success',
    },
    {
      label: 'Waiting', value: String(appointments.filter(a => a.status === 'CHECKED_IN').length),
      sub: `~${estimatedWait} min wait`, subCls: 'text-text-muted',
      icon: Clock, iconCls: 'bg-warning-light text-warning',
    },
    {
      label: "Today's Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      sub: `${stats?.totalPatients ?? 0} patients`, subCls: 'text-text-muted',
      icon: UserPlus, iconCls: 'bg-accent-light text-accent',
    },
  ]

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Good morning, Reception 👋</h1>
          <p className="text-sm text-text-secondary mt-0.5">{today} · Reception Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="relative p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, sub, subCls, icon: Icon, iconCls }) => (
          <div key={label} className="card-hover p-4 flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{loading ? <Loader2 className="w-5 h-5 animate-spin text-text-muted" /> : value}</p>
              <p className="text-xs text-text-secondary leading-tight">{label}</p>
              <p className={`text-xs mt-1 ${subCls}`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Schedule table */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <h2 className="text-sm font-semibold text-text-primary">Today's Schedule</h2>
            <span className="text-xs text-text-muted">{totalToday} appointments</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">No appointments today.</div>
          ) : (
            <div className="divide-y divide-brand-border">
              {appointments.slice(0, 10).map((apt: any) => {
                const cfg = statusConfig[apt.status] ?? { label: apt.status, cls: 'badge-warning' }
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-all duration-150">
                    <div className="w-16 shrink-0">
                      <span className="text-sm font-medium text-text-secondary">{apt.timeSlot}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{apt.patient?.name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{apt.type ?? 'General'}</p>
                    </div>
                    <span className={cfg.cls}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions + Queue */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(({ icon: Icon, label, href, color }) => (
                <Link key={label} href={href}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.03] hover:-translate-y-[1px] ${color}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Queue now */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary">Current Queue</h2>
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className="text-center py-3">
              <div className="text-5xl font-extrabold text-primary mb-1">{queueSize}</div>
              <p className="text-sm text-text-secondary">patients waiting</p>
              {estimatedWait > 0 && (
                <p className="text-xs text-text-muted mt-1">~{estimatedWait} min estimated wait</p>
              )}
            </div>
            {consultingPatient !== 'None' && (
              <div className="mt-3 pt-3 border-t border-brand-border">
                <p className="text-xs text-text-muted text-center">
                  Now Consulting: <strong className="text-text-primary">{consultingPatient}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
