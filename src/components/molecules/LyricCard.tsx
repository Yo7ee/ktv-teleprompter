import { cn } from '@/lib/utils'
import { FONT_SIZE_CLASS } from '@/lib/songPalette'
import type { LyricLine } from '@/types/song'

interface LyricCardProps {
  line: LyricLine
  role: 'current' | 'next' | 'prev'
  fontSize?: number
}

export function LyricCard({ line, role: cardRole, fontSize = 24 }: LyricCardProps) {
  const isInterlude = line.type === 'interlude'
  const isCurrent = cardRole === 'current'
  const isPrev = cardRole === 'prev'

  if (isPrev) {
    return (
      <p aria-hidden="true" className="text-app-faint text-sm text-center leading-relaxed">
        {line.text}
      </p>
    )
  }

  if (cardRole === 'next') {
    return (
      <div
        aria-hidden="true"
        className="w-full bg-app-elev border border-app-rim rounded-xl px-4 py-2 text-center"
      >
        <p className="text-[9px] text-app-faint mb-1 tracking-wider uppercase" aria-hidden="true">
          下一句
        </p>
        <p className="text-app-muted text-sm">{line.text}</p>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full rounded-2xl px-6 py-4 text-center transition-all duration-300 border',
        isInterlude
          ? 'bg-[oklch(0.20_0.12_30/0.45)] border-[oklch(0.5_0.18_30/0.4)]'
          : 'bg-[oklch(0.18_0.14_260/0.55)] border-[oklch(0.5_0.18_260/0.4)]',
      )}
    >
      <p
        className={cn(
          'font-bold leading-snug',
          isInterlude ? 'text-app-accent-a' : 'text-app-text',
          isCurrent && (FONT_SIZE_CLASS[fontSize] ?? 'text-2xl'),
          !isInterlude && 'lyric-glow',
        )}
      >
        {line.text}
      </p>
      <p className="text-[9px] text-app-faint mt-1.5 tracking-wider" aria-hidden="true">
        {isInterlude ? '間奏' : '當前歌詞'}
      </p>
    </div>
  )
}
