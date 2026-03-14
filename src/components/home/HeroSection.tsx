import Link from 'next/link'
import { Calendar, Shield, Clock, ArrowRight, CheckCircle, TestTube } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Demo Mode Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <TestTube className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">🚀 Demo Mode - Test All Features</h3>
              <p className="text-xs text-amber-700 mt-1">
                This is a fully functional demo. OTPs and login credentials are displayed for easy testing. 
                <Link href="/login" className="font-medium underline ml-1">Staff Login</Link> | 
                <span className="font-medium ml-1">Patient OTP: Auto-generated</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-success-light text-success-text text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <CheckCircle className="w-3.5 h-3.5" />
              Trusted by 2,000+ patients
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight tracking-tight mb-5">
              Your Health,{' '}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Our Priority</span>
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
              Book your doctor appointment online in under 2 minutes. Smart queue management, digital prescriptions, and instant confirmations — no waiting, no hassle.
            </p>

            {/* Key trust points */}
            <ul className="space-y-2 mb-8">
              {[
                'Instant slot booking with real-time availability',
                'OTP-verified, secure patient records',
                'WhatsApp & email confirmation',
              ].map(point => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/book/patient-details"
                className="inline-flex items-center gap-2 btn-primary"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#clinic-info"
                className="inline-flex items-center gap-2 btn-outline"
              >
                <Clock className="w-4 h-4" />
                View Clinic Hours
              </Link>
            </div>
          </div>

          {/* Right — Illustration card */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Doctor card */}
            <div className="card p-6 flex items-center gap-4 shadow-xl border-gray-200 hover:-translate-y-[2px] transition-all duration-200 ease-out">
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
                  <circle cx="32" cy="20" r="12" fill="#3B82F6" opacity="0.15" />
                  <circle cx="32" cy="20" r="8" fill="#3B82F6" opacity="0.3" />
                  <circle cx="32" cy="20" r="4" fill="#3B82F6" />
                  <path d="M12 52c0-11 9-20 20-20s20 9 20 20" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M28 38v6M36 38v6M28 44h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Dr. Ananya Sharma</p>
                <p className="text-sm text-text-secondary">General Practitioner · 12 yrs exp</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-text-muted ml-1">4.9 (328 reviews)</span>
                </div>
              </div>
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Appointments Today', value: '24', color: 'text-primary', bg: 'bg-primary-light' },
                { label: 'Slots Available', value: '12', color: 'text-success', bg: 'bg-success-light' },
                { label: 'Avg Wait Time', value: '8 min', color: 'text-warning', bg: 'bg-warning-light' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="card-hover p-4 text-center">
                  <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
                  <div className="text-xs text-text-muted leading-tight">{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
