'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Bot, Calendar, Search, XCircle, Clock, Sparkles } from 'lucide-react'
import { aiApi, ChatMessage } from '@/lib/api'

const quickActions = [
  { icon: Calendar, label: 'Book Appointment', msg: 'I want to book an appointment' },
  { icon: Search, label: 'Check Status', msg: 'Check my appointment status' },
  { icon: XCircle, label: 'Cancel Booking', msg: 'I want to cancel my booking' },
  { icon: Clock, label: 'Clinic Hours', msg: 'What are the clinic timings?' },
]

interface Message { from: 'bot' | 'user'; text: string }

function msgToHistory(msgs: Message[]): ChatMessage[] {
  return msgs.map(m => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text }))
}

export default function FloatingAI() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hello! 👋 Welcome to MedDesk. I\'m your AI assistant powered by GPT-4. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { from: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      // Build history from previous messages (exclude the current one)
      const history = msgToHistory(messages)
      const res = await aiApi.chat(text, history)
      setMessages(prev => [...prev, { from: 'bot', text: res.data?.reply ?? 'How can I help?' }])
    } catch {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'I\'m having trouble connecting right now. Please try again in a moment.',
      }])
    } finally {
      setTyping(false)
    }
  }, [messages])

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-5 w-[360px] bg-white rounded-2xl shadow-xl border border-brand-border z-50 flex flex-col overflow-hidden" style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary to-accent">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">MedDesk AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  <p className="text-xs text-blue-100">Powered by GPT-4 · Always available</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.from === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white border border-brand-border text-text-primary rounded-bl-sm shadow-card'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-white border border-brand-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-card">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickActions.map(({ icon: Icon, label, msg }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(msg)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-primary/20 text-primary text-xs font-medium rounded-full hover:bg-primary hover:text-white transition-all duration-150 shadow-sm"
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-brand-border p-3 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Type a message…"
              className="flex-1 text-sm text-text-primary placeholder-text-muted bg-brand-bg rounded-lg px-3 py-2 border border-brand-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-50"
      >
        {open ? <X className="w-5 h-5" /> : <><Sparkles className="w-4 h-4" /><span className="text-sm font-semibold">Ask AI</span></>}
      </button>
    </>
  )
}
