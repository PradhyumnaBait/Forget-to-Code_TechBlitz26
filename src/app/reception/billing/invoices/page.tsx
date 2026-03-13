import Link from 'next/link'

const mockInvoices = [
  { id: '#MED-0318-006', patient: 'Priya Singh', amount: '₹1,240', date: 'Mar 13, 2026', mode: 'UPI / Card' },
  { id: '#MED-0318-005', patient: 'Sona Rajan', amount: '₹500', date: 'Mar 13, 2026', mode: 'Cash' },
  { id: '#MED-0318-004', patient: 'Rahul Mehta', amount: '₹685', date: 'Mar 13, 2026', mode: 'UPI / Card' },
]

export default function InvoiceListPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">All Invoices</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Recently generated bills for today&apos;s visits.
          </p>
        </div>
        <Link
          href="/reception/billing"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
        >
          ← Back to billing
        </Link>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-text-muted border-b border-brand-border">
              <th className="py-2.5 text-left font-medium">Invoice ID</th>
              <th className="py-2.5 text-left font-medium">Patient</th>
              <th className="py-2.5 text-left font-medium">Date</th>
              <th className="py-2.5 text-left font-medium">Amount</th>
              <th className="py-2.5 text-left font-medium">Mode</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map(inv => (
              <tr
                key={inv.id}
                className="border-b border-brand-border/80 last:border-0 hover:bg-brand-bg/60 transition-colors"
              >
                <td className="py-2.5 font-medium text-text-primary">{inv.id}</td>
                <td className="py-2.5 text-text-secondary">{inv.patient}</td>
                <td className="py-2.5 text-text-secondary">{inv.date}</td>
                <td className="py-2.5 font-semibold text-text-primary">{inv.amount}</td>
                <td className="py-2.5 text-xs text-text-muted">{inv.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

