import { Check } from 'lucide-react'

const steps = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Verify OTP' },
  { id: 3, label: 'Date' },
  { id: 4, label: 'Slot' },
  { id: 5, label: 'Confirm' },
]

interface StepProgressBarProps {
  currentStep: number
}

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line — background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-brand-border z-0" />
        {/* Connector line — completed */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 z-0 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map(step => {
          const done = step.id < currentStep
          const active = step.id === currentStep
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all duration-300 ease-out ${
                  done
                    ? 'w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-sm'
                    : active
                    ? 'w-10 h-10 bg-white border-blue-500 text-blue-600 shadow-md ring-4 ring-blue-100'
                    : 'w-8 h-8 bg-white border-brand-border text-text-muted'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-xs transition-colors duration-200 ${
                  active ? 'text-blue-600 font-semibold' : done ? 'text-text-secondary font-medium' : 'text-text-muted font-medium'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
