import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <DashboardSidebar role="admin" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
