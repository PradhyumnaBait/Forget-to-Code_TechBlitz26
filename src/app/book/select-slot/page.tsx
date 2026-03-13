'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight, Sparkles, Loader2, X, Send, Bot } from 'lucide-react'
import StepProgressBar from '@/components/booking/StepProgressBar'
import { bookingApi, aiApi } from '@/lib/api'

type SlotStatus = 'available' | 'selected'

function to12h(t: string): string {
  if (!t) return t
  if (t.includes('AM') || t.includes('PM')) return t
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
    { label: '🌅 Morning', slots: morning },
    { label: '☀️ Afternoon', slots: afternoon },
    { label: '🌆 Evening', slots: evening },
  ].filter(s => s.slots.length > 0)
}

function SlotButton({ slot, selected, onSelect }: { slot: string; selected: string | null; onSelect: (s: string) => void }) {
  const status: SlotStatus = slot === selected ? 'selected' : 'available'
  const base = 'relative rounded-xl border text-sm font-medium px-3 py-3 text-center transition-all duration-150'
  const styles: Record<SlotStatus, string> = {
    available: `${base} border-brand-border text-text-primary hover:border-primary hover:bg-primary-light hover:text-primary cursor-pointer`,
    selected: `${base} border-primary bg-primary text-white shadow-md cursor-pointer scale-[1.02]`,
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
  const [dateStr, setDateStr] = useState('')
  const [displayDate, setDisplayDate] = useState('')

  // AI chat state
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Read sessionStorage client-side only
  useEffect(() => {
    const d = sessionStorage.getItem('md_date') ?? ''
    if (!d) { router.replace('/book/select-date'); return }
    setDateStr(d)
    setDisplayDate(new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }))
  }, [router])

  const loadSlots = useCallback(async (date: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingApi.getSlots(date)
      if (res.success) {
        // Backend returns both `slots` and `availableSlots` — prefer `availableSlots`
        const data = res.data as any
        const rawSlots: string[] = data?.availableSlots ?? data?.slots ?? []
        setSlots(rawSlots)
        if (rawSlots.length === 0) {
          setError('No slots available for this date. Please go back and choose another date.')
        }
      } else {
        setError('Could not load slots. Please try again.')
      }
    } catch (e) {
      setError('Unable to connect to server. Please check that the backend is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (dateStr) loadSlots(dateStr)
  }, [dateStr, loadSlots])

  const handleConfirm = async () => {
    if (!selected) return
    try {
      await bookingApi.reserveSlot(dateStr, selected)
    } catch { /* non-critical */ }
    sessionStorage.setItem('md_slot', selected)
    router.push('/book/confirm')
  }

  const sendAI = async (msg: string) => {
    if (!msg.trim()) return
    const userMsg = { from: 'user' as const, text: msg }
    setAiMessages(prev => [...prev, userMsg])
    setAiInput('')
    setAiLoading(true)
    try {
      const history = aiMessages.map(m => ({ role: (m.from === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.text }))
      const context = dateStr ? `The patient is looking at available slots for ${displayDate}. ` : ''
      const res = await aiApi.chat(context + msg, history)
      setAiMessages(prev => [...prev, { from: 'bot', text: res.data?.reply ?? 'How can I help?' }])
    } catch {
      setAiMessages(prev => [...prev, {
        from: 'bot', text: `The clinic is open Mon–Sat, 9 AM–6 PM. Available slots for ${displayDate} are shown on the left. Select one and click Confirm!`
      }])
    } finally {
      setAiLoading(false)
    }
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
          <button
            onClick={() => {
              setAiOpen(v => !v)
              if (!aiOpen && aiMessages.length === 0) {
                setAiMessages([{ from: 'bot', text: `Hi! I can help you choose the best time slot for ${displayDate}. What time of day works best for you — morning, afternoon, or evening?` }])
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent-light px-3 py-1.5 rounded-full hover:bg-accent hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>

        {/* AI chat panel */}
        {aiOpen && (
          <div className="mb-4 border border-primary/20 rounded-xl bg-primary-light overflow-hidden">
            {/* AI header */}
            <div className="flex items-center justify-between px-3 py-2 bg-primary">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-semibold">MedDesk AI</span>
                <span className="text-xs text-blue-200">· Ask me anything</span>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Messages */}
            <div className="max-h-36 overflow-y-auto p-3 space-y-2">
              {aiMessages.map((m, i) => (
                <div key={i} className={`text-xs rounded-lg px-3 py-2 max-w-[88%] ${m.from === 'user' ? 'ml-auto bg-primary text-white' : 'bg-white text-text-primary border border-brand-border'}`}>
                  {m.text}
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
                </div>
              )}
            </div>
            {/* AI input */}
            <div className="flex items-center gap-2 p-2 bg-white border-t border-brand-border">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAI(aiInput)}
                placeholder="Ask about best slot times…"
                className="flex-1 text-xs border border-brand-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              />
              <button onClick={() => sendAI(aiInput)} disabled={!aiInput.trim() || aiLoading}
                className="text-white bg-primary px-2.5 py-1.5 rounded-lg hover:bg-primary-hover disabled:opacity-40">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-warning-light border border-warning/30 rounded-lg px-3 py-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-xs text-warning-text">Selected slots are held for 5 minutes only.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading available slots…
          </div>
        ) : error ? (
          <div className="text-center py-10 text-sm space-y-3">
            <p className="text-danger">{error}</p>
            <button onClick={() => dateStr && loadSlots(dateStr)}
              className="text-xs text-primary underline">
              Try again
            </button>
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
