'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  FileText, IndianRupee, Plus, Printer, CheckCircle, Smartphone,
  Trash2, MessageSquare, Search, X, Loader2, Save, Percent, Clock, Users, RefreshCw
} from 'lucide-react'
import PrintableInvoice from '@/components/billing/PrintableInvoice'
import { patientApi, appointmentApi, bookingApi } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Item {
  id: string
  name: string
  description: string
  qty: number
  price: number
}

interface PatientInfo {
  id: string
  name: string
  phone: string
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────
function AddItemModal({ onAdd, onClose }: { onAdd: (item: Omit<Item,'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', qty: 1, price: 0 })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: k === 'qty' || k === 'price' ? Number(e.target.value) || 0 : e.target.value }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    onAdd(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <h2 className="text-base font-bold text-text-primary">Add Item / Medicine</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="label">Item / Medicine Name *</label>
            <input className="input" placeholder="e.g. Paracetamol 500mg (10 tabs)" value={form.name} onChange={set('name')} autoFocus />
          </div>
          <div>
            <label className="label">Description / Notes</label>
            <input className="input" placeholder="e.g. For fever, take 1 tab thrice daily — optional" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input type="number" min={1} className="input" value={form.qty} onChange={set('qty')} />
            </div>
            <div>
              <label className="label">Unit Price (₹)</label>
              <input type="number" min={0} className="input" value={form.price} onChange={set('price')} />
            </div>
          </div>
          <div className="flex items-center justify-between py-2.5 border-t border-brand-border mt-1">
            <span className="text-sm text-text-secondary">Line Total</span>
            <span className="text-base font-bold text-primary">₹{(form.qty * form.price).toLocaleString()}</span>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={!form.name.trim()}
              className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> Add to Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Patient Search ───────────────────────────────────────────────────────────
function PatientSearch({ onSelect }: { onSelect: (p: PatientInfo) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatientInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await patientApi.list(q) as any
      setResults((res.data?.patients ?? []).slice(0, 8))
    } catch {
      // fallback demo patients
      const demoPatients: PatientInfo[] = [
        { id: 'P001', name: 'Rahul Mehta', phone: '9876543210' },
        { id: 'P002', name: 'Priya Singh', phone: '9988776655' },
        { id: 'P003', name: 'Amit Kumar', phone: '9123456789' },
        { id: 'P004', name: 'Sona Rajan', phone: '9009988776' },
      ].filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
      setResults(demoPatients)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          className="input pl-9 h-9 text-sm w-64"
          placeholder="Search patient by name or phone…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-text-muted" />}
      </div>
      {open && (query.trim().length > 0) && (
        <div className="absolute top-full mt-1 left-0 w-full min-w-[280px] bg-white border border-brand-border rounded-xl shadow-lg z-30 overflow-hidden">
          {results.length === 0 && !loading && (
            <div className="px-4 py-3 text-xs text-text-muted">No patients found.</div>
          )}
          {results.map(p => (
            <button key={p.id} onClick={() => { onSelect(p); setQuery(p.name); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 hover:bg-brand-bg transition-colors border-b border-brand-border last:border-0">
              <div className="text-sm font-semibold text-text-primary">{p.name}</div>
              <div className="text-xs text-text-muted">{p.phone} · {p.id}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface PendingBillItem { appointmentId: string; patientName: string; patientPhone: string; patientId: string; timeSlot: string; consultation?: any; prescriptions?: any[] }

function PendingBillingQueue({ onSelect }: { onSelect: (item: PendingBillItem) => void }) {
  const [pending, setPending] = useState<PendingBillItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch today's COMPLETED appointments that do NOT yet have a billing record
      const res = await appointmentApi.list({ status: 'COMPLETED' })
      const apts = ((res.data as any)?.appointments ?? []) as any[]
      const items: PendingBillItem[] = apts
        .filter(a => !a.billing) // no billing yet
        .map(a => ({
          appointmentId: a.id,
          patientName: a.patient?.name ?? 'Unknown',
          patientPhone: a.patient?.phone ?? '',
          patientId: a.patient?.id ?? '',
          timeSlot: a.timeSlot,
          consultation: a.consultation,
          prescriptions: a.consultation?.prescriptions,
        }))
      setPending(items)
    } catch {
      setPending([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="card border border-brand-border bg-white flex flex-col" style={{ maxHeight: '80vh' }}>
      <div className="p-4 border-b border-brand-border bg-gradient-to-r from-brand-bg to-white flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-success" />
          Pending Billing
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pending.length > 0 ? 'bg-danger text-white' : 'bg-brand-bg text-text-muted'}`}>{pending.length}</span>
          <button onClick={load} className="p-1 rounded-lg hover:bg-brand-bg text-text-muted hover:text-primary">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6 text-center text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs font-medium">Loading completed appointments…</p>
        </div>
      ) : pending.length === 0 ? (
        <div className="p-6 text-center text-text-muted flex flex-col items-center gap-2">
          <CheckCircle className="w-8 h-8 text-success/30" />
          <p className="text-xs font-medium">All patients billed!</p>
          <p className="text-[10px] text-text-muted/60">Patients will appear here after consultation completes.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-brand-border">
          {pending.map((item) => (
            <button key={item.appointmentId} onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-3.5 hover:bg-primary-light hover:border-l-4 hover:border-l-primary transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-light text-success-text flex items-center justify-center text-xs font-bold shrink-0">
                    {item.patientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary">{item.patientName}</p>
                    <p className="text-xs text-text-muted mt-0.5">{item.patientPhone}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold bg-success-light text-success-text px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{item.timeSlot}
                  </span>
                </div>
              </div>
              {item.prescriptions && item.prescriptions.length > 0 && (
                <p className="text-[10px] text-text-muted mt-2 pl-11">
                  {item.prescriptions.length} prescription(s) to bill
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Billing Page ────────────────────────────────────────────────────────
const DEFAULT_ITEMS: Item[] = [
  { id: '1', name: 'Dr. Ananya Sharma — General Consultation', description: 'General OPD visit', qty: 1, price: 500 },
  { id: '2', name: 'Paracetamol 500mg (10 tabs)', description: 'For fever & pain relief', qty: 2, price: 40 },
  { id: '3', name: 'Cetirizine 10mg (10 tabs)', description: 'Antihistamine for allergy', qty: 1, price: 25 },
  { id: '4', name: 'Vitamin D3 60k (4 caps)', description: 'Vitamin D supplement', qty: 1, price: 120 },
]

const recentBills = [
  { id: '#MED-0318-006', patient: 'Priya Singh', amt: '₹1,240', time: '10:30 AM' },
  { id: '#MED-0318-005', patient: 'Sona Rajan', amt: '₹500', time: '10:00 AM' },
  { id: '#MED-0318-004', patient: 'Rahul Mehta', amt: '₹685', time: '9:30 AM' },
]

export default function BillingPage() {
  const [defaultConsultationFee, setDefaultConsultationFee] = useState(500)
  const defaultItems = useMemo(
    () => [
      { id: '1', name: 'Dr. Ananya Sharma — General Consultation', description: 'General OPD visit', qty: 1, price: defaultConsultationFee },
      ...DEFAULT_ITEMS.slice(1),
    ],
    [defaultConsultationFee]
  )
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS)
  const [discountPct, setDiscountPct] = useState(0)   // percentage discount

  useEffect(() => {
    bookingApi.getClinicInfo().then((r) => {
      if (r.success && r.data?.consultationFee) setDefaultConsultationFee(r.data.consultationFee)
    }).catch(() => {})
  }, [])
  const [payMode, setPayMode] = useState<'upi' | 'cash'>('upi')

  const [received, setReceived] = useState('700')
  const [sent, setSent] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [paying, setPaying] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [patient, setPatient] = useState<PatientInfo>({ id: 'P001', name: 'Rahul Mehta', phone: '9876543210' })
  const [sessionBills, setSessionBills] = useState<typeof recentBills>([...recentBills])

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const discountAmt = Math.round(subtotal * discountPct / 100)
  const total = subtotal - discountAmt
  const change = payMode === 'cash' ? Math.max(0, parseInt(received || '0') - total) : 0

  const addItem = (data: Omit<Item,'id'>) =>
    setItems(prev => [...prev, { ...data, id: String(Date.now()) }])

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateItem = (id: string, field: keyof Item, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      if (field === 'qty' || field === 'price') return { ...item, [field]: Math.max(0, Number(value) || 0) }
      return { ...item, [field]: value }
    }))
  }

  const handlePrint = () => window.print()
  const handleSendDigital = () => { setSent(true); setTimeout(() => setSent(false), 3000) }

  const handleConfirmPayment = async () => {
    setPaying(true)
    try {
      // Optimistic update — add to session's recent bills list
      const now = new Date()
      const clockTime = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      const newBill = { id: invoiceId, patient: patient.name, amt: `₹${total.toLocaleString()}`, time: clockTime }
      setSessionBills(prev => [newBill, ...prev.slice(0, 9)]) // keep last 10 bills
      setPaidSuccess(true)
      setTimeout(() => {
        setPaidSuccess(false)
        // Reset form for next patient
        setItems([...defaultItems])
        setDiscountPct(0)
        setPayMode('upi')
        setReceived('700')
      }, 3000)
    } finally {
      setPaying(false)
    }
  }

  // Auto-load patient + billing items from a completed appointment
  const handlePendingSelect = (sel: PendingBillItem) => {
    setPatient({ id: sel.patientId, name: sel.patientName, phone: sel.patientPhone })
    const consultationFee: Item = { id: '__consult', name: 'Dr. Consultation Fee', description: sel.consultation?.diagnosis ?? 'General OPD visit', qty: 1, price: defaultConsultationFee }
    const prescItems: Item[] = (sel.prescriptions ?? []).map((p: any, i: number) => ({
      id: `__rx_${i}`,
      name: `${p.medicine}${p.dose ? ` — ${p.dose}` : ''}`,
      description: p.notes || `${p.duration ?? ''} days`,
      qty: p.duration ?? 1,
      price: 20, // default price per prescription item
    }))
    setItems([consultationFee, ...prescItems])
    setDiscountPct(0)
    setPayMode('upi')
  }

  const invoiceId = `#MED-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*900+100))}`
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print invoice */}
      <div className="hidden print:block">
        <PrintableInvoice
          invoiceId={invoiceId}
          date={today}
          patientName={patient.name}
          doctorName="Dr. Ananya Sharma"
          items={items}
          discount={discountAmt}
          payMode={payMode === 'upi' ? 'UPI / Card' : 'Cash'}
        />
      </div>

      <div className="p-6 print:hidden">
        {/* Header with patient search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Generate Bill</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-sm font-bold shrink-0">
                  {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
                <p className="text-sm font-semibold text-text-primary">{patient.name}</p>
              </div>
              <div className="text-xs text-text-muted px-2 border-l border-brand-border h-4 flex items-center">{patient.phone}</div>
              <div className="text-xs text-text-muted px-2 border-l border-brand-border h-4 flex items-center">{today}</div>
            </div>
          </div>
          {/* Patient search */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium shrink-0">Change patient:</span>
            <PatientSearch onSelect={setPatient} />
          </div>
        </div>

        <div className="grid xl:grid-cols-5 lg:grid-cols-4 gap-6">
          {/* Pending Billing Queue */}
          <div className="xl:col-span-1 lg:col-span-1">
            <PendingBillingQueue onSelect={handlePendingSelect} />
          </div>

          {/* Main form */}
          <div className="xl:col-span-3 lg:col-span-3 space-y-5">

            {/* Bill items */}
            <div className="card shadow-sm overflow-hidden">
              {/* Column headers */}
              <div className="bg-brand-bg px-5 py-3 border-b border-brand-border grid grid-cols-12 gap-3 text-xs font-semibold text-text-secondary uppercase">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              <div className="divide-y divide-brand-border">
                {items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-start hover:bg-brand-bg/50 transition-colors group">
                    <div className="col-span-6">
                      <input
                        className="w-full text-sm font-medium text-text-primary bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 py-0.5"
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                      />
                      {item.description && (
                        <p className="text-xs text-text-muted pl-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="number" min={1}
                        className="w-14 text-sm text-center text-text-secondary border border-brand-border rounded px-1.5 py-0.5 focus:outline-none focus:border-primary"
                        value={item.qty}
                        onChange={e => updateItem(item.id, 'qty', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <input
                        type="number" min={0}
                        className="w-20 text-sm text-right text-text-secondary border border-brand-border rounded px-1.5 py-0.5 focus:outline-none focus:border-primary"
                        value={item.price}
                        onChange={e => updateItem(item.id, 'price', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm font-semibold text-text-primary">₹{(item.price * item.qty).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-danger transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-brand-border bg-white">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors hover:bg-primary-light rounded-lg px-2 py-1"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {/* Checkout section */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Calculation */}
              <div className="card p-5">
                <div className="space-y-3 mb-4 pb-4 border-b border-brand-border">
                  <div className="flex justify-between items-center text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-medium text-text-primary">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {/* Percentage discount */}
                  <div className="flex justify-between items-center text-sm text-text-secondary">
                    <span>Discount</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 relative">
                        <Percent className="w-3.5 h-3.5 absolute right-6 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="number"
                          value={discountPct}
                          min={0}
                          max={100}
                          onChange={e => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                          className="w-full pr-8 pl-2 py-1 text-sm border border-brand-border rounded text-right focus:outline-none focus:border-primary"
                        />
                      </div>
                      {discountAmt > 0 && (
                        <span className="text-xs font-medium text-danger whitespace-nowrap">−₹{discountAmt}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-text-primary">Grand Total</span>
                  <span className="text-2xl font-black text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment & Actions */}
              <div className="card p-5">
                <p className="text-sm font-semibold text-text-primary mb-3">Payment Method</p>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setPayMode('upi')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      payMode === 'upi' ? 'bg-primary-light border-primary text-primary' : 'bg-white border-brand-border text-text-secondary'
                    }`}>
                    <Smartphone className="w-4 h-4" /> UPI / Card
                  </button>
                  <button onClick={() => setPayMode('cash')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      payMode === 'cash' ? 'bg-primary-light border-primary text-primary' : 'bg-white border-brand-border text-text-secondary'
                    }`}>
                    <IndianRupee className="w-4 h-4" /> Cash
                  </button>
                </div>

                {payMode === 'cash' && (
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-brand-bg rounded-lg border border-brand-border">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Received (₹)</label>
                      <input
                        type="number"
                        value={received}
                        onChange={e => setReceived(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-brand-border rounded text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Change Return</label>
                      <div className="w-full px-2 py-1 text-sm font-semibold text-danger">₹{change}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-auto pt-2">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={paying || paidSuccess}
                    className={`w-full py-3 flex items-center justify-center gap-2 font-extrabold text-sm rounded-xl shadow-md transition-all ${
                      paidSuccess ? 'bg-success text-white scale-[1.02]' : 'bg-success hover:bg-success/90 text-white hover:-translate-y-0.5'
                    } disabled:opacity-70`}
                  >
                    {paidSuccess ? (
                      <><CheckCircle className="w-5 h-5" /> Payment Confirmed! ✓</>
                    ) : paying ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                    ) : (
                      <><IndianRupee className="w-5 h-5" /> Mark as Paid · ₹{total.toLocaleString()}</>
                    )}
                  </button>
                  <button onClick={handlePrint} className="w-full btn-outline py-2.5 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform text-sm">
                    <Printer className="w-4 h-4" /> Generate Bill & Print
                  </button>
                  <button onClick={handleSendDigital}
                    className={`w-full py-2.5 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all text-sm ${
                      sent ? 'border-success bg-success-light text-success-text'
                           : 'border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5'
                    }`}>
                    {sent ? <><CheckCircle className="w-4 h-4" /> Bill Sent! ✓</> : <><MessageSquare className="w-4 h-4" /> Send Digital Bill</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar – Recent Bills */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-muted" /> Recent Bills
              </h3>
              <div className="space-y-3">
                {sessionBills.map(bill => (
                  <div key={bill.id} className="p-3 bg-brand-bg rounded-lg border border-brand-border hover:border-text-muted transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-text-primary">{bill.amt}</span>
                      <span className="badge-success text-[10px] px-1.5 py-0">{bill.time}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{bill.patient}</p>
                    <p className="text-[10px] text-text-muted mt-1">{bill.id}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs font-medium text-primary hover:text-primary-hover text-center transition-colors">
                View All Invoices
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddItemModal onAdd={addItem} onClose={() => setShowAddModal(false)} />}
    </>
  )
}
