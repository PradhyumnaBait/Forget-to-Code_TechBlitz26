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
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-brand-border z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map(step => {
          const done = step.id < currentStep
          const active = step.id === currentStep
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  done
                    ? 'bg-primary border-primary text-white'
                    : active
                    ? 'bg-white border-primary text-primary shadow-md'
                    : 'bg-white border-brand-border text-text-muted'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-xs font-medium ${
                  active ? 'text-primary' : done ? 'text-text-secondary' : 'text-text-muted'
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
