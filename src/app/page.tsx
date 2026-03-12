import Link from 'next/link'
import {
  Calendar, Users, FileText, MapPin, Phone, Clock,
  CheckCircle, Star, ArrowRight
} from 'lucide-react'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import ClinicInfoSection from '@/components/home/ClinicInfoSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ClinicInfoSection />

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">MedDesk</span>
          </div>
          <p className="text-xs text-text-muted">© 2026 MedDesk. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-text-muted">
            <Link href="#" className="hover:text-text-secondary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
