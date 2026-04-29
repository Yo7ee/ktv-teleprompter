import type { ReactNode } from 'react'

interface SettingsGroupProps {
  title: string
  children: ReactNode
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section aria-label={title}>
      <p
        className="label-section mb-1.5 pl-1"
        aria-hidden="true"
      >
        {title}
      </p>
      <div className="bg-app-elev rounded-xl border border-app-rim [&>*:first-child]:rounded-t-xl [&>*:last-child]:rounded-b-xl">
        {children}
      </div>
    </section>
  )
}
