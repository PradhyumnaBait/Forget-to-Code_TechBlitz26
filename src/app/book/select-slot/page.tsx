'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { bookingApi } from '@/lib/api'

type SlotStatus = 'available' | 'reserved' | 'selected'

function to12h(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function categorise(slots: string[]): { label: string; slots: string[] }[] {
  const morning = slots.filter(s => { const h = parseInt(s); return h >= 6 && h < 12 })
  const afternoon = slots.filter(s => { const h = parseInt(s); return h >= 12 && h < 17 })
  const evening = slots.filter(s => { const h = parseInt(s); return h >= 17 })
  return [
    { label: 'Morning', slots: morning },
    { label: 'Afternoon', slots: afternoon },
    { label: 'Evening', slots: evening },
  ].filter(s => s.slots.length > 0)
}

function SlotButton({ slot, selected, onSelect }: { slot: string; selected: string | null; onSelect: (s: string) => void }) {
  const status: SlotStatus = slot === selected ? 'selected' : 'available'
  const base = 'relative rounded-xl border text-sm font-medium px-3 py-3 text-center transition-all duration-150'
  const styles: Record<SlotStatus, string> = {
    available: `${base} border-brand-border text-text-primary hover:border-primary hover:bg-primary-light hover:text-primary cursor-pointer`,
    reserved: `${base} border-warning bg-warning-light text-warning-text cursor-not-allowed`,
    selected: `${base} border-primary bg-primary text-white shadow-md cursor-pointer`,
  }
  return (
    <button className={styles[status]} onClick={() => onSelect(slot)}>
      {to12h(slot)}
    </button>
  )
}

export default function SelectSlotPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateStr = typeof window !== 'undefined' ? sessionStorage.getItem('md_date') ?? '' : ''
  const displayDate = dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : ''

  useEffect(() => {
    if (!dateStr) { router.replace('/book/select-date'); return }
    const load = async () => {
      setLoading(true)
      try {
        const res = await bookingApi.getSlots(dateStr)
        if (res.success) setSlots(res.data?.availableSlots ?? [])
      } catch {
        setError('Could not load slots. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dateStr])

  const handleConfirm = async () => {
    if (!selected) return
    try {
      await bookingApi.reserveSlot(dateStr, selected)
    } catch { /* non-critical — proceed anyway */ }
    sessionStorage.setItem('md_slot', selected)
    router.push('/book/confirm')
  }

  const sections = categorise(slots)

  return (
    <div>
      <StepProgressBar currentStep={4} />

      <div className="card p-6 shadow-md">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Choose a Time Slot</h1>
            <p className="text-sm text-text-secondary mt-1">{displayDate}</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent-light px-3 py-1.5 rounded-full hover:bg-accent hover:text-white transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>

        <div className="flex items-center gap-2 bg-warning-light border border-warning/30 rounded-lg px-3 py-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-xs text-warning-text">Selected slots are held for 5 minutes only.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading available slots…
          </div>
        ) : error ? (
          <div className="text-center py-10 text-danger text-sm">{error}</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-sm">
            No slots available for this date. Please choose another date.
          </div>
        ) : (
          <div className="space-y-5">
            {sections.map(({ label, slots: s }) => (
              <div key={label}>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2.5">{label}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {s.map(slot => (
                    <SlotButton key={slot} slot={slot} selected={selected} onSelect={setSelected} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-brand-border">
          {[
            { cls: 'bg-white border border-brand-border', label: 'Available' },
            { cls: 'bg-primary', label: 'Selected' },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-text-muted">
              <div className={`w-3.5 h-3.5 rounded ${cls}`} />
              {label}
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Slot — {selected ? to12h(selected) : 'none selected'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
