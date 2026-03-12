import { CalendarCheck, Users, FileText, Zap, ShieldCheck, Bell } from 'lucide-react'

const features = [
  {
    icon: CalendarCheck,
    title: 'Instant Booking',
    description: 'Real-time slot availability. Book a confirmed appointment in under 2 minutes from any device.',
    color: 'bg-primary-light text-primary',
  },
  {
    icon: Users,
    title: 'Smart Queue',
    description: 'Know your position in the queue. Get live updates so you arrive just in time — no long waiting.',
    color: 'bg-accent-light text-accent',
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    description: 'Receive your prescription digitally. Download PDF, share with pharmacy, or view visit history.',
    color: 'bg-success-light text-success',
  },
  {
    icon: Zap,
    title: 'OTP Verified',
    description: 'Secure, phone number-verified bookings. Your medical information stays private and protected.',
    color: 'bg-warning-light text-warning',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Private',
    description: 'Your health data is encrypted and never shared. Full HIPAA-aligned privacy practices.',
    color: 'bg-primary-light text-primary',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'WhatsApp & email reminders before your appointment so you never miss a visit.',
    color: 'bg-accent-light text-accent',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Why MedDesk
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Everything you need for a seamless clinic visit
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto text-base">
            Built for modern clinics. Designed for patients who value their time.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="card p-6 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
