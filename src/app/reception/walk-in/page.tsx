'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Phone, Hash, FileText, ChevronDown, Clock, CheckCircle, ArrowRight, Activity, Users, Loader2, AlertCircle, CalendarDays, ChevronLeft, ChevronRight, AlertTriangle, Shuffle } from 'lucide-react'
import { bookingApi, queueApi, patientApi, appointmentApi } from '@/lib/api'

interface Slot { time: string; timeRaw: string; available: boolean; bookedBy?: string; bookedAppointmentId?: string }

// Time conversion helpers
const to24 = (t: string) => {
  if (!t) return '09:00'
  if (!t.includes(' ')) return t // already 24h
  const [timePart, ampm] = t.split(' ')
  let [h, m] = (timePart ?? '').split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h = (h ?? 0) + 12
  if (ampm === 'AM' && h === 12) h = 0
  return `${String(h ?? 0).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`
}

const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = (h ?? 0) >= 12 ? 'PM' : 'AM'
  const hh = (h ?? 0) % 12 || 12
  return `${hh}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

// Add N minutes to a HH:MM time string
const addMinutes = (time24: string, minutes: number) => {
  const [h, m] = time24.split(':').map(Number)
  const totalMins = ((h ?? 0) * 60 + (m ?? 0) + minutes) % (24 * 60)
  return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`
}

function SlotButton({
  slot, selected, isUrgent, onClick
}: { slot: Slot; selected: boolean; isUrgent: boolean; onClick: () => void }) {
  const canForceUrgent = isUrgent && !slot.available

  if (!slot.available && !isUrgent) {
    return (
      <div className="text-center py-2.5 px-2 rounded-xl border text-xs font-medium border-brand-border bg-brand-bg text-text-muted opacity-50 cursor-not-allowed relative">
        {slot.time}
        <div className="text-[9px] text-text-muted/60 mt-0.5">Booked</div>
      </div>
    )
  }

  if (canForceUrgent) {
    return (
      <button type="button" onClick={onClick}
        className={`text-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all relative group ${
          selected ? 'border-danger bg-danger text-white shadow-lg scale-105' : 'border-danger/50 bg-danger-light text-danger hover:bg-danger hover:text-white'
        }`}
      >
        {slot.time}
        <div className="text-[9px] mt-0.5 opacity-80 flex items-center justify-center gap-0.5">
          <Shuffle className="w-2 h-2" /> Reschedule
        </div>
      </button>
    )
  }

  return (
    <button type="button" onClick={onClick}
      className={`text-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
        selected
          ? 'border-primary bg-primary text-white shadow-md scale-105'
          : 'border-primary/30 bg-primary-light text-primary hover:bg-primary hover:text-white'
      }`}
    >
      {slot.time}
      <div className="text-[9px] mt-0.5 opacity-60">Available</div>
    </button>
  )
}

const ALL_TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']

export default function WalkInPage() {
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [queueData, setQueueData] = useState<any>(null)
  const [error, setError] = useState('')
  const [bookedPatient, setBookedPatient] = useState<{ name: string; slot: string; rescheduledPatient?: string } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showUrgentWarning, setShowUrgentWarning] = useState<{slot: Slot} | null>(null)
  const [allDayAppointments, setAllDayAppointments] = useState<any[]>([])

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLSelectElement>(null)
  const complaintRef = useRef<HTMLTextAreaElement>(null)

  const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD
  const isToday = new Date().toLocaleDateString('en-CA') === dateStr
  const displayDate = selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const changeDate = (days: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + days)
      return d
    })
    setSelectedSlot(null)
  }

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true)
    setSelectedSlot(null)
    try {
      const [slotsRes, aptsRes] = await Promise.allSettled([
        bookingApi.getSlots(dateStr),
        appointmentApi.list({ date: dateStr }),
      ])


      const apptList: any[] = slotsRes.status === 'fulfilled'
        ? [] : []

      let dayAppointments: any[] = []
      if (aptsRes.status === 'fulfilled') {
        dayAppointments = (aptsRes.value.data as any)?.appointments ?? []
        setAllDayAppointments(dayAppointments)
      }

      const available: string[] = slotsRes.status === 'fulfilled'
        ? (((slotsRes.value.data as any)?.availableSlots ?? (slotsRes.value.data as any)?.slots ?? []) as string[])
        : []

      const now = new Date()
      const nowMins = isToday ? now.getHours() * 60 + now.getMinutes() : 0

      const slotGrid: Slot[] = ALL_TIMES
        .filter(t => {
          const [h, m] = t.split(':').map(Number)
          return !isToday || (h * 60 + (m ?? 0)) > nowMins
        })
        .map(t => {
          const isAvailable = available.includes(t)
          // find matching booked appointment ignoring CANCELLED/COMPLETED
          const bookedApt = dayAppointments.find(
            a => a.timeSlot === t && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status)
          )
          return {
            time: to12(t),
            timeRaw: t,
            available: isAvailable,
            bookedBy: bookedApt?.patient?.name,
            bookedAppointmentId: bookedApt?.id,
          }
        })

      setSlots(slotGrid)
    } catch {
      // Fallback: show full grid as available
      const now = new Date()
      const nowMins = isToday ? now.getHours() * 60 + now.getMinutes() : 0
      setSlots(
        ALL_TIMES
          .filter(t => {
            const [h, m] = t.split(':').map(Number)
            return !isToday || (h * 60 + (m ?? 0)) > nowMins
          })
          .map(t => ({ time: to12(t), timeRaw: t, available: true }))
      )
    } finally {
      setSlotsLoading(false)
    }
  }, [dateStr, isToday])

  const loadQueue = useCallback(async () => {
    try {
      const res = await queueApi.status() as any
      setQueueData(res.data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadSlots()
    loadQueue()
    if (isToday) {
      const t = setInterval(loadQueue, 30_000)
      return () => clearInterval(t)
    }
  }, [loadSlots, loadQueue, isToday])

  const handleSlotClick = (slot: Slot) => {
    if (!slot.available && priority === 'urgent' && slot.bookedBy) {
      // Prompt urgent override
      setShowUrgentWarning({ slot })
    } else if (slot.available) {
      setSelectedSlot(slot.time === selectedSlot ? null : slot.time)
    }
  }

  const handleUrgentOverride = () => {
    if (!showUrgentWarning) return
    setSelectedSlot(showUrgentWarning.slot.time)
    setShowUrgentWarning(null)
  }

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

    const timeLabel = selectedSlot ?? slots.find(s => s.available)?.time ?? null
    if (!timeLabel && slots.length > 0) return setError('No slots available. Please add to waitlist.')

    setLoading(true)
    const timeSlot24 = to24(timeLabel ?? '') || '09:00'

    try {
      // Find if a slot was force-selected (urgent override) — we need to reschedule that patient
      const forcedSlot = slots.find(s => s.time === timeLabel && !s.available && priority === 'urgent')
      let rescheduledName: string | undefined

      if (forcedSlot?.bookedAppointmentId) {
        // Reschedule the existing patient to current time + 15 min buffer
        const newTime = addMinutes(forcedSlot.timeRaw, 15)
        try {
          await bookingApi.rescheduleAppointment(forcedSlot.bookedAppointmentId, dateStr, newTime)
          rescheduledName = forcedSlot.bookedBy
        } catch { /* ignore if reschedule fails, best-effort */ }
      }

      // Book the urgent/walk-in appointment
      await bookingApi.walkIn({
        patientName: name,
        patientPhone: `+91${phone}`,
        date: dateStr,
        timeSlot: timeSlot24,
        reason: complaint ?? (priority === 'urgent' ? 'Urgent Care' : 'Walk-in Consultation'),
      })

      // Upsert patient details
      try {
        await patientApi.create({ name, phone: `+91${phone}`, age, gender })
      } catch { /* patient may already exist */ }

      setBookedPatient({ name, slot: timeLabel ?? timeSlot24, rescheduledPatient: rescheduledName })
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setSelectedSlot(null)
      loadSlots()
      loadQueue()
      setTimeout(() => setSuccess(false), 8000)
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const queueSize = (queueData as any)?.queueLength ?? (queueData as any)?.totalInQueue ?? 0
  const estimatedWait = (queueData as any)?.estimatedWaitMinutes ?? queueSize * 15
  const availableCount = slots.filter(s => s.available).length
  const bookedCount = slots.filter(s => !s.available).length

  return (
    <div className="p-6">
      {/* Header + Date navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Register Walk-In Patient</h1>
          <p className="text-sm text-text-secondary mt-0.5">For patients arriving without a prior appointment</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white border border-brand-border rounded-xl shadow-sm p-2.5">
          <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 min-w-[160px] justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
            <div>
              <span className="text-sm font-bold text-text-primary">{displayDate}</span>
              {isToday && <span className="ml-2 text-[10px] font-bold bg-success-light text-success-text px-1.5 py-0.5 rounded-full">TODAY</span>}
            </div>
          </div>
          <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg hover:bg-brand-bg text-text-muted hover:text-primary transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
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
                  <div className="flex items-center px-3 border border-brand-border rounded-lg bg-brand-bg text-sm text-text-secondary font-medium shrink-0">+91</div>
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

            {/* Priority Level */}
            <div>
              <label className="label mb-2">Priority Level</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPriority('normal')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                    priority === 'normal' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-brand-border text-text-secondary hover:border-text-muted'
                  }`}>
                  <User className="w-4 h-4" /> Normal
                </button>
                <button type="button" onClick={() => setPriority('urgent')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                    priority === 'urgent' ? 'border-danger bg-danger-light text-danger shadow-sm' : 'border-brand-border text-text-secondary hover:border-danger/40'
                  }`}>
                  <Activity className="w-4 h-4" /> Urgent Care
                </button>
              </div>
              {priority === 'urgent' && (
                <p className="text-xs text-danger bg-danger-light border border-danger/20 rounded-lg px-3 py-2 mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Urgent mode: booked slots can be force-selected to reschedule existing patients by +15 min.
                </p>
              )}
            </div>

            {/* Slot selection section inside form */}
            <div>
              <label className="label mb-2">Preferred Time Slot</label>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-text-muted text-sm py-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading slots…</div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-text-muted bg-brand-bg rounded-xl p-4 border border-dashed border-brand-border text-center">
                  No slots available for this date. Patient will be added to waitlist.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(s => (
                    <SlotButton key={s.timeRaw} slot={s} selected={selectedSlot === s.time} isUrgent={priority === 'urgent'} onClick={() => handleSlotClick(s)} />
                  ))}
                </div>
              )}
              {!selectedSlot && slots.length > 0 && (
                <p className="text-xs text-text-muted mt-2">No slot selected — first available will be auto-assigned.</p>
              )}
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 btn-primary py-3.5 disabled:opacity-70 font-bold text-sm uppercase tracking-wider">
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering…</>
                  : <><ArrowRight className="w-5 h-5" /> Register Patient</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slot Summary */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center justify-between">
              Available Slots — {isToday ? 'Today' : selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              <span className="text-xs font-semibold text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Live
              </span>
            </h2>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-4 text-text-muted gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading slots…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {slots.map(s => (
                    <SlotButton key={s.timeRaw} slot={s} selected={selectedSlot === s.time} isUrgent={priority === 'urgent'} onClick={() => handleSlotClick(s)} />
                  ))}
                  {slots.length === 0 && (
                    <div className="col-span-2 text-center text-sm text-text-muted py-3">No slots available.</div>
                  )}
                </div>

                {/* Slot count */}
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-brand-border mb-3">
                  <div className="bg-success-light text-center rounded-xl p-3">
                    <p className="text-xl font-extrabold text-success-text">{availableCount}</p>
                    <p className="text-xs font-medium text-success-text/70">Available</p>
                  </div>
                  <div className="bg-danger-light text-center rounded-xl p-3">
                    <p className="text-xl font-extrabold text-danger">{bookedCount}</p>
                    <p className="text-xs font-medium text-danger/70">Booked</p>
                  </div>
                </div>

                {priority === 'urgent' && (
                  <p className="text-xs text-danger text-center font-semibold flex items-center justify-center gap-1">
                    <Shuffle className="w-3.5 h-3.5" /> Urgent: click red slots to reschedule existing patients
                  </p>
                )}
                {!priority && (
                  <p className="text-xs text-text-muted text-center">Patients without a slot are added to the waitlist.</p>
                )}
              </>
            )}
          </div>

          {/* Queue Status */}
          <div className="card p-5 bg-gradient-to-br from-white to-brand-bg">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Queue Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent-light rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-accent">{queueSize}</p>
                <p className="text-xs font-semibold text-text-secondary mt-1">Patients Waiting</p>
              </div>
              <div className="bg-warning-light rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-warning-text">{estimatedWait}m</p>
                <p className="text-xs font-semibold text-text-secondary mt-1">Estimated Wait</p>
              </div>
            </div>
          </div>

          {/* Today's Booked Patients */}
          {allDayAppointments.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> {isToday ? "Today's" : "Day's"} Appointments
              </h2>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {allDayAppointments.map((apt: any) => (
                  <div key={apt.id} className={`flex items-center justify-between text-xs p-2.5 rounded-lg border ${
                    apt.status === 'COMPLETED' ? 'border-success/30 bg-success-light' :
                    apt.status === 'IN_CONSULTATION' ? 'border-primary/30 bg-primary-light' :
                    'border-brand-border bg-white'
                  }`}>
                    <div>
                      <p className="font-bold text-text-primary">{apt.patient?.name || 'Unknown'}</p>
                      <p className="text-text-muted">{to12(apt.timeSlot)}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      apt.status === 'COMPLETED' ? 'bg-success text-white' :
                      apt.status === 'IN_CONSULTATION' ? 'bg-primary text-white' :
                      'bg-brand-bg text-text-secondary'
                    }`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Urgent Override Confirmation Modal */}
      {showUrgentWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-danger-light flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <h3 className="text-lg font-extrabold text-text-primary text-center mb-2">Override Booked Slot?</h3>
              <p className="text-sm text-text-secondary text-center leading-relaxed">
                Slot <strong>{showUrgentWarning.slot.time}</strong> is booked for{' '}
                <strong className="text-text-primary">{showUrgentWarning.slot.bookedBy}</strong>.
                <br />They will be rescheduled by <strong>+15 minutes</strong> to accommodate this urgent patient.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => setShowUrgentWarning(null)} className="btn-outline py-2.5 text-sm font-bold">Cancel</button>
                <button onClick={handleUrgentOverride} className="py-2.5 text-sm font-bold bg-danger text-white rounded-xl hover:bg-danger/90 transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Shuffle className="w-4 h-4" /> Reschedule & Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && bookedPatient && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">{bookedPatient.name} registered successfully!</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Slot: {bookedPatient.slot}
              {bookedPatient.rescheduledPatient && (
                <> · <span className="text-warning">{bookedPatient.rescheduledPatient} moved +15 min</span></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
