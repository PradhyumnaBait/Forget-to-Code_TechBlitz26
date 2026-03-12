'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Stethoscope, LayoutDashboard, Calendar, Users,
  UserPlus, List, Receipt, BarChart2, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/reception', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/reception/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/reception/patients', icon: Users, label: 'Patients' },
  { href: '/reception/walk-in', icon: UserPlus, label: 'Walk-In' },
  { href: '/reception/waitlist', icon: List, label: 'Waitlist' },
  { href: '/reception/billing', icon: Receipt, label: 'Billing' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function DashboardSidebar({ role = 'reception' }: { role?: string }) {
  const pathname = usePathname()

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
          <div className="w-8 h-8 bg-accent-light rounded-full flex items-center justify-center text-sm font-bold text-accent">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Priya Nair</p>
            <p className="text-xs text-text-muted">Receptionist</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/reception' && pathname.startsWith(href))
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
        <button className="sidebar-item w-full">
          <Settings className="w-4 h-4" /> Settings
        </button>
        <Link href="/" className="sidebar-item w-full text-danger hover:text-danger hover:bg-danger-light">
          <LogOut className="w-4 h-4" /> Logout
        </Link>
      </div>
    </aside>
  )
}
