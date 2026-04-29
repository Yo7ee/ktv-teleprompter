import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface LoadingStepProps {
  label: string
  state: 'pending' | 'active' | 'done'
}

export function LoadingStep({ label, state }: LoadingStepProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 transition-opacity duration-400',
        state === 'pending' ? 'opacity-30' : 'opacity-100',
      )}
    >
      <div
        className={cn(
          'w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-colors duration-400',
          state === 'done' && 'bg-app-accent-g',
          state === 'active' && 'bg-app-accent',
          state === 'pending' && 'bg-app-elev border border-app-rim',
        )}
        aria-hidden="true"
      >
        {state === 'done' ? (
          <CheckIcon className="w-2.5 h-2.5 text-white" />
        ) : (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full block',
              state === 'active' ? 'bg-white' : 'bg-app-faint',
            )}
          />
        )}
      </div>
      <span
        className={cn(
          'text-[13px] transition-colors duration-400',
          state === 'done' && 'text-app-muted font-normal',
          state === 'active' && 'text-app-text font-semibold',
          state === 'pending' && 'text-app-faint font-normal',
        )}
      >
        {label}
      </span>
    </div>
  )
}
