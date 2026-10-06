import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import {
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/library', label: '歌詞清單', Icon: MusicalNoteIcon },
  { to: '/download', label: '下載', Icon: ArrowDownTrayIcon },
  { to: '/settings', label: '設定', Icon: Cog6ToothIcon },
]

export function TabLayout() {
  const location = useLocation()
  const navigate = useNavigate()
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

      {/* 比照 iOS 原生分頁列：念「歌詞清單，分頁標籤，已選取，1/3」。
          不用連結，因為 Safari 會讓 VoiceOver 念成「已瀏覽連結」 */}
      <nav
        role="tablist"
        aria-label="主要導覽"
        className="shrink-0 flex bg-app-surface border-t border-app-rim"
      >
        {TABS.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to
          return (
            <button
              key={to}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => navigate(to)}
              aria-label={label}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[44px]',
                isActive ? 'text-app-accent' : 'text-app-faint',
              )}
            >
              <span aria-hidden="true" className="contents">
                <Icon className="w-5 h-5" />
                <span className={cn('text-[9px]', isActive ? 'font-bold' : 'font-normal')}>
                  {label}
                </span>
              </span>
            </button>
          )
        })}
      </nav>
      <div className="shrink-0 bg-app-surface h-safe-bottom" />
    </div>
  )
}
