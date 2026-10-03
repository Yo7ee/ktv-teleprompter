import { useEffect, useRef } from 'react'

interface StepData {
  icon: React.ReactNode
  title: string
  body: string
}

interface OnboardingStepProps {
  step: StepData
}

export function OnboardingStep({ step }: OnboardingStepProps) {
  const headRef = useRef<HTMLHeadingElement>(null)
  // 只移焦點、不另外播報：焦點落在標題時螢幕閱讀器自然會念，再加 aria-live 會重複或互相打斷
  useEffect(() => {
    headRef.current?.focus()
  }, [step])

  return (
    <div className="flex flex-col items-center gap-5 px-7 text-center">
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
