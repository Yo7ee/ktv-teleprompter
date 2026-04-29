import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatusPillProps {
  icon: ReactNode
  label: string
  activeLabel?: string
  active: boolean
  accentClass?: string
  activeBgClass?: string
  activeBorderClass?: string
}

export function StatusPill({
  icon,
  label,
  activeLabel,
  active,
  accentClass = 'text-app-accent',
  activeBgClass = 'bg-[oklch(0.28_0.14_260/0.5)]',
  activeBorderClass = 'border-[oklch(0.55_0.2_260/0.5)]',
}: StatusPillProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-center gap-1.5 flex-1 rounded-lg px-2.5 py-1.5 border transition-all duration-200',
        active
          ? cn(activeBgClass, activeBorderClass)
          : 'bg-app-elev border-app-rim',
      )}
    >
      <span className={cn('shrink-0', active ? accentClass : 'text-app-faint')} aria-hidden="true">
        {icon}
      </span>
      <span
        className={cn(
          'text-[10px] font-semibold flex-1 truncate',
          active ? accentClass : 'text-app-faint',
        )}
      >
        {active && activeLabel ? activeLabel : label}
      </span>
      {/* Screen reader announcement */}
      <span className="sr-only">
        {active && activeLabel ? activeLabel : label}
      </span>
    </div>
  )
}
