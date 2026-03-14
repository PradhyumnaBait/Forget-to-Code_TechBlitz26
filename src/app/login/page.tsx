import Link from 'next/link'
import { Stethoscope, UserCog, Settings, ChevronRight, HeartPulse } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          <HeartPulse className="w-3.5 h-3.5" /> Secure Staff Portal
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary">Welcome to MedDesk</h1>
        <p className="text-text-secondary mt-2 text-base">Select your role to continue to the dashboard.</p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-4xl">
        {/* Doctor */}
        <Link
          href="/login/doctor"
          className="group flex-1 bg-white border-2 border-brand-border rounded-2xl p-7 flex flex-col items-start gap-4 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
            <Stethoscope className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-200" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">Doctor Login</h2>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Access your dashboard, patient consultations, and prescriptions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Continue <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Receptionist */}
        <Link
          href="/login/reception"
          className="group flex-1 bg-white border-2 border-brand-border rounded-2xl p-7 flex flex-col items-start gap-4 hover:border-accent hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 bg-accent-light rounded-2xl flex items-center justify-center group-hover:bg-accent transition-colors duration-200">
            <UserCog className="w-7 h-7 text-accent group-hover:text-white transition-colors duration-200" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">Receptionist Login</h2>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Manage appointments, check-ins, billing, and the live patient queue.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Continue <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Admin */}
        <Link
          href="/login/admin"
          className="group flex-1 bg-white border-2 border-brand-border rounded-2xl p-7 flex flex-col items-start gap-4 hover:border-orange-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-200">
            <Settings className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-200" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary group-hover:text-orange-500 transition-colors">Admin Login</h2>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Configure system settings, manage users, and clinic preferences.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Continue <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <p className="text-xs text-text-muted mt-8">
        Not a staff member?{' '}
        <Link href="/book/patient-details" className="text-primary font-medium hover:underline">
          Book an appointment instead
        </Link>
      </p>
    </div>
  )
}
