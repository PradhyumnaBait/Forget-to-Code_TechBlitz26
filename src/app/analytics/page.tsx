'use client'

import { TrendingUp, Users, UserPlus, IndianRupee, Activity, Download } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts'

const revenueData = [
  { name: 'Mon', revenue: 14000 },
  { name: 'Tue', revenue: 18500 },
  { name: 'Wed', revenue: 15200 },
  { name: 'Thu', revenue: 21000 },
  { name: 'Fri', revenue: 19800 },
  { name: 'Sat', revenue: 25400 },
  { name: 'Sun', revenue: 0 },
]

const patientData = [
  { name: 'Mon', online: 15, walkin: 8 },
  { name: 'Tue', online: 20, walkin: 12 },
  { name: 'Wed', online: 18, walkin: 5 },
  { name: 'Thu', online: 22, walkin: 15 },
  { name: 'Fri', online: 24, walkin: 10 },
  { name: 'Sat', online: 28, walkin: 18 },
  { name: 'Sun', online: 0, walkin: 0 },
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
            <AreaChart data={revenueData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={46} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip content={<TT />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#gradR)" dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
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
            <BarChart data={patientData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={28} />
              <Tooltip content={<TT />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="online" name="online" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={26} />
              <Bar dataKey="walkin" name="walkin" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} />
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
