'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Sparkles, Save, CheckCircle2, AlertCircle, FileText, Plus, Trash2, Printer, Search, Loader2, ChevronRight } from 'lucide-react'
import { patientApi, consultationApi, prescriptionApi, queueApi } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'

function ConsultationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlAppointmentId = searchParams.get('id')

  // Search & Patient Selection
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Active Consultation State
  const [patient, setPatient] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loadingActive, setLoadingActive] = useState(false)

  // Form State
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [advice, setAdvice] = useState('')
  const [medicines, setMedicines] = useState<{ medicine: string; dose: string; duration: number; notes: string }[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadPatientByAppointment = useCallback(async (appId: string) => {
    setLoadingActive(true)
    try {
      const { appointmentApi } = await import('@/lib/api')
      const res = await appointmentApi.getById(appId)
      const data = res.data as any
      if (data) {
        setAppointment(data)
        setPatient(data.patient)
        setSymptoms(data.symptoms || '')
        // Pre-fill if consultation exists
        if (data.consultation) {
          setDiagnosis(data.consultation.diagnosis || '')
          setAdvice(data.consultation.advice || '')
          // Would load existing prescriptions too if they were populated
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoadingActive(false)
    }
  }, [])

  useEffect(() => {
    if (urlAppointmentId) {
      loadPatientByAppointment(urlAppointmentId)
    }
  }, [urlAppointmentId, loadPatientByAppointment])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await patientApi.search(undefined, searchQuery)
        setSearchResults((res.data as any)?.patients ?? [])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const selectPatient = async (p: any) => {
    setShowDropdown(false)
    setSearchQuery('')
    setLoadingActive(true)
    try {
      const res = await patientApi.getById(p.id)
      const fullPatient = res.data as any
      setPatient(fullPatient)
      
      const activeApp = fullPatient.appointments?.find((a: any) => ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(a.status))
      
      if (activeApp) {
        setAppointment(activeApp)
        setSymptoms(activeApp.symptoms || '')
        if (activeApp.status !== 'IN_CONSULTATION') {
          // auto check-in and start
          await queueApi.next().catch(()=>null)
          await consultationApi.start(activeApp.id).catch(()=>null)
        }
      } else {
        // Fallback if no active appointment
        setAppointment(fullPatient.appointments?.[0] || null)
      }
    } finally {
      setLoadingActive(false)
    }
  }

  const handleAiAssist = async () => {
    if (!symptoms) return
    setIsGenerating(true)
    try {
      const { aiApi } = await import('@/lib/api')
      const d = await aiApi.chat(`Patient symptoms: ${symptoms}. Suggest a clinical diagnosis and 2 lines of medical advice for the doctor. Format: \nDiagnosis: ...\nAdvice: ...`)
      const reply = d.data?.reply || ''
      const matchedDiag = reply.match(/Diagnosis:\s*(.+)/i)
      const matchedAdvice = reply.match(/Advice:\s*([\s\S]+)/i)
      
      if (matchedDiag?.[1] && !diagnosis) setDiagnosis(matchedDiag[1].trim())
      if (matchedAdvice?.[1] && !advice) setAdvice(matchedAdvice[1].trim())
    } finally {
      setIsGenerating(false)
    }
  }

  const addMeds = () => {
    setMedicines([...medicines, { medicine: '', dose: '', duration: 3, notes: '' }])
  }

  const updateMed = (index: number, field: string, value: any) => {
    const newMeds = [...medicines]
    newMeds[index] = { ...newMeds[index], [field]: value }
    setMedicines(newMeds)
  }

  const saveConsultation = async () => {
    if (!appointment || !patient) return
    setSaving(true)
    try {
      // Ensure consultation is started
      try { await consultationApi.start(appointment.id) } catch { /* existing session */ }
      
      // Save notes
      const notesRes = await consultationApi.saveNotes({
        appointmentId: appointment.id,
        patientId: patient.id,
        notes: symptoms,
        diagnosis,
        advice,
      })
      const consultId = (notesRes.data as any)?.id

      // Save prescriptons
      if (consultId && medicines.length > 0) {
        const validMeds = medicines.filter(m => m.medicine.trim())
        if (validMeds.length > 0) {
          await prescriptionApi.createBulk({
            consultationId: consultId,
            patientId: patient.id,
            medicines: validMeds.map(m => ({
              medicine: m.medicine.trim(),
              dose: m.dose?.trim() || '1-0-1',
              frequency: 'Daily',
              duration: Number(m.duration) || 3,
              notes: m.notes?.trim() || ''
            }))
          })
        }
      }
      
      // Complete appointment
      await queueApi.complete(appointment.id)
      
      router.push('/doctor')
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Failed to save consultation. Check console.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      {/* Search Bar Top */}
      <div className="mb-6 relative z-50">
        <div className="relative max-w-2xl mx-auto flex items-center shadow-sm">
          <Search className="absolute left-4 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search patient by name or phone number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-xl text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
          />
          {searching && <Loader2 className="absolute right-4 w-5 h-5 text-primary animate-spin" />}
        </div>
        
        {/* Dropdown Results */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border border-brand-border rounded-xl shadow-xl overflow-hidden custom-scrollbar max-h-80">
            {searchResults.length === 0 && !searching ? (
              <div className="p-4 text-center text-text-muted text-sm font-medium">No patients found.</div>
            ) : (
              searchResults.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => selectPatient(p)}
                  className="w-full text-left px-5 py-3 border-b border-brand-border hover:bg-brand-bg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-secondary">{p.phone} • {p.age || '?'} yrs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {loadingActive ? (
        <div className="h-64 flex flex-col items-center justify-center text-text-muted">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="font-semibold text-sm">Loading consultation...</p>
        </div>
      ) : !patient ? (
        <div className="h-64 flex flex-col items-center justify-center text-text-muted bg-white border border-dashed border-brand-border rounded-2xl">
          <Search className="w-10 h-10 text-brand-border mb-3" />
          <p className="font-semibold text-base text-text-primary">Search and select a patient to start consultation</p>
        </div>
      ) : (
        <>
          {/* Patient Banner */}
          <div className="bg-gradient-to-r from-primary-light/50 to-white border border-brand-border rounded-2xl px-6 py-5 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-primary text-[10px] uppercase font-black tracking-widest block mb-1">Active Consultation</span>
                <p className="text-lg font-extrabold text-text-primary">{patient.name}, <span className="font-medium text-text-secondary">{patient.age}y {patient.gender}</span></p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-brand-border" />
            
            <div>
              <span className="text-text-muted text-[10px] uppercase tracking-widest font-black block mb-1">Appt Slot</span>
              <p className="text-text-primary font-extrabold uppercase bg-brand-bg px-3 py-1 rounded badge-primary text-xs">{appointment?.timeSlot || 'WALK-IN'}</p>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-brand-border" />
            
            <div className="flex-1 min-w-[200px]">
              <span className="text-text-muted text-[10px] uppercase tracking-widest font-black block mb-1">Chief Complaint</span>
              <p className="text-text-primary font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning stroke-[2.5px]" /> {appointment?.symptoms || 'None specified'}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column — Notes */}
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-3 border-b border-brand-border pb-2">
                <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2 tracking-tight">
                  <FileText className="w-5 h-5 text-primary" /> Consultation Notes
                </h2>
                <button 
                  onClick={handleAiAssist}
                  disabled={isGenerating || !symptoms}
                  className="flex items-center gap-2 text-xs font-bold bg-white text-accent px-4 py-2 border border-brand-border rounded-xl hover:bg-accent-light hover:border-accent hover:text-accent transition-all shadow-sm"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} /> 
                  {isGenerating ? 'Enhancing...' : 'AI Assist ✨'}
                </button>
              </div>

              {/* Note fields */}
              {[
                { label: 'Symptoms & Observations', val: symptoms, set: setSymptoms, placeholder: 'E.g., Mild fever, headache since 2 days...' },
                { label: 'Clinical Diagnosis', val: diagnosis, set: setDiagnosis, placeholder: 'E.g., Viral upper respiratory infection' },
                { label: 'Advice & Treatment Plan', val: advice, set: setAdvice, placeholder: 'E.g., Complete rest for 3 days, drink lots of fluids' }
              ].map(({ label, val, set, placeholder }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-brand-border shadow-sm focus-within:ring-2 ring-primary/20 transition-all">
                  <label className="text-xs font-extrabold text-text-primary block mb-3 uppercase tracking-wider">{label}</label>
                  <textarea 
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full text-sm font-medium text-text-secondary placeholder-text-muted bg-brand-bg/50 rounded-xl border border-transparent resize-none p-4 focus:outline-none focus:bg-white focus:border-primary/50 transition-colors"
                    rows={label === 'Advice & Treatment Plan' ? 4 : 3}
                  />
                </div>
              ))}
            </div>

            {/* Right Column — Prescription */}
            <div className="flex flex-col h-full space-y-5">
              <div className="flex items-center justify-between mb-3 border-b border-brand-border pb-2">
                <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2 tracking-tight">
                  <CheckCircle2 className="w-5 h-5 text-success" /> Prescription
                </h2>
                <button onClick={()=>setMedicines([])} className="text-xs font-bold text-danger hover:underline">Clear All</button>
              </div>

              <div className="bg-white rounded-2xl flex-1 p-6 flex flex-col border border-brand-border shadow-sm">
                {/* Meds List */}
                <div className="space-y-4 mb-6">
                  {medicines.map((m, i) => (
                    <div key={i} className="group relative flex flex-col gap-3 p-4 rounded-xl border-2 border-brand-border bg-white hover:border-primary/40 transition-colors">
                      <div className="flex gap-3 items-center">
                        <input type="text" placeholder="Medicine Name (e.g., Paracetamol 500mg)" value={m.medicine} onChange={e => updateMed(i, 'medicine', e.target.value)} className="font-bold text-sm text-text-primary border-b border-brand-border focus:border-primary outline-none py-1 w-full bg-transparent" />
                        <button onClick={() => setMedicines(medicines.filter((_, idx)=>idx!==i))} className="text-text-muted hover:text-danger p-1 bg-brand-bg rounded-lg hover:bg-danger-light">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input type="text" placeholder="Dose (1-0-1)" value={m.dose} onChange={e => updateMed(i, 'dose', e.target.value)} className="text-xs font-medium border border-brand-border rounded-lg p-2 outline-none focus:border-primary bg-brand-bg" />
                        <div className="flex items-center gap-1 border border-brand-border rounded-lg p-2 bg-brand-bg focus-within:border-primary">
                          <input type="number" value={m.duration || ''} onChange={e => updateMed(i, 'duration', Number(e.target.value))} className="text-xs font-medium outline-none bg-transparent w-full" placeholder="Days" />
                          <span className="text-[10px] text-text-muted font-bold">DAYS</span>
                        </div>
                        <input type="text" placeholder="Notes (After meal)" value={m.notes} onChange={e => updateMed(i, 'notes', e.target.value)} className="text-xs font-medium border border-brand-border rounded-lg p-2 outline-none focus:border-primary bg-brand-bg" />
                      </div>
                    </div>
                  ))}
                  
                  {medicines.length === 0 && (
                    <div className="text-center py-6 text-text-muted font-medium text-sm bg-brand-bg/50 border border-dashed border-brand-border rounded-xl">
                      No medicines prescribed yet.
                    </div>
                  )}
                </div>

                {/* Add Med Button */}
                <button onClick={addMeds} className="w-full py-4 rounded-xl border-2 border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary-light transition-all flex items-center justify-center gap-2 text-sm font-extrabold shadow-sm mb-auto">
                  <Plus className="w-5 h-5" /> ADD MEDICINE
                </button>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-brand-border">
                  <button className="btn-outline py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <Printer className="w-4 h-4" /> Print PDF
                  </button>
                  <button onClick={saveConsultation} disabled={saving} className="btn-primary py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Complete Visit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ConsultationPanel() {
  return (
    <Suspense fallback={<div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ConsultationContent />
    </Suspense>
  )
}
