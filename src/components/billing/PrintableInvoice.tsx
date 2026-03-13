'use client'

interface Item {
  id: string
  name: string
  description?: string
  qty: number
  price: number
}

interface InvoiceProps {
  invoiceId?: string
  date?: string
  patientName?: string
  doctorName?: string
  items: Item[]
  discount?: number
  payMode?: string
}

export default function PrintableInvoice({
  invoiceId = '#MED-20260313-001',
  date = 'March 13, 2026',
  patientName = 'Rahul Mehta',
  doctorName = 'Dr. Ananya Sharma',
  items,
  discount = 0,
  payMode = 'UPI / Card',
}: InvoiceProps) {
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0)
  const total = subtotal - discount

  return (
    <div id="print-invoice" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#0F172A', maxWidth: 720, margin: '0 auto', padding: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid #E2E8F0' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: '#3B82F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>MedDesk</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Smart Clinic Management</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
            <div>Dr. Ananya Sharma's Clinic</div>
            <div>12, Rajaji Nagar, Bangalore - 560010</div>
            <div>📞 +91 80 2234 5678</div>
            <div>✉ clinic@meddesk.in</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#3B82F6', marginBottom: 12 }}>INVOICE</div>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.8 }}>
            <div><strong style={{ color: '#0F172A' }}>Invoice ID:</strong> {invoiceId}</div>
            <div><strong style={{ color: '#0F172A' }}>Date:</strong> {date}</div>
            <div><strong style={{ color: '#0F172A' }}>Payment:</strong> {payMode}</div>
          </div>
        </div>
      </div>

      {/* Patient + Doctor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 2 }}>{patientName}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>Patient · Registered Mobile: +91 98765 XXXXX</div>
        </div>
        <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Consulting Doctor</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 2 }}>{doctorName}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>General Physician · MCI Reg. #12345</div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#1E293B', color: '#fff' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: '8px 0 0 8px' }}>#</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</th>
            <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Qty</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Unit Price</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: '0 8px 8px 0' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#FAFBFC' : '#fff' }}>
              <td style={{ padding: '10px 14px', color: '#94A3B8', fontSize: 12 }}>{i + 1}</td>
              <td style={{ padding: '10px 14px', fontWeight: 500, color: '#0F172A', fontSize: 13 }}>
                {item.name}
                {item.description && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{item.description}</div>}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>{item.qty}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B', fontSize: 13 }}>₹{item.price.toLocaleString()}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#0F172A', fontSize: 13 }}>₹{(item.price * item.qty).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#64748B' }}>
            <span>Subtotal</span><span style={{ fontWeight: 500, color: '#0F172A' }}>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#64748B' }}>
            <span>Discount</span><span style={{ fontWeight: 500, color: '#EF4444' }}>– ₹{discount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#EFF6FF', borderRadius: 8, marginTop: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Grand Total</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#3B82F6' }}>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>Thank you for visiting MedDesk Clinic!</p>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>For queries or records, contact us at clinic@meddesk.in or +91 80 2234 5678</p>
        <p style={{ fontSize: 11, color: '#94A3B8' }}>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  )
}
