'use client'

import { useState } from 'react'
import { Search, CalendarDays, ChevronDown, FilterX, Phone, Clock, MoreHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'

type Status = 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show' | 'In Consultation'

const appointments = [
  { id: '#A001', name: 'Rahul Mehta', phone: '9876543210', time: '9:00 AM', date: 'Mar 13', type: 'General', status: 'Completed' as Status },
  { id: '#A002', name: 'Priya Singh', phone: '9988776655', time: '9:30 AM', date: 'Mar 13', type: 'Follow-up', status: 'In Consultation' as Status },
  { id: '#A003', name: 'Amit Kumar', phone: '9123456789', time: '10:00 AM', date: 'Mar 13', type: 'General', status: 'Confirmed' as Status },
  { id: '#A004', name: 'Sona Rajan', phone: '9009988776', time: '10:30 AM', date: 'Mar 13', type: 'Walk-in', status: 'Confirmed' as Status },
  { id: '#A005', name: 'Kavya Pillai', phone: '8765432198', time: '11:00 AM', date: 'Mar 13', type: 'Consultation', status: 'Confirmed' as Status },
  { id: '#A006', name: 'Nikhil Das', phone: '9922334455', time: '11:30 AM', date: 'Mar 13', type: 'General', status: 'No-show' as Status },
  { id: '#A007', name: 'Divya Menon', phone: '9811223344', time: '12:00 PM', date: 'Mar 13', type: 'Consultation', status: 'Cancelled' as Status },
  { id: '#A008', name: 'Arjun Sharma', phone: '9776655443', time: '2:00 PM', date: 'Mar 13', type: 'Follow-up', status: 'Confirmed' as Status },
  { id: '#A009', name: 'Meena Iyer', phone: '9012345678', time: '2:30 PM', date: 'Mar 13', type: 'General', status: 'Confirmed' as Status },
  { id: '#A010', name: 'Rohan Verma', phone: '9654321876', time: '3:00 PM', date: 'Mar 13', type: 'General', status: 'Confirmed' as Status },
]

const statusStyle: Record<Status, string> = {
  Confirmed: 'badge-info',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
  'No-show': 'bg-gray-100 text-gray-500 rounded-full px-2.5 py-1 text-xs font-medium',
  'In Consultation': 'bg-blue-100 text-primary rounded-full px-2.5 py-1 text-xs font-medium',
}

const filters: Status[] = ['Confirmed', 'Completed', 'Cancelled', 'No-show', 'In Consultation']

export default function AppointmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')

  const filtered = appointments.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-0.5">Today · Friday, March 13, 2026</p>
        </div>
        <Link href="/book/patient-details" className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
          <Plus className="w-4 h-4" /> New Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9 h-9 text-sm"
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
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(statusFilter === f ? 'All' : f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${statusFilter === f ? 'bg-primary text-white border-primary' : 'bg-white border-brand-border text-text-secondary hover:bg-brand-bg'}`}
            >
              {f}
            </button>
          ))}
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
                {['ID', 'Patient', 'Phone', 'Date & Time', 'Type', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-text-muted uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-text-muted">{a.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-text-primary">{a.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <a href={`tel:${a.phone}`} className="text-sm text-text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {a.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {a.date}, {a.time}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-text-secondary">{a.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={statusStyle[a.status]}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted hover:text-text-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-text-muted">
                    No appointments match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-brand-border bg-white text-xs text-text-muted flex items-center justify-between">
          <span>Showing {filtered.length} of {appointments.length} appointments</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-brand-border rounded text-text-secondary hover:bg-brand-bg">← Prev</button>
            <button className="px-3 py-1 bg-primary text-white rounded">1</button>
            <button className="px-3 py-1 border border-brand-border rounded text-text-secondary hover:bg-brand-bg">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
