'use client'

import { TrendingUp, Users, UserPlus, Clock, Download } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts'

const weeklyPatients = [
  { day: 'Mon', patients: 14, revenue: 7000 },
  { day: 'Tue', patients: 18, revenue: 9000 },
  { day: 'Wed', patients: 12, revenue: 6000 },
  { day: 'Thu', patients: 20, revenue: 10000 },
  { day: 'Fri', patients: 22, revenue: 11000 },
  { day: 'Sat', patients: 26, revenue: 13000 },
]

const monthlyTrend = [
  { month: 'Oct', patients: 165, revenue: 82500 },
  { month: 'Nov', patients: 180, revenue: 90000 },
  { month: 'Dec', patients: 148, revenue: 74000 },
  { month: 'Jan', patients: 200, revenue: 100000 },
  { month: 'Feb', patients: 215, revenue: 107500 },
  { month: 'Mar', patients: 248, revenue: 113800 },
]

const visitData = [
  { name: 'General', online: 52, walkin: 18 },
  { name: 'Follow-up', online: 34, walkin: 8 },
  { name: 'Consultation', online: 20, walkin: 12 },
  { name: 'Routine', online: 15, walkin: 5 },
]

const visitTypes = [
  { name: 'General Consultation', value: 44 },
  { name: 'Follow-up', value: 28 },
  { name: 'Walk-in', value: 18 },
  { name: 'Emergency', value: 10 },
]
const PIE_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-border p-3 rounded-xl shadow-lg min-w-[120px]">
      <p className="text-xs font-bold text-text-primary border-b border-brand-border pb-1 mb-2">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="text-xs font-semibold" style={{ color: e.color }}>
          {e.name === 'revenue' ? `₹${(e.value / 1000).toFixed(1)}k` : e.value}{' '}
          <span className="text-text-muted capitalize font-normal">{e.name}</span>
        </p>
      ))}
    </div>
  )
}

export default function DoctorAnalyticsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">Dr. Ananya Sharma · Personal performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input h-9 text-sm w-36">
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last 6 Months</option>
          </select>
          <button className="flex items-center gap-2 btn-outline h-9 px-4 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Patients This Week', v: '112', sub: '+8 vs last week', icon: Users, col: 'text-primary', bg: 'bg-primary-light' },
          { label: 'Consultations Done', v: '98', sub: '87.5% completion rate', icon: TrendingUp, col: 'text-success', bg: 'bg-success-light' },
          { label: 'Walk-ins Handled', v: '24', sub: '21% of total', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light' },
          { label: 'Avg Consult Duration', v: '14 min', sub: 'Down 2 min this week', icon: Clock, col: 'text-accent', bg: 'bg-accent-light' },
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
        {/* Weekly Patients Area Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">Weekly Patient Load</h2>
            <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">Avg 19/day</span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPatients} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="patients" name="patients" stroke="#3B82F6" strokeWidth={3} fill="url(#gradPat)" dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Type + Online breakdown bar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">Visit Type Breakdown</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary" /> Online</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent" /> Walk-in</span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="online" name="online" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={24} />
                <Bar dataKey="walkin" name="walkin" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 6-Month Trend Line */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">6-Month Growth</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Patients</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Revenue (₹k)</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={30} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={44} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeDasharray: '4 4' }} />
                <Line yAxisId="left" type="monotone" dataKey="patients" name="patients" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Type Donut */}
        <div className="card p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">Visit Types</h2>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visitTypes} cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={3} dataKey="value" labelLine={false}>
                  {visitTypes.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {visitTypes.map((e, i) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
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
