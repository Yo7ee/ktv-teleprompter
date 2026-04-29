import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
  trailing?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = '返回',
  trailing,
}: PageHeaderProps) {
  return (
    <header className="flex items-center px-4 py-2.5 border-b border-app-rim shrink-0">
      {onBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          aria-label={backLabel}
          className="flex items-center min-w-[44px] min-h-[44px] pr-2 text-app-text"
        >
          <ChevronLeftIcon className="w-5 h-5 stroke-2" aria-hidden="true" />
        </Button>
      ) : (
        <div className="w-[44px]" />
      )}

      <div className="flex-1 text-center">
        <h1 tabIndex={-1} className="text-app-text text-sm font-bold leading-tight outline-none">{title}</h1>
        {subtitle && <p className="text-app-muted text-[11px]">{subtitle}</p>}
      </div>

      <div className="min-w-[44px] flex justify-end">{trailing}</div>
    </header>
  )
}
