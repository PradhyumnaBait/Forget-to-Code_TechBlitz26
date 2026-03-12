'use client'

import { TrendingUp, Users, UserPlus, IndianRupee, Activity, CalendarDays, Download } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-brand-border p-3 rounded-xl shadow-lg">
        <p className="text-sm font-bold text-text-primary mb-2 border-b border-brand-border pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium flex items-center justify-between gap-4" style={{ color: entry.color }}>
            <span className="capitalize">{entry.name}</span>
            <span>{entry.name === 'revenue' ? `₹${entry.value}` : entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
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
          <select className="input h-9 text-sm font-medium bg-white border-brand-border pr-8">
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="flex items-center gap-2 btn-outline h-9 px-4 text-sm font-medium">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Revenue', v: '₹1.1L', sub: '+12% vs last week', icon: IndianRupee, col: 'text-success', bg: 'bg-success-light' },
          { label: 'Total Patients', v: '248', sub: '+5% vs last week', icon: Users, col: 'text-primary', bg: 'bg-primary-light' },
          { label: 'Walk-ins', v: '68', sub: '-2% vs last week', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light' },
          { label: 'Avg Readmission', v: '18%', sub: '+1% vs last week', icon: Activity, col: 'text-accent', bg: 'bg-accent-light' },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h2 className="text-base font-bold text-text-primary mb-6 flex items-center justify-between">
            Revenue Trend
            <span className="text-xs font-medium text-success bg-success-light px-2 py-1 rounded">Avg ₹16.2k/day</span>
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} width={50} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Mix Chart */}
        <div className="card p-5">
          <h2 className="text-base font-bold text-text-primary mb-6 flex items-center justify-between">
            Patient Acquisition Mix
            <span className="text-xs font-medium text-primary bg-primary-light px-2 py-1 rounded">Online vs Walk-in</span>
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="online" name="Online Bookings" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="walkin" name="Walk-ins" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
