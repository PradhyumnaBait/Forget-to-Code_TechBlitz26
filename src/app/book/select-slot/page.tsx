'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'

type SlotStatus = 'available' | 'booked' | 'reserved' | 'selected'

const morningSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
const afternoonSlots = ['12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM']
const eveningSlots = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM']

const bookedSlots = new Set(['9:00 AM', '9:30 AM', '12:30 PM', '5:30 PM'])
const reservedSlots = new Set(['11:30 AM', '3:00 PM'])

function statusOf(slot: string, selected: string | null): SlotStatus {
  if (slot === selected) return 'selected'
  if (bookedSlots.has(slot)) return 'booked'
  if (reservedSlots.has(slot)) return 'reserved'
  return 'available'
}

function SlotButton({ slot, selected, onSelect }: { slot: string; selected: string | null; onSelect: (s: string) => void }) {
  const status = statusOf(slot, selected)
  const base = 'relative rounded-xl border text-sm font-medium px-3 py-3 text-center transition-all duration-150'
  const styles: Record<SlotStatus, string> = {
    available: `${base} border-brand-border text-text-primary hover:border-primary hover:bg-primary-light hover:text-primary cursor-pointer`,
    booked: `${base} border-brand-border bg-brand-bg text-text-muted line-through cursor-not-allowed opacity-60`,
    reserved: `${base} border-warning bg-warning-light text-warning-text cursor-not-allowed`,
    selected: `${base} border-primary bg-primary text-white shadow-md cursor-pointer`,
  }
  return (
    <button
      className={styles[status]}
      onClick={() => status === 'available' && onSelect(slot)}
      disabled={status === 'booked' || status === 'reserved'}
    >
      {slot}
      {status === 'booked' && <span className="block text-xs mt-0.5">Booked</span>}
      {status === 'reserved' && <span className="block text-xs mt-0.5">Reserved</span>}
    </button>
  )
}

export default function SelectSlotPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleConfirm = () => {
    if (!selected) return
    sessionStorage.setItem('md_slot', selected)
    router.push('/book/confirm')
  }

  const sections = [
    { label: 'Morning', slots: morningSlots },
    { label: 'Afternoon', slots: afternoonSlots },
    { label: 'Evening', slots: eveningSlots },
  ]

  return (
    <div>
      <StepProgressBar currentStep={4} />

      <div className="card p-6 shadow-md">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Choose a Time Slot</h1>
            <p className="text-sm text-text-secondary mt-1">Wednesday, March 18, 2026</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent-light px-3 py-1.5 rounded-full hover:bg-accent hover:text-white transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>

        {/* Warning banner */}
        <div className="flex items-center gap-2 bg-warning-light border border-warning/30 rounded-lg px-3 py-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-xs text-warning-text">Selected slots are held for 5 minutes only.</p>
        </div>

        {/* Slot sections */}
        <div className="space-y-5">
          {sections.map(({ label, slots }) => (
            <div key={label}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2.5">{label}</h3>
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <SlotButton key={slot} slot={slot} selected={selected} onSelect={setSelected} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-brand-border">
          {[
            { cls: 'bg-white border border-brand-border', label: 'Available' },
            { cls: 'bg-brand-bg opacity-60', label: 'Booked' },
            { cls: 'bg-warning-light border border-warning/30', label: 'Reserved' },
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
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Slot — {selected ?? 'none selected'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
