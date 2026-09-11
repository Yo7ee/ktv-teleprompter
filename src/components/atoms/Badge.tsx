import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'cached' | 'default'
  className?: string
}

const variants = {
  cached: 'bg-app-accent-g/20 text-app-accent-g',
  default: 'bg-app-faint text-app-muted',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
