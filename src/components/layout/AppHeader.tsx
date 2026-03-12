'use client'

import Link from 'next/link'
import { Stethoscope, Calendar, LogIn } from 'lucide-react'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-brand-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-primary-hover transition-colors">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-text-primary">MedDesk</span>
              <span className="block text-xs text-text-muted leading-none">Smart Clinic</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Services
            </Link>
            <Link href="#clinic-info" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/reception"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/book/patient-details"
              className="flex items-center gap-1.5 btn-primary text-sm py-2 px-4"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
