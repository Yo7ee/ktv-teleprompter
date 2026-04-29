import { useEffect, useRef } from 'react'
import { useAnnounce } from '@/hooks/useAnnounce'

interface StepData {
  icon: React.ReactNode
  title: string
  body: string
  aria: string
}

interface OnboardingStepProps {
  step: StepData
}

export function OnboardingStep({ step }: OnboardingStepProps) {
  const headRef = useRef<HTMLHeadingElement>(null)
  const { say, announcement } = useAnnounce()

  useEffect(() => {
    headRef.current?.focus()
    say(step.aria)
  }, [step, say])

  return (
    <div className="flex flex-col items-center gap-5 px-7 text-center">
      <div aria-live="assertive" aria-atomic="true" className="sr-only">{announcement}</div>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center icon-circle-accent"
        aria-hidden="true"
      >
        {step.icon}
      </div>
      <div>
        <h1
          ref={headRef}
          tabIndex={-1}
          className="text-app-text text-xl font-bold leading-snug mb-3 whitespace-pre-line outline-none"
        >
          {step.title}
        </h1>
        <p className="text-app-muted text-[13px] leading-relaxed">{step.body}</p>
      </div>
    </div>
  )
}
