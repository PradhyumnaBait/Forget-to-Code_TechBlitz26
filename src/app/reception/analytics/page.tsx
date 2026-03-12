import { redirect } from 'next/navigation'

// Reception analytics lives inside /reception, use the shared analytics page content
export default function ReceptionAnalyticsPage() {
  // Reuse the shared analytics; future: can customize per role
  redirect('/analytics')
}
