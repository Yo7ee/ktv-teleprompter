import { cn } from '@/lib/utils'

interface StepDotsProps {
  total: number
  current: number
  onSelect: (index: number) => void
}

export function StepDots({ total, current, onSelect }: StepDotsProps) {
  return (
    <div role="tablist" aria-label="步驟進度" className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`第 ${i + 1} 步，共 ${total} 步`}
          onClick={() => onSelect(i)}
          className="rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <span
            className={cn(
              'block rounded-full transition-all duration-300 h-[7px]',
              i === current ? 'w-5 bg-app-accent' : 'w-[7px] bg-app-faint',
            )}
          />
        </button>
      ))}
    </div>
  )
}
