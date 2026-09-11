// navigator.vibrate is not supported on iOS Safari, where vibrate() no-ops.
const isSupported =
  typeof navigator !== 'undefined' && 'vibrate' in navigator

export function useHaptic() {
  const vibrate = (pattern: number | number[]) => {
    if (!isSupported) return false
    navigator.vibrate(pattern)
    return true
  }

  return { vibrate }
}
