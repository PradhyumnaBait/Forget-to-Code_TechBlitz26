'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Plus, Phone, CalendarDays, FileText, MoreHorizontal,
  User, ChevronRight, X, Loader2, Save, Trash2, AlertCircle,
  CheckCircle2, Stethoscope, Clock, ArrowRight, Mail, Calendar
} from 'lucide-react'
import { patientApi, bookingApi, consultationApi } from '@/lib/api'

interface Patient {
  id: string
  name: string
  age?: number | null
  gender?: string | null
  phone: string
  email?: string | null
  medicalHistory?: string | null
  allergies?: string | null
  createdAt?: string
  appointments?: any[]
  consultations?: any[]
}

type Modal = 'none' | 'register' | 'edit' | 'delete' | 'book' | 'records'

// ─── Utility ────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function to12h(t: string) {
  if (!t) return t
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ─── Register / Edit Patient Modal ──────────────────────────────────────────
function PatientFormModal({
  patient, onClose, onSaved
}: { patient?: Patient | null; onClose: () => void; onSaved: (p: Patient) => void }) {
  const isEdit = !!patient
  const [form, setForm] = useState({
    name: patient?.name ?? '',
    phone: patient?.phone ?? '',
    age: String(patient?.age ?? ''),
    gender: patient?.gender ?? '',
    email: patient?.email ?? '',
    medicalHistory: patient?.medicalHistory ?? '',
    allergies: patient?.allergies ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.phone.trim()) { setError('Phone is required'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        email: form.email || undefined,
        medicalHistory: form.medicalHistory || undefined,
        allergies: form.allergies || undefined,
      }
      let res: any
      if (isEdit && patient) {
        res = await patientApi.update(patient.id, payload)
      } else {
        res = await patientApi.create(payload)
      }
      if (res.success) {
        onSaved(res.data as Patient)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? 'Edit Patient Details' : 'Register New Patient'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="e.g. Rahul Mehta" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} maxLength={15} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="optional" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" placeholder="years" value={form.age} onChange={set('age')} min={0} max={150} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Medical History</label>
              <textarea className="input min-h-[72px] resize-none" placeholder="Known conditions, chronic illnesses…"
                value={form.medicalHistory} onChange={set('medicalHistory')} />
            </div>
            <div className="col-span-2">
              <label className="label">Known Allergies</label>
              <textarea className="input min-h-[56px] resize-none" placeholder="Drug allergies, food allergies…"
                value={form.allergies} onChange={set('allergies')} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Register Patient'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ patient, onClose, onDeleted }: { patient: Patient; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true); setError('')
    try {
      await patientApi.delete(patient.id)
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <Trash2 className="w-6 h-6 text-danger" />
        </div>
        <h2 className="text-lg font-bold text-text-primary text-center mb-1">Delete Patient Record?</h2>
        <p className="text-sm text-text-secondary text-center mb-4">
          This will remove <strong>{patient.name}</strong>'s record. This action cannot be undone.
        </p>
        {error && <p className="text-xs text-danger text-center mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-danger rounded-xl hover:bg-danger/90 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Book Appointment Modal ──────────────────────────────────────────────────
function BookAppointmentModal({ patient, onClose, onBooked }: { patient: Patient; onClose: () => void; onBooked: () => void }) {
  const [dates, setDates] = useState<string[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [selDate, setSelDate] = useState('')
  const [selSlot, setSelSlot] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [payMode, setPayMode] = useState<'AT_CLINIC' | 'UPI'>('AT_CLINIC')
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    bookingApi.getAvailableDates().then(res => {
      if (res.success) setDates((res.data as any).dates?.slice(0, 7) ?? [])
    }).catch(() => {})
  }, [])

  const loadSlots = useCallback(async (date: string) => {
    setSelSlot(''); setSlots([]); setLoadingSlots(true)
    try {
      const res = await bookingApi.getSlots(date)
      const data = res.data as any
      setSlots(data?.availableSlots ?? data?.slots ?? [])
    } catch { /* ignore */ }
    finally { setLoadingSlots(false) }
  }, [])

  const handleDateSelect = (d: string) => {
    setSelDate(d)
    loadSlots(d)
  }

  const handleBook = async () => {
    if (!selDate || !selSlot) { setError('Please select date and time slot'); return }
    setLoading(true); setError('')
    try {
      const res: any = await bookingApi.createAppointment({
        date: selDate,
        timeSlot: selSlot,
        symptoms,
        paymentMethod: payMode,
        patientName: patient.name,
        patientPhone: patient.phone,
      } as any)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => { onBooked(); onClose() }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <CheckCircle2 className="w-9 h-9 text-success" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Appointment Booked!</h2>
        <p className="text-sm text-text-secondary">WhatsApp confirmation sent to {patient.name}</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Book Appointment</h2>
            <p className="text-xs text-text-secondary mt-0.5">For: <strong>{patient.name}</strong> · {patient.phone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Date Selection */}
          <div>
            <label className="label mb-2">Select Date</label>
            <div className="flex flex-wrap gap-2">
              {dates.length === 0 ? (
                <p className="text-xs text-text-muted">Loading available dates…</p>
              ) : dates.map(d => {
                const dt = new Date(d + 'T00:00:00')
                return (
                  <button key={d} onClick={() => handleDateSelect(d)}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      selDate === d ? 'border-primary bg-primary text-white' : 'border-brand-border hover:border-primary hover:bg-primary-light hover:text-primary'
                    }`}>
                    <span className="text-[10px] font-bold uppercase opacity-70">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="text-base font-extrabold">{dt.getDate()}</span>
                    <span className="text-[10px] opacity-70">{dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slot Selection */}
          {selDate && (
            <div>
              <label className="label mb-2">Select Time Slot</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading slots…</div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-danger">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(s => (
                    <button key={s} onClick={() => setSelSlot(s)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        selSlot === s ? 'bg-primary text-white border-primary' : 'border-brand-border hover:border-primary hover:text-primary'
                      }`}>
                      {to12h(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chief Complaint */}
          <div>
            <label className="label">Chief Complaint / Reason</label>
            <input className="input" placeholder="e.g. Follow-up, fever, routine checkup…"
              value={symptoms} onChange={e => setSymptoms(e.target.value)} />
          </div>

          {/* Payment */}
          <div>
            <label className="label mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {(['AT_CLINIC', 'UPI'] as const).map(m => (
                <button key={m} onClick={() => setPayMode(m)}
                  className={`py-2.5 border-2 text-sm font-medium rounded-xl transition-all ${
                    payMode === m ? 'border-primary bg-primary-light text-primary' : 'border-brand-border text-text-secondary'
                  }`}>
                  {m === 'UPI' ? '📱 Pay Now (UPI)' : '🏥 Pay at Clinic'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button onClick={handleBook} disabled={loading || !selDate || !selSlot}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</> : <><CalendarDays className="w-4 h-4" /> Confirm Booking</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Full Records Panel ──────────────────────────────────────────────────────
function FullRecordsPanel({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [patRes, histRes] = await Promise.allSettled([
          patientApi.getById(patient.id),
          consultationApi.history(patient.id),
        ])
        const pat  = patRes.status === 'fulfilled'  ? (patRes.value as any).data  : null
        const hist = histRes.status === 'fulfilled' ? (histRes.value as any).data : null
        setData({ patient: pat ?? patient, history: hist?.history ?? [] })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patient])

  const downloadRecordsPDF = () => {
    const hist = data?.history ?? []
    const consultRows = hist.map((c: any, i: number) => `
      <tr style="border-top:1px solid #e2e8f0">
        <td style="padding:10px 12px">${i + 1}</td>
        <td style="padding:10px 12px">${formatDate(c.createdAt ?? '')}</td>
        <td style="padding:10px 12px">${c.diagnosis ?? '—'}</td>
        <td style="padding:10px 12px">${c.advice ?? '—'}</td>
        <td style="padding:10px 12px">${c.prescriptions?.length ?? 0} medicines</td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Patient Records — ${patient.name}</title>
    <style>
      *{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;box-sizing:border-box}
      body{background:#f8fafc;padding:40px;color:#1e293b}
      .card{background:white;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.08);max-width:800px;margin:0 auto}
      .header{background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:12px;padding:24px 28px;color:white;margin-bottom:28px}
      .header h1{font-size:22px;font-weight:800;margin-bottom:6px}
      .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
      .meta-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
      .meta-box label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;display:block;margin-bottom:4px}
      .meta-box span{font-size:14px;font-weight:600;color:#1e293b}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b}
      .section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:14px}
    </style></head><body><div class="card">
      <div class="header"><h1>🏥 Patient Medical Records</h1><div style="opacity:.8;font-size:13px">Generated: ${new Date().toLocaleString('en-IN')} · MedDesk Clinic</div></div>
      <div class="meta">
        <div class="meta-box"><label>Patient Name</label><span>${patient.name}</span></div>
        <div class="meta-box"><label>Age / Gender</label><span>${patient.age ?? '—'} yrs · ${patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : '—'}</span></div>
        <div class="meta-box"><label>Phone</label><span>${patient.phone}</span></div>
        <div class="meta-box"><label>Medical History</label><span>${patient.medicalHistory || '—'}</span></div>
        <div class="meta-box"><label>Known Allergies</label><span>${patient.allergies || 'None reported'}</span></div>
        <div class="meta-box"><label>Total Consultations</label><span>${hist.length}</span></div>
      </div>
      <div class="section-title">Consultation History</div>
      ${hist.length === 0 ? '<p style="color:#94a3b8;font-size:13px">No consultation records found.</p>' : `
      <table><thead><tr><th>#</th><th>Date</th><th>Diagnosis</th><th>Advice</th><th>Prescriptions</th></tr></thead>
      <tbody>${consultRows}</tbody></table>`}
    </div></body></html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(html)
    win.document.close()
    setTimeout(() => { win.print() }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Full Medical Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{patient.name} · {patient.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadRecordsPDF}
              className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary-light px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading records…
            </div>
          ) : (
            <>
              {/* Patient Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Age', value: data?.patient?.age ? `${data.patient.age} years` : '—' },
                  { label: 'Gender', value: data?.patient?.gender === 'M' ? 'Male' : data?.patient?.gender === 'F' ? 'Female' : '—' },
                  { label: 'Blood Group', value: data?.patient?.bloodGroup || '—' },
                  { label: 'Phone', value: data?.patient?.phone ?? patient.phone },
                  { label: 'Email', value: data?.patient?.email || '—' },
                  { label: 'Registered', value: data?.patient?.createdAt ? formatDate(data.patient.createdAt) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-brand-bg rounded-xl p-3 border border-brand-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-semibold text-text-primary">{value}</p>
                  </div>
                ))}
              </div>

              {/* Medical History & Allergies */}
              {(data?.patient?.medicalHistory || data?.patient?.allergies) && (
                <div className="space-y-3">
                  {data?.patient?.medicalHistory && (
                    <div className="bg-warning-light border border-warning/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-warning-text uppercase tracking-widest mb-1.5">Medical History</p>
                      <p className="text-sm text-text-primary">{data.patient.medicalHistory}</p>
                    </div>
                  )}
                  {data?.patient?.allergies && (
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-danger uppercase tracking-widest mb-1.5">⚠️ Known Allergies</p>
                      <p className="text-sm text-text-primary">{data.patient.allergies}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Consultation History */}
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                  Consultation History ({data?.history?.length ?? 0} visits)
                </p>
                {data?.history?.length === 0 ? (
                  <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-brand-border rounded-xl">
                    No consultations recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.history.map((c: any, i: number) => (
                      <div key={c.id ?? i} className="border border-brand-border rounded-xl p-4 hover:border-primary/30 hover:bg-primary-light/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {data.history.length - i}
                            </span>
                            <span className="text-sm font-bold text-text-primary">Visit #{data.history.length - i}</span>
                          </div>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {formatDate(c.createdAt ?? '')}
                          </span>
                        </div>
                        {c.diagnosis && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-text-muted">Diagnosis: </span>
                            <span className="text-sm text-text-primary">{c.diagnosis}</span>
                          </div>
                        )}
                        {c.notes && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-text-muted">Notes: </span>
                            <span className="text-sm text-text-secondary">{c.notes}</span>
                          </div>
                        )}
                        {c.advice && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-text-muted">Advice: </span>
                            <span className="text-sm text-text-secondary">{c.advice}</span>
                          </div>
                        )}
                        {c.prescriptions?.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-brand-border">
                            <p className="text-xs font-bold text-text-muted mb-2">Prescriptions ({c.prescriptions.length})</p>
                            <div className="space-y-1">
                              {c.prescriptions.map((rx: any, j: number) => (
                                <div key={j} className="flex flex-wrap items-center gap-2 text-xs text-text-secondary bg-brand-bg rounded-lg px-3 py-1.5">
                                  <span className="font-semibold text-text-primary">{rx.medicine}</span>
                                  <span>·</span>
                                  <span>{rx.dose}</span>
                                  <span>·</span>
                                  <span>{rx.frequency}</span>
                                  <span>·</span>
                                  <span>{rx.duration} days</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Three-Dots Context Menu ─────────────────────────────────────────────────
function PatientMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="p-2 rounded-lg hover:bg-brand-bg transition-colors">
        <MoreHorizontal className="w-5 h-5 text-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-brand-border rounded-xl shadow-lg z-20 overflow-hidden">
          <button onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-brand-bg transition-colors">
            <Save className="w-4 h-4 text-text-muted" /> Edit Details
          </button>
          <div className="border-t border-brand-border" />
          <button onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Record
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [modal, setModal] = useState<Modal>('none')

  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await patientApi.list(q || undefined)
      if (res.success) setPatients((res.data as any).patients ?? [])
    } catch {
      // Backend offline — fallback list still shows register/edit UX
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => load(search), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const closeModal = () => setModal('none')

  const handlePatientSaved = (p: Patient) => {
    setPatients(prev => {
      const existing = prev.find(x => x.id === p.id)
      if (existing) return prev.map(x => x.id === p.id ? p : x)
      return [p, ...prev]
    })
    setSelected(p)
    closeModal()
  }

  const handleDeleted = () => {
    setPatients(prev => prev.filter(p => p.id !== selected?.id))
    setSelected(null)
    closeModal()
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  return (
    <div className="p-6 flex gap-5 h-[calc(100vh-64px)]">
      {/* ── Left: Patient List ── */}
      <div className="flex flex-col flex-1 min-w-0 max-w-[420px]">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-text-primary">Patients</h1>
          <button onClick={() => setModal('register')} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Register New
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-9 h-10 text-sm" placeholder="Search by name, ID or phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <p className="text-xs text-text-muted mb-3">
          {loading ? 'Loading…' : `${filtered.length} patient${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading patients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-muted">
              {search ? 'No patients match your search.' : 'No patients registered yet.'}
            </div>
          ) : filtered.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === p.id
                  ? 'border-primary bg-primary-light shadow-sm'
                  : 'border-brand-border bg-white hover:border-text-muted hover:bg-brand-bg'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    selected?.id === p.id ? 'bg-primary text-white' : 'bg-brand-bg border border-brand-border text-text-secondary'
                  }`}>
                    {initials(p.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.age}{p.gender} · {p.phone}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              {p.medicalHistory && (
                <p className="text-xs text-text-secondary mt-2 line-clamp-1 pl-12">{p.medicalHistory}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Patient Detail Panel ── */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <div className="card p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-brand-border">
              <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center text-xl font-extrabold text-accent shrink-0">
                {initials(selected.name)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selected.age ? `${selected.age} yrs` : '—'} · {selected.gender === 'M' ? 'Male' : selected.gender === 'F' ? 'Female' : selected.gender ?? '—'}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.phone}</span>
                  {selected.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selected.email}</span>}
                </div>
              </div>
              <PatientMenu onEdit={() => setModal('edit')} onDelete={() => setModal('delete')} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Patient ID', value: selected.id.slice(0, 8).toUpperCase() },
                { label: 'Total Visits', value: `${selected.appointments?.length ?? '—'} visits` },
                { label: 'Registered', value: selected.createdAt ? formatDate(selected.createdAt) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-brand-bg rounded-xl p-3 border border-brand-border">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-text-primary">{value}</p>
                </div>
              ))}
            </div>

            {/* Medical History */}
            {(selected.medicalHistory || selected.allergies) && (
              <div className="mb-6 space-y-3">
                {selected.medicalHistory && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Current Diagnosis / History</p>
                    <div className="bg-warning-light border border-warning/20 rounded-xl p-4">
                      <p className="text-sm font-semibold text-text-primary">{selected.medicalHistory}</p>
                    </div>
                  </div>
                )}
                {selected.allergies && (
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-danger mb-1">⚠️ Allergies</p>
                    <p className="text-sm text-text-primary">{selected.allergies}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Appointments */}
            {selected.appointments && selected.appointments.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Recent Appointments</p>
                <div className="space-y-2">
                  {selected.appointments.slice(0, 4).map((apt: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                      <div className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-text-primary">
                            {formatDate(apt.date ?? '')} · {to12h(apt.timeSlot ?? '')}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            apt.status === 'COMPLETED' ? 'bg-success-light text-success-text' :
                            apt.status === 'BOOKED' ? 'bg-warning-light text-warning-text' : 'bg-brand-bg text-text-muted'
                          }`}>{apt.status}</span>
                        </div>
                        {apt.reason && <p className="text-xs text-text-secondary mt-0.5">{apt.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setModal('book')} className="flex items-center justify-center gap-2 btn-primary py-2.5 text-sm">
                <CalendarDays className="w-4 h-4" /> Book Appointment
              </button>
              <button onClick={() => setModal('records')} className="flex items-center justify-center gap-2 btn-outline py-2.5 text-sm text-primary border-primary/30 hover:bg-primary-light">
                <FileText className="w-4 h-4" /> View Full Records
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-10 h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-brand-bg rounded-2xl border-2 border-dashed border-brand-border flex items-center justify-center">
              <User className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-secondary">Select a patient</p>
              <p className="text-sm text-text-muted mt-1">Click on any patient from the list to view their details and take actions.</p>
            </div>
            <button onClick={() => setModal('register')} className="flex items-center gap-2 btn-primary py-2 px-5 text-sm mt-2">
              <Plus className="w-4 h-4" /> Register New Patient
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'register' && (
        <PatientFormModal onClose={closeModal} onSaved={handlePatientSaved} />
      )}
      {modal === 'edit' && selected && (
        <PatientFormModal patient={selected} onClose={closeModal} onSaved={handlePatientSaved} />
      )}
      {modal === 'delete' && selected && (
        <DeleteModal patient={selected} onClose={closeModal} onDeleted={handleDeleted} />
      )}
      {modal === 'book' && selected && (
        <BookAppointmentModal patient={selected} onClose={closeModal} onBooked={load} />
      )}
      {modal === 'records' && selected && (
        <FullRecordsPanel patient={selected} onClose={closeModal} />
      )}
    </div>
  )
}
