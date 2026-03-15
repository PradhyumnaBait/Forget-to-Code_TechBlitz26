import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-brand-bg relative w-full">
      <DashboardSidebar role="doctor" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0 scroll-smooth">
        {children}
      </div>
    </div>
  )
}
