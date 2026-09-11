import { create } from 'zustand'

interface PlayerStore {
  playing: boolean
  elapsed: number
  setPlaying: (playing: boolean) => void
  setElapsed: (elapsed: number) => void
  reset: () => void
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  playing: false,
  elapsed: 0,
  setPlaying: (playing) => set({ playing }),
  setElapsed: (elapsed) => set({ elapsed }),
  reset: () => set({ playing: false, elapsed: 0 }),
}))
