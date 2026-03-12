'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Bot, Mic, Calendar, Search, XCircle, Clock } from 'lucide-react'

const quickActions = [
  { icon: Calendar, label: 'Book Appointment', msg: 'I want to book an appointment' },
  { icon: Search, label: 'Check Status', msg: 'Check my appointment status' },
  { icon: XCircle, label: 'Cancel Booking', msg: 'I want to cancel my booking' },
  { icon: Clock, label: 'Clinic Hours', msg: 'What are the clinic timings?' },
]

const botResponses: Record<string, string> = {
  'I want to book an appointment': 'Sure! You can book an appointment in just 2 minutes. Click "Book Appointment" in the top nav, or I can guide you through it. What\'s your name?',
  'Check my appointment status': 'Please share your registered phone number and I\'ll look up your appointment right away.',
  'I want to cancel my booking': 'I can help you cancel. Please provide your Appointment ID (e.g. #MED-20260318-007) or registered phone number.',
  'What are the clinic timings?': 'Dr. Ananya Sharma\'s clinic is open Monday to Saturday, 9:00 AM – 8:00 PM. Closed on Sundays and public holidays.',
}

interface Message {
  from: 'bot' | 'user'
  text: string
}

export default function FloatingAI() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hello! 👋 Welcome to MedDesk. How can I help you today?' },
  ])
  const [input, setInput] = useState('')

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { from: 'user', text }
    const botReply: Message = {
      from: 'bot',
      text: botResponses[text] ?? "I'll connect you with the clinic team shortly. Is there anything else I can help with?",
    }
    setMessages(prev => [...prev, userMsg, botReply])
    setInput('')
  }

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-5 w-[360px] bg-white rounded-2xl shadow-lg border border-brand-border z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">MedDesk AI</p>
                <p className="text-xs text-blue-100">Online · Always available</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-brand-bg">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-brand-border text-text-primary rounded-bl-sm shadow-card'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick Actions — only after first bot message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickActions.map(({ icon: Icon, label, msg }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(msg)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary-light text-primary text-xs font-medium rounded-full hover:bg-primary hover:text-white transition-colors border border-primary/20"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-brand-border p-3 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your message..."
              className="flex-1 text-sm text-text-primary placeholder-text-muted bg-brand-bg rounded-lg px-3 py-2 border border-brand-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button className="p-2 text-text-muted hover:text-text-secondary transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => sendMessage(input)}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 flex items-center gap-2 bg-accent text-white px-4 py-3 rounded-full shadow-lg hover:bg-accent-hover transition-all duration-200 z-50 group"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        <span className="text-sm font-semibold hidden group-hover:inline sm:inline">Ask AI</span>
      </button>
    </>
  )
}
