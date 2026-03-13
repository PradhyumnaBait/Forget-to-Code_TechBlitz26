'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FilterX, Phone, Clock, MoreHorizontal, Plus, Loader2, RefreshCw, CheckCircle2, XCircle, UserX, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { appointmentApi, queueApi } from '@/lib/api'

type Status = 'BOOKED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'

const statusLabel: Record<string, string> = {
  BOOKED: 'Confirmed',
  CHECKED_IN: 'Waiting',
  IN_CONSULTATION: 'In Consultation',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
  CANCELLED: 'Cancelled',
}

const statusStyle: Record<string, string> = {
  BOOKED: 'badge-info',
  CHECKED_IN: 'badge-warning',
  IN_CONSULTATION: 'bg-blue-100 text-primary rounded-full px-2.5 py-1 text-xs font-medium',
  COMPLETED: 'badge-success',
  NO_SHOW: 'bg-gray-100 text-gray-500 rounded-full px-2.5 py-1 text-xs font-medium',
  CANCELLED: 'badge-danger',
}

const ALL_STATUSES: Status[] = ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED']

export default function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Default to today's date
  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState(todayStr)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await appointmentApi.list({
        date: dateFilter,
        ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
      })
      setAppointments((res.data as any)?.appointments ?? [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [dateFilter, statusFilter])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = appointments.filter(a => {
    const name = a.patient?.name ?? ''
    return name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
  })

  const handleCheckIn = async (id: string) => {
    setActionLoading(id)
    try {
      await queueApi.checkIn(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CHECKED_IN' } : a))
    } catch (e: any) {
      alert(e.message ?? 'Check-in failed')
    } finally {
      setActionLoading(null)
      setOpenMenu(null)
    }
  }

  const handleComplete = async (id: string) => {
    setActionLoading(id)
    try {
      await queueApi.complete(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a))
    } catch (e: any) {
      alert(e.message ?? 'Complete failed')
    } finally {
      setActionLoading(null)
      setOpenMenu(null)
    }
  }

  const handleNoShow = async (id: string) => {
    setActionLoading(id)
    try {
      await queueApi.markNoShow(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'NO_SHOW' } : a))
    } catch (e: any) {
      alert(e.message ?? 'Mark no-show failed')
    } finally {
      setActionLoading(null)
      setOpenMenu(null)
    }
  }

  const displayDate = new Date(dateFilter + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="p-6" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-0.5">{displayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/reception/walk-in" className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <Plus className="w-4 h-4" /> New Appointment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Date picker */}
        <div className="flex items-center gap-2 border border-brand-border rounded-lg px-3 py-1.5 bg-white">
          <CalendarDays className="w-4 h-4 text-text-muted" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="text-sm text-text-primary outline-none bg-transparent"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9 h-9 text-sm w-full"
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${statusFilter === 'All' ? 'bg-primary text-white border-primary' : 'bg-white border-brand-border text-text-secondary hover:bg-brand-bg'}`}
          >
            All ({appointments.length})
          </button>
          {ALL_STATUSES.map(f => {
            const count = appointments.filter(a => a.status === f).length
            if (count === 0 && statusFilter !== f) return null
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(statusFilter === f ? 'All' : f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${statusFilter === f ? 'bg-primary text-white border-primary' : 'bg-white border-brand-border text-text-secondary hover:bg-brand-bg'}`}
              >
                {statusLabel[f]} ({count})
              </button>
            )
          })}
          {statusFilter !== 'All' && (
            <button onClick={() => setStatusFilter('All')} className="px-3 py-1.5 rounded-lg text-xs text-danger font-semibold border border-danger/30 bg-danger-light flex items-center gap-1">
              <FilterX className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-brand-bg border-b border-brand-border">
              <tr>
                {['Patient', 'Phone', 'Date & Time', 'Reason', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-text-muted uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading appointments…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                    {search || statusFilter !== 'All'
                      ? 'No appointments match your filter.'
                      : `No appointments found for ${displayDate}.`}
                  </td>
                </tr>
              ) : filtered.map((a: any) => {
                const apptDate = new Date(a.date)
                const dateDisplay = apptDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                return (
                  <tr key={a.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-text-primary">{a.patient?.name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{a.patient?.gender ?? ''} {a.patient?.age ? `• ${a.patient.age}y` : ''}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <a href={`tel:${a.patient?.phone}`} className="text-sm text-text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {a.patient?.phone ?? '—'}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        {dateDisplay}, {a.timeSlot}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-text-secondary">{a.reason ?? 'General'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={statusStyle[a.status] ?? 'badge-info'}>{statusLabel[a.status] ?? a.status}</span>
                    </td>
                    <td className="px-5 py-3.5 relative">
                      {actionLoading === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                      ) : (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === a.id ? null : a.id) }}
                            className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted hover:text-text-secondary transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenu === a.id && (
                            <div
                              className="absolute right-0 top-8 z-20 bg-white border border-brand-border rounded-xl shadow-lg py-1 w-48"
                              onClick={e => e.stopPropagation()}
                            >
                              {a.status === 'BOOKED' && (
                                <button
                                  onClick={() => handleCheckIn(a.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-bg flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-success" /> Check In
                                </button>
                              )}
                              {(a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION') && (
                                <button
                                  onClick={() => handleComplete(a.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-bg flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-success" /> Mark Completed
                                </button>
                              )}
                              {(a.status === 'BOOKED' || a.status === 'CHECKED_IN') && (
                                <button
                                  onClick={() => handleNoShow(a.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-light flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" /> Mark No-Show
                                </button>
                              )}
                              {(a.status === 'BOOKED' || a.status === 'CHECKED_IN') && (
                                <Link
                                  href={`/book/patient-details?reschedule=${a.id}`}
                                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-bg flex items-center gap-2"
                                >
                                  <CalendarDays className="w-4 h-4 text-primary" /> Reschedule
                                </Link>
                              )}
                              {a.status === 'COMPLETED' && (
                                <span className="px-4 py-2 text-xs text-text-muted block">No actions available</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-brand-border bg-white text-xs text-text-muted flex items-center justify-between">
          <span>Showing {filtered.length} of {appointments.length} appointments</span>
          <span className="text-xs text-success font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Live · refreshes every 30s
          </span>
        </div>
      </div>
    </div>
  )
}
