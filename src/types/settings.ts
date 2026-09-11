export interface Settings {
  advance: number
  haptic: boolean
  hapticBeat: boolean
  fontSize: number
}

export const DEFAULT_SETTINGS: Settings = {
  advance: 5,
  haptic: true,
  hapticBeat: false,
  fontSize: 24,
}
