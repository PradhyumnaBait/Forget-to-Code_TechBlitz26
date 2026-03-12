'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Bell, TrendingUp, Users, CalendarClock, CheckCircle2, Clock, XCircle, AlertCircle, UserPlus, Search, CalendarX, Send } from 'lucide-react'

type AppStatus = 'Completed' | 'In Consultation' | 'Waiting' | 'No-show'

const appointments: { time: string; name: string; type: string; status: AppStatus }[] = [
  { time: '9:00 AM', name: 'Rahul Mehta', type: 'General', status: 'Completed' },
  { time: '9:30 AM', name: 'Priya Singh', type: 'Follow-up', status: 'In Consultation' },
  { time: '10:00 AM', name: 'Amit Kumar', type: 'General', status: 'Waiting' },
  { time: '10:30 AM', name: 'Sona Rajan', type: 'Walk-in', status: 'Waiting' },
  { time: '11:00 AM', name: 'Kavya Pillai', type: 'Consultation', status: 'Waiting' },
  { time: '11:30 AM', name: 'Nikhil Das', type: 'General', status: 'No-show' },
]

const statusConfig: Record<AppStatus, { label: string; cls: string }> = {
  'Completed': { label: 'Completed', cls: 'badge-success' },
  'In Consultation': { label: 'In Consultation', cls: 'badge-info' },
  'Waiting': { label: 'Waiting', cls: 'badge-warning' },
  'No-show': { label: 'No-show', cls: 'badge-danger' },
}

const quickActions = [
  { icon: UserPlus, label: 'Register Walk-In', href: '/reception/walk-in', color: 'bg-primary-light text-primary hover:bg-primary hover:text-white' },
  { icon: Search, label: 'Search Patient', href: '/reception/patients', color: 'bg-accent-light text-accent hover:bg-accent hover:text-white' },
  { icon: CalendarX, label: 'Appointments', href: '/reception/appointments', color: 'bg-warning-light text-warning-text hover:bg-warning hover:text-white' },
  { icon: Send, label: 'Billing', href: '/reception/billing', color: 'bg-success-light text-success-text hover:bg-success hover:text-white' },
]

export default function ReceptionDashboard() {
  const [reminderSent, setReminderSent] = useState(false)
  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Good Morning, Priya 👋</h1>
          <p className="text-sm text-text-secondary mt-0.5">Friday, March 13, 2026 · Reception Dashboard</p>
        </div>
        <button className="relative p-2 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today's Appointments",
            value: '24',
            sub: '↑ 8% vs yesterday',
            subCls: 'text-success',
            icon: CalendarClock,
            iconCls: 'bg-primary-light text-primary',
          },
          {
            label: 'Current Queue',
            value: '6',
            sub: '● Live',
            subCls: 'text-success font-medium',
            icon: Users,
            iconCls: 'bg-success-light text-success',
          },
          {
            label: 'Walk-ins Today',
            value: '4',
            sub: '2 registered this hour',
            subCls: 'text-text-muted',
            icon: UserPlus,
            iconCls: 'bg-accent-light text-accent',
          },
          {
            label: 'Available Slots',
            value: '12',
            sub: 'Remaining today',
            subCls: 'text-text-muted',
            icon: Clock,
            iconCls: 'bg-warning-light text-warning',
          },
        ].map(({ label, value, sub, subCls, icon: Icon, iconCls }) => (
          <div key={label} className="card p-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
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
            <span className="text-xs text-text-muted">{appointments.length} appointments</span>
          </div>
          <div className="divide-y divide-brand-border">
            {appointments.map(({ time, name, type, status }) => {
              const { label, cls } = statusConfig[status]
              return (
                <div key={time} className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-bg/60 transition-colors">
                  <div className="w-16 shrink-0">
                    <span className="text-sm font-medium text-text-secondary">{time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{name}</p>
                    <p className="text-xs text-text-muted">{type}</p>
                  </div>
                  <span className={cls}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions + Queue */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(({ icon: Icon, label, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-[1.02] ${color}`}
                >
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
              <div className="text-5xl font-extrabold text-primary mb-1">6</div>
              <p className="text-sm text-text-secondary">patients waiting</p>
              <p className="text-xs text-text-muted mt-1">~45 min estimated wait</p>
            </div>
            <div className="mt-3 pt-3 border-t border-brand-border">
              <p className="text-xs text-text-muted text-center">
                Now Consulting: <strong className="text-text-primary">Priya Singh</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
