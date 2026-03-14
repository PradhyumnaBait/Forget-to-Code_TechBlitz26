'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Phone, Hash, FileText, ChevronDown, Clock, CheckCircle, ArrowRight, Activity, Users, Loader2, AlertCircle } from 'lucide-react'
import { bookingApi, queueApi, patientApi } from '@/lib/api'

interface Slot { time: string; available: boolean }

function SlotButton({ slot, selected, onClick }: { slot: Slot; selected: boolean; onClick: () => void }) {
  if (!slot.available) {
    return (
      <div className="text-center py-2 px-1 rounded-lg border text-sm font-medium border-brand-border bg-brand-bg text-text-muted opacity-50 cursor-not-allowed">
        {slot.time}
      </div>
    )
  }
  return (
    <button type="button" onClick={onClick}
      className={`text-center py-2 px-1 rounded-lg border text-sm font-medium transition-colors ${
        selected
          ? 'border-primary bg-primary text-white'
          : 'border-primary/30 bg-primary-light text-primary hover:bg-primary hover:text-white'
      }`}>
      {slot.time}
    </button>
  )
}

export default function WalkInPage() {
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [queueData, setQueueData] = useState<any>(null)
  const [error, setError] = useState('')
  const [bookedPatient, setBookedPatient] = useState<{ name: string; slot: string } | null>(null)

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLSelectElement>(null)
  const complaintRef = useRef<HTMLTextAreaElement>(null)

  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  const todayDisplay = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  // Load available slots for today
  const loadSlots = useCallback(async () => {
    setSlotsLoading(true)
    try {
      const res = await bookingApi.getSlots(today)
      const available: string[] = ((res.data as any)?.availableSlots ?? (res.data as any)?.slots ?? []) as string[]
      // Generate a grid of all likely slots for today and mark available ones
      const allTimes = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
      const now = new Date()
      const nowMins = now.getHours() * 60 + now.getMinutes()
      setSlots(allTimes
        .filter(t => {
          const [h, m] = t.split(':').map(Number)
          return (h * 60 + m!) > nowMins // only future slots today
        })
        .map(t => ({
          time: new Date(`2000-01-01T${t}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
          available: available.includes(t),
        }))
        .slice(0, 8)
      )
    } catch {
      // show placeholder slots if backend is unavailable
      setSlots([
        { time: '10:30 AM', available: true },
        { time: '11:00 AM', available: true },
        { time: '11:30 AM', available: false },
        { time: '12:00 PM', available: true },
        { time: '2:00 PM', available: true },
        { time: '2:30 PM', available: true },
      ])
    } finally {
      setSlotsLoading(false)
    }
  }, [today])

  // Load queue status
  const loadQueue = useCallback(async () => {
    try {
      const res = await queueApi.status() as any
      setQueueData(res.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadSlots()
    loadQueue()
    const t = setInterval(loadQueue, 30_000)
    return () => clearInterval(t)
  }, [loadSlots, loadQueue])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const name = nameRef.current?.value.trim() ?? ''
    const phone = phoneRef.current?.value.trim() ?? ''
    const age = ageRef.current?.value ? parseInt(ageRef.current.value) : undefined
    const gender = genderRef.current?.value || undefined
    const complaint = complaintRef.current?.value.trim() || undefined

    if (!name || !phone) return setError('Name and phone are required.')
    if (phone.length !== 10) return setError('Enter a valid 10-digit mobile number.')

    // Pick slot — prefer selected slot, else pick first available
    const timeLabel = selectedSlot ?? slots.find(s => s.available)?.time ?? null
    if (!timeLabel && slots.length > 0) return setError('No slots available. Please add to waitlist.')

    setLoading(true)
    try {
      // Convert 12h display back to 24h for API (e.g., "10:30 AM" → "10:30")
      const to24 = (t: string | null) => {
        if (!t) return null
        const [timePart, ampm] = t.split(' ')
        let [h, m] = (timePart ?? '').split(':').map(Number)
        if (ampm === 'PM' && h !== 12) h = (h ?? 0) + 12
        if (ampm === 'AM' && h === 12) h = 0
        return `${String(h ?? 0).padStart(2,'0')}:${String(m ?? 0).padStart(2,'0')}`
      }
      const timeSlot24 = to24(timeLabel) ?? '09:00'

      await bookingApi.walkIn({
        patientName: name,
        patientPhone: `+91${phone}`,
        date: today,
        timeSlot: timeSlot24,
        reason: complaint ?? (priority === 'urgent' ? 'Urgent Care' : 'Walk-in Consultation'),
      })

      // Optionally register patient details
      try {
        await patientApi.create({ name, phone: `+91${phone}`, age, gender })
      } catch { /* patient may already exist – upsert handles it */ }

      setBookedPatient({ name, slot: timeLabel ?? timeSlot24 })
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setSelectedSlot(null)
      loadSlots()
      loadQueue()
      setTimeout(() => setSuccess(false), 6000)
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const queueSize = (queueData as any)?.queueLength ?? (queueData as any)?.totalInQueue ?? 0
  const estimatedWait = (queueData as any)?.estimatedWaitMinutes ?? queueSize * 15

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Register Walk-In Patient</h1>
        <p className="text-sm text-text-secondary mt-0.5">For patients arriving without a prior appointment · {todayDisplay}</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-3 card p-6">
          {error && (
            <div className="flex items-center gap-2 bg-danger-light border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name <span className="text-danger">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input ref={nameRef} required type="text" className="input pl-9" placeholder="e.g. Ramesh Patel" />
                </div>
              </div>
              <div>
                <label className="label">Phone Number <span className="text-danger">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border border-brand-border rounded-lg bg-brand-bg text-sm text-text-secondary font-medium shrink-0">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input ref={phoneRef} required type="tel" maxLength={10} className="input pl-9" placeholder="98765 43210" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input ref={ageRef} type="number" min={1} max={120} className="input pl-9" placeholder="e.g. 45" />
                </div>
              </div>
              <div>
                <label className="label">Gender</label>
                <div className="relative">
                  <select ref={genderRef} className="input appearance-none pr-9 bg-white">
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Symptoms / Chief Complaint</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <textarea ref={complaintRef} rows={3} className="input pl-9 resize-none" placeholder="Briefly describe the issue..." />
              </div>
            </div>

            {/* Slot selection */}
            {slots.length > 0 && (
              <div>
                <label className="label mb-2">Preferred Slot (Today)</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(s => (
                    <SlotButton key={s.time} slot={s} selected={selectedSlot === s.time} onClick={() => setSelectedSlot(s.time)} />
                  ))}
                </div>
                {!selectedSlot && <p className="text-xs text-text-muted mt-1.5">No slot selected — first available will be assigned.</p>}
              </div>
            )}

            <div>
              <label className="label mb-2">Priority Level</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPriority('normal')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    priority === 'normal' ? 'border-primary bg-primary-light text-primary' : 'border-brand-border text-text-secondary hover:border-text-muted'
                  }`}>
                  <User className="w-4 h-4" /> Normal
                </button>
                <button type="button" onClick={() => setPriority('urgent')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    priority === 'urgent' ? 'border-danger bg-danger-light text-danger-text' : 'border-brand-border text-text-secondary hover:border-danger/40'
                  }`}>
                  <Activity className="w-4 h-4" /> Urgent Care
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 btn-primary py-3 disabled:opacity-70">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
                  : <>Find Next Available Slot & Register <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Availability Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-between">
              Available Slots Today
              <span className="text-xs font-normal text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Live
              </span>
            </h2>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-4 text-text-muted gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading slots…
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {slots.map(s => (
                  <SlotButton key={s.time} slot={s} selected={selectedSlot === s.time} onClick={() => setSelectedSlot(s.time)} />
                ))}
                {slots.length === 0 && (
                  <div className="col-span-2 text-center text-sm text-text-muted py-3">No slots available today.</div>
                )}
              </div>
            )}
            <p className="text-xs text-text-muted text-center pt-3 border-t border-brand-border">
              Patients without a slot are added to the waitlist.
            </p>
          </div>

          <div className="card p-5 bg-gradient-to-br from-white to-brand-bg">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Queue Status</h2>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{queueSize}</p>
                <p className="text-xs text-text-secondary">patients waiting</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{estimatedWait}m</p>
                <p className="text-xs text-text-secondary">estimated wait</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {success && bookedPatient && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <div>
            <p className="text-sm font-semibold">{bookedPatient.name} registered!</p>
            <p className="text-xs text-gray-400">Assigned slot: {bookedPatient.slot} · Appointment saved to database.</p>
          </div>
        </div>
      )}
    </div>
  )
}
