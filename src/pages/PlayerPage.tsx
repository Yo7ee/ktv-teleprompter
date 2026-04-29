import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { songArtClass, songGlowClass } from '@/lib/songPalette'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { LyricsDisplay } from '@/components/organisms/LyricsDisplay'
import { PlayerControls } from '@/components/organisms/PlayerControls'
import { StatusPill } from '@/components/molecules/StatusPill'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Spinner } from '@/components/atoms/Spinner'
import { PageHeader } from '@/components/templates/PageHeader'
import { LoadingStep } from '@/components/molecules/LoadingStep'
import { usePlayer } from '@/hooks/usePlayer'
import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'

type Phase = 'loading' | 'ready'

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const LOADING_STEPS = ['讀取離線快取…', '解析歌詞時間軸…', '準備語音提示…']

export function PlayerPage() {
  const navigate = useNavigate()
  const { currentSong } = usePlayerStore()
  const { settings } = useSettingsStore()

  const [phase, setPhase] = useState<Phase>('loading')
  const [loadPhase, setLoadPhase] = useState(0)
  const mainRef = useRef<HTMLDivElement>(null)

  // Simulate loading steps then transition to ready
  useEffect(() => {
    if (!currentSong) return
    const iv = setInterval(
      () => setLoadPhase((p) => Math.min(p + 1, LOADING_STEPS.length - 1)),
      550,
    )
    const t = setTimeout(() => {
      clearInterval(iv)
      setPhase('ready')
      setTimeout(() => mainRef.current?.focus(), 50)
    }, 1800)
    return () => { clearInterval(iv); clearTimeout(t) }
  }, [currentSong])

  const player = usePlayer(currentSong!, settings)


  if (!currentSong) {
    navigate('/library', { replace: true })
    return null
  }

  const nextSec = player.nextLine
    ? Math.max(0, Math.ceil(player.nextLine.time - player.elapsed))
    : 0

  // Loading screen
  if (phase === 'loading') {
    return (
      <div
        className="page-root items-center justify-center gap-6 px-7"
        role="status"
        aria-label={`正在載入 ${currentSong.title}`}
        aria-live="polite"
      >
        <div
          className={cn(
            'w-[88px] h-[88px] rounded-[18px] flex items-center justify-center text-4xl',
            songArtClass(currentSong.id),
            songGlowClass(currentSong.id),
          )}
          aria-hidden="true"
        >
          {currentSong.albumArt}
        </div>
        <div className="text-center">
          <p className="page-title mb-1">{currentSong.title}</p>
          <p className="text-app-muted text-xs">{currentSong.artist}</p>
        </div>
        <Spinner />
        <div className="flex flex-col gap-2.5 w-full">
          {LOADING_STEPS.map((s, i) => (
            <LoadingStep
              key={s}
              label={s}
              state={i < loadPhase ? 'done' : i === loadPhase ? 'active' : 'pending'}
            />
          ))}
        </div>
        <div className="bg-app-elev border border-app-rim rounded-lg px-3.5 py-1.5">
          <span className="text-[10px] text-app-faint">📦 離線快取 · 無需網路</span>
        </div>
      </div>
    )
  }

  // Player screen
  return (
    <div
      className="page-root"
    >
      <div aria-live="assertive" aria-atomic="true" className="sr-only">{player.announcement}</div>
      <PageHeader
        title={currentSong.title}
        subtitle={currentSong.artist}
        onBack={() => navigate('/library')}
        backLabel="返回歌曲列表"
      />

      {/* Status indicators */}
      {player.hapticActive && (
        <div className="flex gap-1.5 px-5 py-1.5 border-b border-app-rim shrink-0" aria-hidden="true">
          <StatusPill
            icon={<DevicePhoneMobileIcon className="w-3 h-3" />}
            label="震動"
            activeLabel="震動!"
            active={player.hapticActive}
            accentClass="text-app-accent-a"
            activeBgClass="bg-[oklch(0.28_0.14_30/0.5)]"
            activeBorderClass="border-[oklch(0.55_0.2_30/0.5)]"
          />
        </div>
      )}

      {/* Lyrics */}
      <div ref={mainRef} tabIndex={-1} className="flex-1 overflow-hidden outline-none flex flex-col">
        <LyricsDisplay
          curLine={player.curLine}
          nextLine={player.nextLine
            ? { ...player.nextLine, text: `${player.nextLine.text}（${nextSec}s）` }
            : undefined}
          prevLine={player.prevLine}
          fontSize={settings.fontSize}
        />
      </div>

      {/* Progress */}
      <div className="px-5 pb-1.5 shrink-0">
        <ProgressBar
          value={player.elapsed}
          max={currentSong.duration}
          label={`播放進度 ${fmt(player.elapsed)} 共 ${fmt(currentSong.duration)}`}
          onChange={player.seek}
        />
        <div className="flex justify-between mt-1" aria-hidden="true">
          <span className="text-[10px] text-app-faint">{fmt(player.elapsed)}</span>
          <span className="text-[10px] text-app-faint">{fmt(currentSong.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <PlayerControls
        playing={player.playing}
        onTogglePlay={player.togglePlay}
        onReset={player.reset}
      />
    </div>
  )
}
