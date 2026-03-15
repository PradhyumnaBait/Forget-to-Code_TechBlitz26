'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Bell, Users, CalendarClock, Clock, UserPlus, Search, CalendarX, Send, Loader2, RefreshCw, CalendarDays, FilterX } from 'lucide-react'
import { appointmentApi, queueApi, analyticsApi } from '@/lib/api'

type AppStatus = 'COMPLETED' | 'IN_CONSULTATION' | 'CHECKED_IN' | 'BOOKED' | 'NO_SHOW' | 'CANCELLED'

const statusConfig: Record<string, { label: string; cls: string }> = {
  COMPLETED:       { label: 'Completed',       cls: 'badge-success' },
  IN_CONSULTATION: { label: 'In Consultation', cls: 'badge-info' },
  CHECKED_IN:      { label: 'Waiting',         cls: 'badge-warning' },
  BOOKED:          { label: 'Booked',          cls: 'badge-warning' },
  NO_SHOW:         { label: 'No-show',         cls: 'badge-danger' },
  CANCELLED:       { label: 'Cancelled',       cls: 'badge-danger' },
}

const quickActions = [
  { icon: UserPlus, label: 'Register Walk-In', href: '/reception/walk-in', color: 'bg-primary-light text-primary hover:bg-primary hover:text-white' },
  { icon: Search,   label: 'Search Patient',   href: '/reception/patients', color: 'bg-accent-light text-accent hover:bg-accent hover:text-white' },
  { icon: CalendarX, label: 'Appointments',    href: '/reception/appointments', color: 'bg-warning-light text-warning-text hover:bg-warning hover:text-white' },
  { icon: Send,     label: 'Billing',           href: '/reception/billing', color: 'bg-success-light text-success-text hover:bg-success hover:text-white' },
]

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [queueData, setQueueData]       = useState<any>(null)
  const [stats, setStats]               = useState<any>(null)
  const [loading, setLoading]           = useState(true)

  // Filter state — default to today
  const todayStr = new Date().toLocaleDateString('en-CA')
  const [dateFilter, setDateFilter] = useState(todayStr)
  const [search, setSearch]         = useState('')

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aptsRes, queueRes, statsRes] = await Promise.allSettled([
        dateFilter === todayStr
          ? appointmentApi.today()
          : appointmentApi.list({ date: dateFilter }),
        queueApi.status(),
        analyticsApi.today(),
      ])
      if (aptsRes.status === 'fulfilled' && aptsRes.value.success) {
        // today() wraps in { appointments }, list() also wraps in { appointments }
        const d = (aptsRes.value.data as any)
        setAppointments(d?.appointments ?? [])
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s so new appointments appear without manual reload
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  // Client-side search filter
  const filtered = appointments.filter(a => {
    if (!search) return true
    const name = (a.patient?.name ?? '').toLowerCase()
    const id   = (a.id ?? '').toLowerCase()
    const phone = (a.patient?.phone ?? '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || id.includes(q) || phone.includes(q)
  })

  const totalToday        = appointments.length
  const queueSize         = (queueData as any)?.queueLength ?? (queueData as any)?.totalInQueue ?? 0
  const consultingPatient = (queueData as any)?.current?.patient?.name ?? 'None'
  const estimatedWait     = (queueData as any)?.estimatedWaitMinutes ?? (queueSize * 15)

  const displayDate = new Date(dateFilter + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Good morning, Reception 👋</h1>
          <p className="text-sm text-text-secondary mt-0.5">{today} · Reception Dashboard</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button onClick={load} className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="relative p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, sub, subCls, icon: Icon, iconCls }) => (
          <div key={label} className="card p-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
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
          {/* Filter bar — date picker + search (same layout as Appointments page) */}
          <div className="flex flex-wrap gap-3 px-5 py-4 border-b border-brand-border items-center">
            {/* Date picker */}
            <div className="flex items-center gap-2 border border-brand-border rounded-lg px-3 py-1.5 bg-white shrink-0">
              <CalendarDays className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="text-sm text-text-primary outline-none bg-transparent w-full"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="input pl-9 h-9 text-sm w-full"
                placeholder="Search by name or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Clear search */}
            {search && (
              <button onClick={() => setSearch('')} className="flex items-center gap-1 text-xs text-danger font-semibold px-2.5 py-1.5 rounded-lg border border-danger/30 bg-danger-light">
                <FilterX className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <span className="ml-auto text-xs text-text-muted whitespace-nowrap">
              {filtered.length} of {totalToday} appointments
            </span>
          </div>

          {/* Schedule title */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-brand-bg/40 border-b border-brand-border">
            <h2 className="text-sm font-semibold text-text-primary">Schedule — {displayDate}</h2>
            <span className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Live · 30s
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              {search ? 'No appointments match your search.' : 'No appointments for this date.'}
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {filtered.slice(0, 12).map((apt: any) => {
                const cfg = statusConfig[apt.status] ?? { label: apt.status, cls: 'badge-warning' }
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-bg/60 transition-colors">
                    <div className="w-16 shrink-0">
                      <span className="text-sm font-medium text-text-secondary">{apt.timeSlot}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{apt.patient?.name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{apt.reason ?? 'General'}</p>
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
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-[1.02] ${color}`}>
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
