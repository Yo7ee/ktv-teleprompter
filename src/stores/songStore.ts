import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CachedSong } from '@/types/song'

interface SongStore {
  songs: CachedSong[]
  addSong: (song: CachedSong) => void
  removeSong: (id: number) => void
  hasSong: (id: number) => boolean
  clearAll: () => void
}

export const useSongStore = create<SongStore>()(
  persist(
    (set, get) => ({
      songs: [],
      addSong: (song) =>
        set((state) => ({
          songs: state.songs.some((s) => s.id === song.id)
            ? state.songs
            : [...state.songs, song],
        })),
      removeSong: (id) =>
        set((state) => ({ songs: state.songs.filter((s) => s.id !== id) })),
      hasSong: (id) => get().songs.some((s) => s.id === id),
      clearAll: () => set({ songs: [] }),
    }),
    { name: 'ktv-songs' },
  ),
)
