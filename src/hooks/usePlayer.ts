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
  waitingIdx: number
  togglePlay: () => void
  seekLine: (idx: number) => void
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
  // 碼表的時間原點（Date.now 毫秒）：elapsed = (現在 - 原點) / 1000。
  // 用牆上時鐘換算而不是每個 tick 累加，計時器被延遲或暫停（鎖螢幕、切背景）也不會漂移。
  const originRef = useRef(0)

  const [hapticActive, setHapticActive] = useState(false)

  const lyrics = song.lyrics

  const curIdx = lyrics.reduce((acc, l, i) => (elapsed >= l.time ? i : acc), 0)
  const curLine = lyrics[curIdx]
  const nextLine = lyrics[curIdx + 1]
  const prevLine = curIdx > 0 ? lyrics[curIdx - 1] : undefined
  // 碼表正在等的那一句（還沒開唱），也就是按校正時會對齊的錨點。全部唱完時停在最後一句
  const nextIdx = lyrics.findIndex((l) => l.time > elapsed)
  const waitingIdx = nextIdx === -1 ? lyrics.length - 1 : nextIdx

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
    // LRC 的間奏標記多半是 ♪♪♪ 或 (間奏)，螢幕閱讀器可能直接跳過，統一念固定文案
    say(line.type === 'interlude' ? '間奏' : line.text)

    if (line.type === 'interlude' && haptic) {
      vibrate([120, 60, 120])
      setHapticActive(true)
      setTimeout(() => setHapticActive(false), 700)
    }
  }, [elapsed, playing, settings, lyrics, say, vibrate])

  // 跳到指定秒數，並同步移動時間原點，讓計時器從新位置接著算
  const jumpTo = useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(t, song.duration))
    originRef.current = Date.now() - clamped * 1000
    setElapsed(clamped)
  }, [setElapsed, song.duration])

  // Timer loop
  useEffect(() => {
    if (playing) {
      // 開始或續播：以目前的 elapsed 回推原點，暫停期間的時間不算進去
      originRef.current = Date.now() - usePlayerStore.getState().elapsed * 1000
      timerRef.current = setInterval(() => {
        const now = (Date.now() - originRef.current) / 1000
        if (now >= song.duration) {
          setElapsed(song.duration)
          setPlaying(false)
        } else {
          setElapsed(now)
        }
      }, 250)
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
    jumpTo(anchor.time)
    if (settings.haptic) vibrate(40)
    say(`已校正，快轉 ${Number.isInteger(drift) ? drift : drift.toFixed(1)} 秒`)
  }, [lyrics, jumpTo, say, settings.haptic, vibrate])

  // 以句為單位跳轉：把碼表放在這一句的提詞時間點，讓它馬上被念出來，
  // 同時成為「正在等的那一句」，使用者聽到它開唱時按校正就能對齊。
  // 下限取上一句的開唱時間，避免 advance 大於句距時碼表退回上一句、等待目標跟著變。
  const seekLine = useCallback((idx: number) => {
    const line = lyrics[idx]
    if (!line) return
    const floor = idx > 0 ? lyrics[idx - 1].time : 0
    spokenRef.current = {}
    jumpTo(Math.max(floor, line.time - settings.advance))
  }, [lyrics, jumpTo, settings.advance])

  return {
    playing,
    elapsed,
    curLine,
    nextLine,
    prevLine,
    curIdx,
    waitingIdx,
    togglePlay,
    seekLine,
    calibrate,
    announcement,
    hapticActive,
  }
}
