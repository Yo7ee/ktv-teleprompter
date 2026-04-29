import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/library', label: '歌曲', Icon: MusicalNoteIcon },
  { to: '/download', label: '下載', Icon: ArrowDownTrayIcon },
  { to: '/settings', label: '設定', Icon: Cog6ToothIcon },
]

export function TabLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Wait one frame for the new page to render, then focus its h1
    const id = setTimeout(() => {
      const h1 = mainRef.current?.querySelector<HTMLElement>('h1')
      h1?.focus()
    }, 50)
    return () => clearTimeout(id)
  }, [location.pathname])

  return (
    <div className="flex flex-col h-full">
      <main ref={mainRef} className="flex-1 overflow-hidden"><Outlet /></main>

      <nav
        role="tablist"
        aria-label="主要導覽"
        className="shrink-0 flex bg-app-surface border-t border-app-rim"
      >
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            role="tab"
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[44px]',
                isActive ? 'text-app-accent' : 'text-app-faint',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className={cn('text-[9px]', isActive ? 'font-bold' : 'font-normal')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 bg-app-surface h-safe-bottom" />
    </div>
  )
}
