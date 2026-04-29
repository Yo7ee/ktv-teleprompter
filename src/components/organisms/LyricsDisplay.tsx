import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { LyricCard } from '@/components/molecules/LyricCard'
import { FONT_SIZE_CLASS } from '@/lib/songPalette'
import type { LyricLine } from '@/types/song'

interface LyricsDisplayProps {
  curLine: LyricLine | undefined
  nextLine: LyricLine | undefined
  prevLine: LyricLine | undefined
  fontSize: number
}

export function LyricsDisplay({ curLine, nextLine, prevLine, fontSize }: LyricsDisplayProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={regionRef}
      className="flex-1 flex flex-col items-center justify-center px-4 gap-3.5 relative outline-none"
      tabIndex={-1}
    >
      {prevLine && <LyricCard line={prevLine} role="prev" />}

      {curLine ? (
        <LyricCard line={curLine} role="current" fontSize={fontSize} />
      ) : (
        <div className="w-full bg-[oklch(0.18_0.14_260/0.55)] border border-[oklch(0.5_0.18_260/0.4)] rounded-2xl px-6 py-4 text-center">
          <p className={cn('text-app-text font-bold', FONT_SIZE_CLASS[fontSize] ?? 'text-2xl')}>—</p>
        </div>
      )}

      {nextLine && <LyricCard line={nextLine} role="next" />}
    </div>
  )
}
