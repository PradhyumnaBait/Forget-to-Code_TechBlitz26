'use client'

import Link from 'next/link'
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react'
import { useSettings } from '@/lib/settingsContext'

export default function ClinicInfoSection() {
  const { settings } = useSettings()

  // Generate hours from schedule settings
  const generateHours = () => {
    if (!settings.isLoaded) {
      return [
        { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM', open: true },
        { day: 'Saturday', time: 'Closed', open: false },
        { day: 'Sunday', time: 'Closed', open: false },
      ]
    }

    const { schedule } = settings
    const workingDaysStr = schedule.workingDays.length === 5 && 
      schedule.workingDays.includes('monday') && 
      schedule.workingDays.includes('friday') ? 'Monday – Friday' : 
      schedule.workingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    return [
      { 
        day: workingDaysStr, 
        time: `${formatTime(schedule.startTime)} – ${formatTime(schedule.endTime)}`, 
        open: true 
      },
      { day: 'Saturday', time: 'Closed', open: false },
      { day: 'Sunday', time: 'Closed', open: false },
    ]
  }

  const hours = generateHours()

  return (
    <section id="clinic-info" className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Info cards */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
                Visit Us
              </span>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                {settings.clinic.clinicName}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Providing compassionate, evidence-based care. Walk-in patients also welcome during available slots.
              </p>
            </div>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-brand-bg">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Address</p>
                  <p className="text-sm text-text-secondary">
                    {settings.clinic.address || '302, Heritage Health Tower, MG Road, Pune, Maharashtra – 411001'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-brand-bg">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Phone</p>
                  <a href={`tel:${settings.clinic.phone}`} className="text-sm text-primary hover:text-primary-hover font-medium">
                    {settings.clinic.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Hours card */}
          <div className="card p-6 shadow-md">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Clinic Hours</h3>
            </div>

            <div className="space-y-3">
              {hours.map(({ day, time, open }) => (
                <div
                  key={day}
                  className="flex items-center justify-between py-3 border-b border-brand-border last:border-0"
                >
                  <span className="text-sm font-medium text-text-primary">{day}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">{time}</span>
                    <span className={`w-2 h-2 rounded-full ${open ? 'bg-success' : 'bg-danger'}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-brand-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success-text">
                  Open Now — Slots available today
                </span>
              </div>
              <Link
                href="/book/patient-details"
                className="w-full flex items-center justify-center gap-2 btn-primary"
              >
                Book a Slot Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
