export interface Settings {
  tts: boolean
  advance: number
  haptic: boolean
  hapticBeat: boolean
  fontSize: number
}

export const DEFAULT_SETTINGS: Settings = {
  tts: true,
  advance: 3,
  haptic: true,
  hapticBeat: false,
  fontSize: 24,
}
