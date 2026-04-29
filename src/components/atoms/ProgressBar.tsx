import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  label: string
  onChange?: (value: number) => void
  className?: string
}

export function ProgressBar({ value, max, label, onChange, className }: ProgressBarProps) {
  if (onChange) {
    const pct = max > 0 ? (value / max) * 100 : 0
    return (
      <div className={cn('relative flex items-center h-5', className)}>
        <input
          type="range"
          min={0}
          max={max}
          step={0.5}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 h-full"
        />
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-app-elev)', border: '1px solid var(--color-app-rim)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, oklch(0.72 0.22 260), oklch(0.72 0.22 140))',
            }}
          />
        </div>
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[oklch(0.72_0.22_260)] shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    )
  }

  return (
    <progress
      value={value}
      max={max}
      aria-label={label}
      className={cn('app-progress', className)}
    />
  )
}
