import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  value?: string
  children: ReactNode
  htmlFor?: string
  stacked?: boolean
}

export function SettingRow({ label, description, value, children, htmlFor, stacked }: SettingRowProps) {
  if (stacked) {
    return (
      <div className="px-5 pt-4 pb-5 border-b border-app-rim last:border-0">
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-app-text text-[13px] font-medium">{label}</p>
          {value && (
            <span className="text-[12px] font-bold tabular-nums text-app-accent">{value}</span>
          )}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-app-rim last:border-0 min-h-[58px]">
      <div className="flex-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-app-text text-[13px] font-medium cursor-pointer">
            {label}
          </label>
        ) : (
          <p className="text-app-text text-[13px] font-medium">{label}</p>
        )}
        {description && (
          <p className="text-app-faint text-[10px] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
