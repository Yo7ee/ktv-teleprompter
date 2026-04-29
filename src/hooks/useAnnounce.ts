import { useState, useCallback } from 'react'

export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('')

  const say = useCallback((text: string) => {
    // Clear first so the same text can be re-announced (e.g. after resync)
    setAnnouncement('')
    setTimeout(() => setAnnouncement(text), 50)
  }, [])

  return { say, announcement }
}
