// navigator.vibrate is not supported on iOS Safari.
// isSupported lets callers show a visual fallback instead.
const isSupported =
  typeof navigator !== 'undefined' && 'vibrate' in navigator

export function useHaptic() {
  const vibrate = (pattern: number | number[]) => {
    if (!isSupported) return false
    navigator.vibrate(pattern)
    return true
  }

  return { vibrate, isSupported }
}
