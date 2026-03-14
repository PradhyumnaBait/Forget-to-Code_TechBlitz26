import type { Metadata } from 'next'
import './globals.css'
import AppHeader from '@/components/layout/AppHeader'
import FloatingAI from '@/components/layout/FloatingAI'
import { AuthProvider } from '@/lib/authContext'
import { SettingsProvider } from '@/lib/settingsContext'

export const metadata: Metadata = {
  title: 'MedDesk — Smart Clinic Appointment System',
  description: 'Book doctor appointments online in under 2 minutes. Smart queue management, digital prescriptions, and seamless billing.',
  keywords: 'clinic appointment, doctor booking, medical appointment, online healthcare',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-bg min-h-screen font-sans">
        <AuthProvider>
          <SettingsProvider>
            <AppHeader />
            <main>{children}</main>
            <FloatingAI />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

