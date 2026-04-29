import { useEffect, useRef, useCallback, useState } from 'react'
import type { CachedSong, LyricLine } from '@/types/song'
import type { Settings } from '@/types/settings'
import { usePlayerStore } from '@/stores/playerStore'
import { useAnnounce } from './useAnnounce'
import { useHaptic } from './useHaptic'

interface UsePlayerReturn {
  playing: boolean
  elapsed: number
  curLine: LyricLine | undefined
  nextLine: LyricLine | undefined
  prevLine: LyricLine | undefined
  curIdx: number
  togglePlay: () => void
  seek: (t: number) => void
  reset: () => void
  ttsActive: boolean
  announcedText: string
  announcement: string
  hapticActive: boolean
}

export function usePlayer(song: CachedSong, settings: Settings): UsePlayerReturn {
  const { playing, elapsed, setPlaying, setElapsed, reset: storeReset } = usePlayerStore()
  const { say, announcement } = useAnnounce()
  const { vibrate, isSupported: hapticSupported } = useHaptic()

  const spokenRef = useRef<Record<number, boolean>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [ttsActive, setTtsActive] = useState(false)
  const [announcedText, setAnnouncedText] = useState('')
  const [hapticActive, setHapticActive] = useState(false)

  const lyrics = song.lyrics

  const curIdx = lyrics.reduce((acc, l, i) => (elapsed >= l.time ? i : acc), 0)
  const curLine = lyrics[curIdx]
  const nextLine = lyrics[curIdx + 1]
  const prevLine = curIdx > 0 ? lyrics[curIdx - 1] : undefined

  // Announce + haptic trigger on each tick
  useEffect(() => {
    if (!playing) return
    const { advance, tts, haptic } = settings

    lyrics.forEach((line, i) => {
      const triggerAt = line.time - advance
      if (
        elapsed >= triggerAt &&
        elapsed < triggerAt + 0.5 &&
        !spokenRef.current[i]
      ) {
        spokenRef.current[i] = true

        if (tts) {
          say(line.text)
          setAnnouncedText(line.text)
          setTtsActive(true)
          setTimeout(() => { setTtsActive(false); setAnnouncedText('') }, 2200)
        }

        if (line.type === 'interlude' && haptic) {
          vibrate([120, 60, 120])
          setHapticActive(true)
          setTimeout(() => setHapticActive(false), 700)
        }
      }
    })
  }, [elapsed, playing, settings, lyrics, say, vibrate, hapticSupported])

  // Timer loop
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        const { elapsed: prev } = usePlayerStore.getState()
        if (prev >= song.duration) {
          setPlaying(false)
        } else {
          setElapsed(prev + 0.5)
        }
      }, 500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing, song.duration, setElapsed, setPlaying])

  const togglePlay = useCallback(() => {
    const next = !playing
    setPlaying(next)
    if (next) spokenRef.current = {}
    if (settings.tts) say(next ? '開始' : '暫停')
  }, [playing, setPlaying, settings, say])

  const reset = useCallback(() => {
    storeReset()
    spokenRef.current = {}
    if (settings.tts) say('重置')
  }, [storeReset, settings, say])

  const seek = useCallback((t: number) => {
    spokenRef.current = {}
    setElapsed(Math.max(0, Math.min(t, song.duration)))
  }, [setElapsed, song.duration])

  return {
    playing,
    elapsed,
    curLine,
    nextLine,
    prevLine,
    curIdx,
    togglePlay,
    seek,
    reset,
    ttsActive,
    announcedText,
    announcement,
    hapticActive,
  }
}
