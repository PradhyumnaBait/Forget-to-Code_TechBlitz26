'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, UserPlus, IndianRupee, Activity, Download } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts'

// ─── Data Sets per Period ─────────────────────────────────────────────────────
const PERIOD_DATA = {
  '7d': {
    kpis: [
      { label: 'Total Revenue', v: '₹1.14L', sub: '+12% vs last week', icon: IndianRupee, col: 'text-success', bg: 'bg-success-light', trend: 'up' },
      { label: 'Total Patients', v: '248', sub: '+5% vs last week', icon: Users, col: 'text-primary', bg: 'bg-primary-light', trend: 'up' },
      { label: 'Walk-ins', v: '68', sub: '27% of total', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light', trend: 'neutral' },
      { label: 'Avg Readmission', v: '18%', sub: 'Returning patients', icon: Activity, col: 'text-accent', bg: 'bg-accent-light', trend: 'neutral' },
    ],
    revenueLabel: 'Daily Revenue (Last 7 Days)',
    revenueAvg: '₹16.3k/day',
    revenue: [
      { name: 'Mon', revenue: 14000 },
      { name: 'Tue', revenue: 18500 },
      { name: 'Wed', revenue: 15200 },
      { name: 'Thu', revenue: 21000 },
      { name: 'Fri', revenue: 19800 },
      { name: 'Sat', revenue: 25400 },
      { name: 'Sun', revenue: 0 },
    ],
    patientLabel: 'Patient Acquisition (Last 7 Days)',
    patients: [
      { name: 'Mon', online: 15, walkin: 8 },
      { name: 'Tue', online: 20, walkin: 12 },
      { name: 'Wed', online: 18, walkin: 5 },
      { name: 'Thu', online: 22, walkin: 15 },
      { name: 'Fri', online: 24, walkin: 10 },
      { name: 'Sat', online: 28, walkin: 18 },
      { name: 'Sun', online: 0, walkin: 0 },
    ],
    trendLabel: '7-Day Hourly Pattern',
    trend: [
      { month: 'Mon', patients: 23, revenue: 14000 },
      { month: 'Tue', patients: 32, revenue: 18500 },
      { month: 'Wed', patients: 23, revenue: 15200 },
      { month: 'Thu', patients: 37, revenue: 21000 },
      { month: 'Fri', patients: 34, revenue: 19800 },
      { month: 'Sat', patients: 46, revenue: 25400 },
      { month: 'Sun', patients: 0, revenue: 0 },
    ],
    visitTypes: [
      { name: 'General Consultation', value: 42 },
      { name: 'Follow-up', value: 28 },
      { name: 'Walk-in', value: 18 },
      { name: 'Emergency', value: 12 },
    ],
  },
  'month': {
    kpis: [
      { label: 'Total Revenue', v: '₹3.8L', sub: '+8% vs last month', icon: IndianRupee, col: 'text-success', bg: 'bg-success-light', trend: 'up' },
      { label: 'Total Patients', v: '892', sub: '+11% vs last month', icon: Users, col: 'text-primary', bg: 'bg-primary-light', trend: 'up' },
      { label: 'Walk-ins', v: '241', sub: '27% of total', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light', trend: 'up' },
      { label: 'Avg Readmission', v: '21%', sub: 'Up from 18%', icon: Activity, col: 'text-accent', bg: 'bg-accent-light', trend: 'up' },
    ],
    revenueLabel: 'Weekly Revenue (This Month)',
    revenueAvg: '₹95k/week',
    revenue: [
      { name: 'Week 1', revenue: 88000 },
      { name: 'Week 2', revenue: 97000 },
      { name: 'Week 3', revenue: 102000 },
      { name: 'Week 4', revenue: 93000 },
    ],
    patientLabel: 'Patient Acquisition (This Month)',
    patients: [
      { name: 'Week 1', online: 148, walkin: 68 },
      { name: 'Week 2', online: 163, walkin: 72 },
      { name: 'Week 3', online: 179, walkin: 81 },
      { name: 'Week 4', online: 156, walkin: 62 },
    ],
    trendLabel: 'Monthly Weekly Breakdown',
    trend: [
      { month: 'W1', patients: 216, revenue: 88000 },
      { month: 'W2', patients: 235, revenue: 97000 },
      { month: 'W3', patients: 260, revenue: 102000 },
      { month: 'W4', patients: 218, revenue: 93000 },
    ],
    visitTypes: [
      { name: 'General Consultation', value: 38 },
      { name: 'Follow-up', value: 33 },
      { name: 'Walk-in', value: 20 },
      { name: 'Emergency', value: 9 },
    ],
  },
  'lastmonth': {
    kpis: [
      { label: 'Total Revenue', v: '₹3.5L', sub: '−3% vs this month', icon: IndianRupee, col: 'text-success', bg: 'bg-success-light', trend: 'down' },
      { label: 'Total Patients', v: '804', sub: '−10% vs this month', icon: Users, col: 'text-primary', bg: 'bg-primary-light', trend: 'down' },
      { label: 'Walk-ins', v: '198', sub: '25% of total', icon: UserPlus, col: 'text-warning-text', bg: 'bg-warning-light', trend: 'down' },
      { label: 'Avg Readmission', v: '16%', sub: 'Down from 18%', icon: Activity, col: 'text-accent', bg: 'bg-accent-light', trend: 'down' },
    ],
    revenueLabel: 'Weekly Revenue (Last Month)',
    revenueAvg: '₹87.5k/week',
    revenue: [
      { name: 'Week 1', revenue: 82000 },
      { name: 'Week 2', revenue: 91000 },
      { name: 'Week 3', revenue: 88000 },
      { name: 'Week 4', revenue: 89000 },
    ],
    patientLabel: 'Patient Acquisition (Last Month)',
    patients: [
      { name: 'Week 1', online: 132, walkin: 58 },
      { name: 'Week 2', online: 148, walkin: 61 },
      { name: 'Week 3', online: 141, walkin: 55 },
      { name: 'Week 4', online: 138, walkin: 71 },
    ],
    trendLabel: 'Last Month Weekly Breakdown',
    trend: [
      { month: 'W1', patients: 190, revenue: 82000 },
      { month: 'W2', patients: 209, revenue: 91000 },
      { month: 'W3', patients: 196, revenue: 88000 },
      { month: 'W4', patients: 209, revenue: 89000 },
    ],
    visitTypes: [
      { name: 'General Consultation', value: 44 },
      { name: 'Follow-up', value: 25 },
      { name: 'Walk-in', value: 21 },
      { name: 'Emergency', value: 10 },
    ],
  },
}

type PeriodKey = keyof typeof PERIOD_DATA
const PIE_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B']

// ─── Tooltip ──────────────────────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<PeriodKey>('7d')
  const d = PERIOD_DATA[period]

  const periodLabel: Record<PeriodKey, string> = {
    '7d': 'Last 7 Days',
    'month': 'This Month',
    'lastmonth': 'Last Month',
  }

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const kpiRows = d.kpis.map(k =>
      `<tr style="border-top:1px solid #e2e8f0">
        <td style="padding:10px 16px;font-size:13px;color:#64748b">${k.label}</td>
        <td style="padding:10px 16px;font-size:16px;font-weight:800;color:#1e293b">${k.v}</td>
        <td style="padding:10px 16px;font-size:12px;color:${k.trend==='down'?'#ef4444':'#10b981'}">${k.sub}</td>
      </tr>`
    ).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analytics Report — MedDesk</title>
    <style>
      *{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;box-sizing:border-box}
      body{background:#f8fafc;padding:40px;color:#1e293b}
      .card{background:white;border-radius:16px;padding:28px 32px;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:24px;max-width:800px;margin:0 auto 24px}
      .header{background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:12px;padding:24px 28px;color:white;margin-bottom:28px;max-width:800px;margin:0 auto 24px}
      .header h1{font-size:22px;font-weight:800;margin-bottom:4px}
      table{width:100%;border-collapse:collapse}
      th{background:#f1f5f9;padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b}
      .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:24px;max-width:800px;margin:24px auto 0}
    </style></head><body>
      <div class="header">
        <h1>📊 Analytics Report — ${periodLabel[period]}</h1>
        <div style="opacity:.8;font-size:13px">Generated: ${new Date().toLocaleString('en-IN')} · MedDesk Clinic</div>
      </div>
      <div class="card">
        <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:16px">Key Performance Indicators</h2>
        <table>
          <thead><tr><th>Metric</th><th>Value</th><th>Change</th></tr></thead>
          <tbody>${kpiRows}</tbody>
        </table>
      </div>
      <div class="card">
        <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:16px">Revenue Breakdown</h2>
        <table>
          <thead><tr><th>Period</th><th>Revenue</th></tr></thead>
          <tbody>
            ${d.revenue.map(r => `<tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:13px">${r.name}</td><td style="padding:10px 16px;font-size:13px;font-weight:600">₹${r.revenue.toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:16px">Visit Type Distribution</h2>
        <table>
          <thead><tr><th>Visit Type</th><th>Percentage</th></tr></thead>
          <tbody>
            ${d.visitTypes.map(v => `<tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:13px">${v.name}</td><td style="padding:10px 16px;font-size:13px;font-weight:600">${v.value}%</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="footer">MedDesk Clinic Analytics · Confidential · ${new Date().toLocaleDateString('en-IN')}</div>
    </body></html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">Dr. Ananya Sharma · Personal performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex rounded-xl border border-brand-border overflow-hidden text-sm">
            {(['7d', 'month', 'lastmonth'] as PeriodKey[]).map((p, i) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 font-medium transition-colors whitespace-nowrap ${
                  period === p ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-brand-bg'
                } ${i < 2 ? 'border-r border-brand-border' : ''}`}>
                {p === '7d' ? 'Last 7 Days' : p === 'month' ? 'This Month' : 'Last Month'}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-2 btn-outline h-9 px-4 text-sm hover:border-primary hover:text-primary transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {d.kpis.map(stat => (
          <div key={stat.label} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.col}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.trend === 'down'
                ? <TrendingDown className="w-4 h-4 text-danger" />
                : <TrendingUp className="w-4 h-4 text-success" />}
            </div>
            <p className="text-3xl font-black text-text-primary mb-1">{stat.v}</p>
            <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
            <p className={`text-xs font-medium mt-1 ${stat.trend === 'down' ? 'text-danger' : 'text-success'}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1 — Revenue + Patient charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">{d.revenueLabel}</h2>
            <span className="text-xs font-medium text-success bg-success-light px-2.5 py-1 rounded-full">Avg {d.revenueAvg}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={d.revenue} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={46} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TT />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#gradR)" dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Patient acquisition */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">{d.patientLabel}</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />Online</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent inline-block" />Walk-in</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={d.patients} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
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

      {/* Row 2 — Trend + Visit Types */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-text-primary">{d.trendLabel}</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Patients</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.trend} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={30} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={44} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TT />} cursor={{ stroke: '#E2E8F0', strokeDasharray: '4 4' }} />
              <Line yAxisId="left" type="monotone" dataKey="patients" name="patients" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">Visit Types</h2>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={d.visitTypes} cx="50%" cy="50%" innerRadius={44} outerRadius={76} paddingAngle={3} dataKey="value" labelLine={false}>
                {d.visitTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {d.visitTypes.map((e, i) => (
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
