import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { Settings } from '@/types/settings'

interface SettingsStore {
  settings: Settings
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'ktv-settings',
      merge: (persisted, current) => {
        const saved = (persisted as SettingsStore).settings ?? {}
        const sanitize = <T>(v: T, fallback: T): T =>
          (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) ? fallback : v
        return {
          ...current,
          settings: {
            tts:       sanitize(saved.tts,       DEFAULT_SETTINGS.tts),
            advance:   sanitize(saved.advance,   DEFAULT_SETTINGS.advance),
            haptic:    sanitize(saved.haptic,    DEFAULT_SETTINGS.haptic),
            hapticBeat:sanitize(saved.hapticBeat,DEFAULT_SETTINGS.hapticBeat),
            fontSize:  sanitize(saved.fontSize,  DEFAULT_SETTINGS.fontSize),
          },
        }
      },
    },
  ),
)
