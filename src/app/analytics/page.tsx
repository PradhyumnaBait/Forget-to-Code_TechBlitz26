'use client'

import { TrendingUp, Users, UserPlus, IndianRupee, Activity, Download } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'

const weeklyRevenue = [
  { day: 'Mon', revenue: 12000 },
  { day: 'Tue', revenue: 15000 },
  { day: 'Wed', revenue: 10000 },
  { day: 'Thu', revenue: 18000 },
  { day: 'Fri', revenue: 20000 },
  { day: 'Sat', revenue: 16000 },
  { day: 'Sun', revenue: 14000 },
]

const patientAcquisition = [
  { type: 'Online', value: 72 },
  { type: 'Walk-in', value: 28 },
]

const monthlyTrend = [
  { month: 'Sep', patients: 180, revenue: 90000 },
  { month: 'Oct', patients: 210, revenue: 105000 },
  { month: 'Nov', patients: 195, revenue: 97500 },
  { month: 'Dec', patients: 160, revenue: 80000 },
  { month: 'Jan', patients: 230, revenue: 115000 },
  { month: 'Feb', patients: 248, revenue: 124000 },
  { month: 'Mar', patients: 248, revenue: 113800 },
]

const visitTypeData = [
  { name: 'General Consultation', value: 42 },
  { name: 'Follow-up', value: 28 },
  { name: 'Walk-in', value: 18 },
  { name: 'Emergency', value: 12 },
]

const PIE_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B']

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6, borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 600, color: e.color, margin: '2px 0' }}>
          {e.name === 'revenue' ? `₹${(e.value / 1000).toFixed(1)}k` : e.value}{' '}
          <span style={{ color: '#94A3B8', fontWeight: 400 }}>{e.name}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Analytics Overview</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track clinic performance and patient trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input h-9 text-sm bg-white w-36">
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="flex items-center gap-2 btn-outline h-9 px-4 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Revenue', v: '₹1.1L', sub: '+12% vs last week', icon: IndianRupee, col: 'text-success', bg: 'bg-success-light' },
          { label: 'Total Patients', v: '248', sub: '+5% vs last week', icon: Users, col: 'text-primary', bg: 'bg-primary-light' },
          { label: 'Walk-ins', v: '68', sub: '27% of total', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light' },
          { label: 'Avg Readmission', v: '18%', sub: 'Returning patients', icon: Activity, col: 'text-accent', bg: 'bg-accent-light' },
        ].map(stat => (
          <div key={stat.label} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.col}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-3xl font-black text-text-primary mb-1">{stat.v}</p>
            <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
            <p className="text-xs font-medium text-success mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Revenue */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">Weekly Revenue</h2>
            <span className="text-xs font-medium text-success bg-success-light px-2.5 py-1 rounded-full">Avg ₹16.2k/day</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyRevenue} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={46} tickFormatter={(v: number) => `₹${v / 1000}k`} />
              <Tooltip content={<TT />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Acquisition */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">Patient Acquisition</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />Online</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent inline-block" />Walk-in</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={patientAcquisition} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={28} />
              <Tooltip
                formatter={(v: number, n: string) => [`${v}%`, n]}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="value" radius={8} barSize={48}>
                {patientAcquisition.map((entry, i) => (
                  <Cell key={entry.type} fill={i === 0 ? '#3B82F6' : '#6366F1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 6-Month Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">6-Month Growth Trend</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Patients</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={30} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={44} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip content={<TT />} cursor={{ stroke: '#E2E8F0', strokeDasharray: '4 4' }} />
              <Line yAxisId="left" type="monotone" dataKey="patients" name="patients" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Visit Types Pie */}
        <div className="card p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">Visit Types</h2>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={visitTypeData} cx="50%" cy="50%" innerRadius={44} outerRadius={76} paddingAngle={3} dataKey="value" labelLine={false}>
                {visitTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {visitTypeData.map((e, i) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  {e.name}
                </div>
                <span className="text-xs font-bold text-text-primary">{e.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
