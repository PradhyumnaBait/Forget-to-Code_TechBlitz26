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
    <aside className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-border md:relative md:border-t-0 md:border-r md:w-60 flex flex-row md:flex-col shrink-0 h-16 md:h-[calc(100vh-64px)] z-50">
      {/* Brand - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2.5 px-4 py-4 border-b border-brand-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">MedDesk</p>
          <p className="text-xs text-text-muted capitalize">{role} panel</p>
        </div>
      </div>

      {/* User badge - hidden on mobile */}
      <div className="hidden md:block px-4 py-3 border-b border-brand-border">
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
      <nav className="flex-1 flex flex-row md:flex-col px-2 md:px-3 py-2 md:py-4 gap-1 md:gap-0.5 overflow-x-auto md:overflow-y-auto no-scrollbar items-center md:items-stretch">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
          const baseClass = "flex items-center rounded-lg transition-colors duration-200"
          const mobileClass = "flex-col justify-center text-[10px] min-w-[72px] h-12"
          const desktopClass = "md:flex-row md:justify-start md:text-sm md:py-2 md:px-3 md:min-w-0 md:h-auto md:w-full"
          
          return (
            <Link 
              key={href} 
              href={href} 
              className={`${baseClass} ${mobileClass} ${desktopClass} ${
                active 
                  ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                  : 'text-text-secondary hover:bg-brand-bg hover:text-text-primary'
              }`}
            >
              <Icon className={`shrink-0 ${active ? 'text-primary' : 'text-text-muted'} w-5 h-5 mb-1 md:mb-0 md:w-4 md:h-4 md:mr-3`} />
              <span className="truncate w-full text-center md:text-left">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom (Settings & Logout) */}
      <div className="flex flex-row md:flex-col px-2 md:px-3 py-2 md:py-4 border-l md:border-l-0 md:border-t border-brand-border gap-1 md:gap-0.5 items-center md:items-stretch overflow-x-auto no-scrollbar">
        <Link 
          href="/settings" 
          className="flex flex-col md:flex-row items-center justify-center md:justify-start text-[10px] md:text-sm min-w-[72px] md:min-w-0 h-12 md:h-auto md:py-2 md:px-3 rounded-lg text-text-secondary hover:bg-brand-bg hover:text-text-primary transition-colors"
        >
          <Settings className="w-5 h-5 md:w-4 md:h-4 shrink-0 mb-1 md:mb-0 md:mr-3 text-text-muted" /> 
          <span>Settings</span>
        </Link>
        <Link 
          href="/" 
          className="flex flex-col md:flex-row items-center justify-center md:justify-start text-[10px] md:text-sm min-w-[72px] md:min-w-0 h-12 md:h-auto md:py-2 md:px-3 rounded-lg text-danger hover:bg-danger-light transition-colors"
        >
          <LogOut className="w-5 h-5 md:w-4 md:h-4 shrink-0 mb-1 md:mb-0 md:mr-3" /> 
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
