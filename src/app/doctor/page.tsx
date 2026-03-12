'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle2, AlertCircle, Clock, ChevronLeft, ChevronRight, FileText, UserPlus, Sparkles } from 'lucide-react'

const allAppointments = [
  { time: '9:00 AM', name: 'Rahul Mehta', age: '28M', type: 'General', status: 'Completed', symptoms: 'Routine checkup' },
  { time: '9:30 AM', name: 'Priya Singh', age: '32F', type: 'Follow-up', status: 'In Consultation', symptoms: 'Mild fever, headache' },
  { time: '10:00 AM', name: 'Amit Kumar', age: '45M', type: 'General', status: 'Waiting', symptoms: 'Back pain' },
  { time: '10:30 AM', name: 'Sona Rajan', age: '29F', type: 'Walk-in', status: 'Waiting', symptoms: 'Cough and cold' },
  { time: '11:00 AM', name: 'Kavya Pillai', age: '35F', type: 'Consultation', status: 'Waiting', symptoms: 'Thyroid review' },
]

export default function DoctorDashboard() {
  const [date, setDate] = useState('Friday, March 13')
  const [toggle, setToggle] = useState(true)

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="p-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Dr. Sharma's Schedule — {date}</h1>
          <button className="p-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-bg transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">{toggle ? 'Available' : 'On Break'}</span>
          <button
            onClick={() => setToggle(!toggle)}
            className={`w-11 h-6 rounded-full relative transition-colors ${toggle ? 'bg-success' : 'bg-brand-border'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${toggle ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">18</p>
            <p className="text-xs text-text-secondary">Today's Patients</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success-text">11</p>
            <p className="text-xs text-text-secondary">Completed</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning-text">7</p>
            <p className="text-xs text-text-secondary">Remaining</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Active Patients */}
        <div className="lg:col-span-2 space-y-6">
          {/* Now Consulting */}
          <div className="card p-6 border-2 border-primary/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="badge-info px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1" />
                Now Consulting
              </span>
              <span className="text-sm font-semibold text-text-primary"># 9:30 AM</span>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center text-lg font-bold text-accent">
                PS
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Priya Singh <span className="text-sm font-medium text-text-muted ml-2">32F</span></h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-text-secondary">
                  <AlertCircle className="w-4 h-4" /> Chief Complaint: <span className="text-text-primary font-medium">Mild fever, headache</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-brand-border">
              <Link href="/doctor/consultation" className="btn-primary py-2.5 flex justify-center items-center gap-2">
                <FileText className="w-4 h-4" /> Open Notes & Prescription
              </Link>
              <button className="btn-outline py-2.5 flex justify-center items-center gap-2 text-primary hover:bg-primary-light border-primary/30">
                <Calendar className="w-4 h-4" /> Patient History
              </button>
            </div>
          </div>

          {/* Next Up */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Next Up</span>
              <span className="badge-warning">Waiting</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center font-bold text-text-secondary">AK</div>
                <div>
                  <p className="text-base font-semibold text-text-primary">Amit Kumar <span className="text-xs font-medium text-text-muted ml-1">45M</span></p>
                  <p className="text-sm text-text-secondary">10:00 AM · Back pain</p>
                </div>
              </div>
              <button className="text-sm font-medium text-primary hover:text-primary-hover">Call In</button>
            </div>
          </div>
        </div>

        {/* Right: Daily Timeline */}
        <div className="card flex flex-col h-[calc(100vh-140px)] sticky top-6">
          <div className="p-4 border-b border-brand-border bg-white rounded-t-xl z-10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Daily Timeline</h3>
            <span className="text-xs text-text-muted">18 apps</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-0">
            {allAppointments.map((app, i) => (
              <div key={app.time} className="relative pl-6 pb-6 last:pb-0">
                {/* Timeline line */}
                {i < allAppointments.length - 1 && (
                  <div className="absolute top-3 left-[9px] w-0.5 h-full bg-brand-border" />
                )}
                
                {/* Timeline dot */}
                <div className={`absolute top-1.5 left-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 ${
                  app.status === 'Completed' ? 'bg-success' :
                  app.status === 'In Consultation' ? 'bg-primary' :
                  app.status === 'No-show' ? 'bg-danger' : 'bg-warning'
                }`}>
                  {app.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>

                {/* Content */}
                <div className={`p-3 rounded-lg border ${
                  app.status === 'In Consultation' ? 'border-primary/50 bg-primary-light shadow-sm' : 'border-brand-border bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-text-primary">{app.time}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      app.status === 'Completed' ? 'text-success-text' :
                      app.status === 'In Consultation' ? 'text-primary' : 'text-text-muted'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{app.name}</p>
                  <p className="text-xs text-text-secondary truncate">{app.symptoms}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-brand-border bg-brand-bg rounded-b-xl flex justify-center">
            <button className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent-hover p-2 rounded-lg bg-white shadow-sm border border-brand-border w-full justify-center">
              <Sparkles className="w-4 h-4" /> AI Daily Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
