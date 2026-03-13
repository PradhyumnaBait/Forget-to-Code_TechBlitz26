'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowRight, Info, Loader2 } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { bookingApi } from '@/lib/api'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function SelectDatePage() {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await bookingApi.getAvailableDates()
        if (res.success && res.data?.dates) {
          setAvailableDates(new Set(res.data.dates))
        }
      } catch {
        setError('Could not load available dates. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const dateStr = (day: number) => {
    const d = new Date(year, month, day)
    return d.toISOString().split('T')[0]
  }

  const isPast = (day: number) => {
    const d = new Date(year, month, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d < todayStart
  }

  const isAvailable = (day: number) => availableDates.has(dateStr(day))
  const isUnavailable = (day: number) => isPast(day) || !isAvailable(day)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelected(null)
  }

  const handleNext = () => {
    if (!selected) return
    sessionStorage.setItem('md_date', dateStr(selected))
    router.push('/book/select-slot')
  }

  return (
    <div>
      <StepProgressBar currentStep={3} />

      <div className="card p-6 shadow-md">
        <h1 className="text-xl font-bold text-text-primary mb-1">Select Appointment Date</h1>
        <p className="text-sm text-text-secondary mb-6">Choose from available dates below.</p>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading available dates…
          </div>
        ) : error ? (
          <div className="text-center py-10 text-danger text-sm">{error}</div>
        ) : (
          <>
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-brand-bg transition-colors">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <span className="text-base font-semibold text-text-primary">
                {MONTH_NAMES[month]} {year}
              </span>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-brand-bg transition-colors">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-text-muted py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const unavail = isUnavailable(day)
                const isSelected = selected === day
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                return (
                  <button
                    key={day}
                    disabled={unavail}
                    onClick={() => setSelected(day)}
                    className={`aspect-square rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center
                      ${unavail
                        ? 'text-text-muted cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'bg-primary text-white shadow-md'
                        : isToday
                        ? 'border-2 border-primary text-primary hover:bg-primary-light'
                        : 'text-text-primary hover:bg-primary-light hover:text-primary'
                      }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-brand-border">
              {[
                { dot: 'bg-primary', label: 'Selected' },
                { dot: 'bg-brand-border', label: 'Unavailable' },
                { dot: 'border-2 border-primary bg-white', label: 'Today' },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className={`w-3 h-3 rounded-full ${dot}`} />
                  {label}
                </div>
              ))}
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 bg-primary-light rounded-lg px-3 py-2.5 mt-4">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-primary">
                Available dates are loaded live from the clinic schedule. Green dates are open for booking.
              </p>
            </div>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 btn-primary py-3 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Select Time Slot <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
