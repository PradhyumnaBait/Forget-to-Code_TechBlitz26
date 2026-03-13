'use client'

import { useState } from 'react'
import { Sparkles, Save, CheckCircle2, AlertCircle, FileText, ChevronDown, Plus, Trash2, Printer } from 'lucide-react'

export default function ConsultationPanel() {
  const [symptoms, setSymptoms] = useState('Fever 38.2°C, headache since 2 days, mild cold')
  const [diagnosis, setDiagnosis] = useState('Viral fever with upper respiratory infection')
  const [advice, setAdvice] = useState('Rest for 3 days, adequate hydration, avoid cold foods')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAiAssist = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1500)
  }

  return (
    <div className="p-6">
      {/* Patient Banner */}
      <div className="bg-white border text-sm font-medium border-gray-200 rounded-2xl px-5 py-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent font-bold">PS</div>
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider block mb-0.5">Consulting</span>
            <p className="text-base font-bold text-text-primary">Priya Singh, 32F</p>
          </div>
        </div>
        
        <div className="hidden md:block w-px h-8 bg-brand-border" />
        
        <div>
          <span className="text-text-muted text-xs uppercase tracking-wider block mb-0.5">Appointment</span>
          <p className="text-text-primary font-semibold"># 9:30 AM</p>
        </div>
        
        <div className="hidden md:block w-px h-8 bg-brand-border" />
        
        <div className="flex-1 min-w-[200px]">
          <span className="text-text-muted text-xs uppercase tracking-wider block mb-0.5">Chief Complaint</span>
          <p className="text-text-primary flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-warning" /> Mild fever, headache</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column — Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-text-muted" /> Consultation Notes
            </h2>
            <button 
              onClick={handleAiAssist}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs font-semibold bg-accent-light text-accent px-3 py-1.5 rounded-full hover:bg-accent hover:text-white transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse' : ''}`} /> 
              {isGenerating ? 'Enhancing...' : 'AI Assist ✨'}
            </button>
          </div>

          {/* AI Suggestion */}
          <div className="bg-primary-light border border-primary/30 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent blur-xl" />
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">AI Suggests</p>
              <p className="text-sm text-text-secondary font-medium">Consider testing for Dengue NS1 if fever persists &gt;3 days.</p>
              <button className="text-xs text-primary font-semibold mt-2 hover:underline">Add to advice</button>
            </div>
          </div>

          {/* Note fields */}
          {[
            { label: 'Symptoms / Observations', val: symptoms, set: setSymptoms },
            { label: 'Clinical Diagnosis', val: diagnosis, set: setDiagnosis },
            { label: 'Advice / Plan', val: advice, set: setAdvice }
          ].map(({ label, val, set }) => (
            <div key={label} className="card p-4">
              <label className="text-sm font-semibold text-text-primary block mb-2">{label}</label>
              <textarea 
                value={val}
                onChange={e => set(e.target.value)}
                className="w-full text-sm text-text-secondary placeholder-text-muted bg-brand-bg rounded-xl border-0 resize-none p-3 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200"
                rows={3}
              />
            </div>
          ))}
          
          <div className="card p-4">
            <label className="text-sm font-semibold text-text-primary block mb-2">Follow-up</label>
            <div className="flex gap-2">
              {['No follow-up', '3 Days', '5 Days', '1 Week', 'Custom'].map(t => (
                <button key={t} className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all duration-150 hover:scale-[1.02] ${t === '5 Days' ? 'border-primary bg-primary-light text-primary' : 'border-brand-border text-text-secondary bg-white hover:bg-brand-bg'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Prescription */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-text-muted" /> Prescription
            </h2>
            <button className="text-xs font-medium text-danger hover:underline">Clear All</button>
          </div>

          <div className="card flex-1 p-5 flex flex-col">
            {/* Meds List */}
            <div className="space-y-3 mb-4">
              {[
                { name: 'Paracetamol 500mg', dose: '1-0-1', dur: '5 days', note: 'After meals' },
                { name: 'Cetirizine 10mg', dose: '0-0-1', dur: '3 days', note: 'Before meals at night' },
                { name: 'Vitamin D3 60k', dose: 'Weekly', dur: '4 weeks', note: 'With milk' }
              ].map((m, i) => (
                <div key={i} className="group flex items-start justify-between p-3 rounded-xl border border-brand-border bg-white hover:border-primary/40 hover:bg-gray-50 hover:shadow-sm transition-all duration-150">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{m.name}</p>
                    <div className="flex gap-3 text-xs text-text-secondary mt-1 font-medium">
                      <span className="bg-brand-bg px-2 py-0.5 rounded">{m.dose}</span>
                      <span className="text-text-muted">•</span>
                      <span>{m.dur}</span>
                      <span className="text-text-muted">•</span>
                      <span>{m.note}</span>
                    </div>
                  </div>
                  <button className="text-text-muted hover:text-danger p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Med Button */}
            <button className="w-full py-3 rounded-xl border-2 border-dashed border-brand-border text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium bg-brand-bg mb-auto">
              <Plus className="w-4 h-4" /> Add Medicine
            </button>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-brand-border">
              <button className="btn-outline py-3 flex items-center justify-center gap-2 text-sm">
                <Printer className="w-4 h-4" /> Generate PDF
              </button>
              <button className="btn-primary py-3 flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Save & Next Patient
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
