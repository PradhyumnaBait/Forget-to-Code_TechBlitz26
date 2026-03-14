'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Stethoscope, LayoutDashboard, Calendar, Users,
  UserPlus, List, Receipt, BarChart2, Settings, LogOut,
  ClipboardList, Activity
} from 'lucide-react'

const receptionNav = [
  { href: '/reception', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/reception/appointments', icon: Calendar, label: 'Appointments', exact: false },
  { href: '/reception/patients', icon: Users, label: 'Patients', exact: false },
  { href: '/reception/walk-in', icon: UserPlus, label: 'Walk-In', exact: false },
  { href: '/reception/waitlist', icon: List, label: 'Waitlist', exact: false },
  { href: '/reception/billing', icon: Receipt, label: 'Billing', exact: false },
  { href: '/reception/analytics', icon: BarChart2, label: 'Analytics', exact: false },
]

const doctorNav = [
  { href: '/doctor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/doctor/patients', icon: Users, label: 'Patient Records', exact: false },
  { href: '/doctor/consultation', icon: ClipboardList, label: 'Consultation', exact: false },
  { href: '/doctor/analytics', icon: Activity, label: 'Analytics', exact: false },
]

const roleUsers: Record<string, { name: string; title: string; initials: string }> = {
  reception: { name: 'Priya Nair', title: 'Receptionist', initials: 'PN' },
  doctor: { name: 'Dr. Ananya Sharma', title: 'General Physician', initials: 'AS' },
  admin: { name: 'Admin User', title: 'Clinic Admin', initials: 'AU' },
}

export default function DashboardSidebar({ role = 'reception' }: { role?: string }) {
  const pathname = usePathname()
  const navItems = role === 'doctor' ? doctorNav : receptionNav
  const user = roleUsers[role] ?? roleUsers.reception

  return (
    <aside className="w-60 bg-white border-r border-brand-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-brand-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">MedDesk</p>
          <p className="text-xs text-text-muted capitalize">{role} panel</p>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent-light rounded-full flex items-center justify-center text-xs font-bold text-accent">
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-muted">{user.title}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
          return (
            <Link key={href} href={href} className={active ? 'sidebar-item-active' : 'sidebar-item'}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-brand-border space-y-0.5">
        <Link href="/settings" className="sidebar-item w-full">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <Link href="/" className="sidebar-item w-full text-danger hover:text-danger hover:bg-danger-light">
          <LogOut className="w-4 h-4" /> Logout
        </Link>
      </div>
    </aside>
  )
}
