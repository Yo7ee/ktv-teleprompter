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
  calibrate: () => void
  announcement: string
  hapticActive: boolean
}

export function usePlayer(song: CachedSong, settings: Settings): UsePlayerReturn {
  const { playing, elapsed, setPlaying, setElapsed } = usePlayerStore()
  const { say, announcement } = useAnnounce()
  const { vibrate } = useHaptic()

  const spokenRef = useRef<Record<number, boolean>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [hapticActive, setHapticActive] = useState(false)

  const lyrics = song.lyrics

  const curIdx = lyrics.reduce((acc, l, i) => (elapsed >= l.time ? i : acc), 0)
  const curLine = lyrics[curIdx]
  const nextLine = lyrics[curIdx + 1]
  const prevLine = curIdx > 0 ? lyrics[curIdx - 1] : undefined

  // Announce + haptic trigger on each tick
  useEffect(() => {
    if (!playing) return
    const { advance, haptic } = settings

    // 找出第一句「已到提詞時間、但還沒開唱」且尚未播報的歌詞。
    // 用區間 [time - advance, time) 而不是觸發點後的固定視窗：advance 大於句距時
    // 校正跳轉才不會整句漏掉，也不再綁死在 500ms 的 tick 上。
    // 一次只播一句，避免多句擠進同一個 aria-live 區塊互相蓋掉。
    const idx = lyrics.findIndex(
      (line, i) =>
        !spokenRef.current[i] && elapsed >= line.time - advance && elapsed < line.time,
    )
    if (idx === -1) return

    const line = lyrics[idx]
    spokenRef.current[idx] = true
    say(line.text)

    if (line.type === 'interlude' && haptic) {
      vibrate([120, 60, 120])
      setHapticActive(true)
      setTimeout(() => setHapticActive(false), 700)
    }
  }, [elapsed, playing, settings, lyrics, say, vibrate])

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
    say(next ? '開始' : '暫停')
  }, [playing, setPlaying, say])

  // 使用者在聽到某句歌詞開唱的瞬間按下校正。那一刻音樂的真實位置，就是 App 還沒
  // 走到、正等著提詞的「下一句」的 time，所以直接把計時器推到那裡。之後每一句的
  // 提詞時間等於整批往前平移了 drift 秒，而 advance 的提前量原封不動保留下來。
  const calibrate = useCallback(() => {
    const now = usePlayerStore.getState().elapsed
    const anchor = lyrics.find((l) => l.time > now)
    if (!anchor) {
      say('已經沒有後續歌詞可校正')
      return
    }

    const drift = anchor.time - now
    spokenRef.current = {}
    setElapsed(Math.min(anchor.time, song.duration))
    if (settings.haptic) vibrate(40)
    say(`已校正，快轉 ${Number.isInteger(drift) ? drift : drift.toFixed(1)} 秒`)
  }, [lyrics, setElapsed, song.duration, say, settings.haptic, vibrate])

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
    calibrate,
    announcement,
    hapticActive,
  }
}
