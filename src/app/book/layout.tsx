export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
