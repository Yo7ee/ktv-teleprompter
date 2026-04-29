import { create } from 'zustand'
import type { CachedSong } from '@/types/song'

interface PlayerStore {
  currentSong: CachedSong | null
  playing: boolean
  elapsed: number
  setCurrentSong: (song: CachedSong) => void
  setPlaying: (playing: boolean) => void
  setElapsed: (elapsed: number) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  currentSong: null,
  playing: false,
  elapsed: 0,
  setCurrentSong: (song) => set({ currentSong: song, elapsed: 0, playing: false }),
  setPlaying: (playing) => set({ playing }),
  setElapsed: (elapsed) => set({ elapsed }),
  reset: () => set({ playing: false, elapsed: 0 }),
}))
