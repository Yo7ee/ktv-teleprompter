import type { Song, LyricLine } from '@/types/song'

const BASE = 'https://lrclib.net/api'

interface LrclibTrack {
  id: number
  name: string
  artistName: string
  duration: number
  syncedLyrics: string | null
  plainLyrics: string | null
}

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = []
  for (const raw of lrc.split('\n')) {
    const match = raw.match(/^\[(\d+):(\d+\.\d+)\](.*)$/)
    if (!match) continue
    const time = parseInt(match[1]) * 60 + parseFloat(match[2])
    const text = match[3].trim()
    if (!text) continue
    const type = text.startsWith('♪') || text.startsWith('(') ? 'interlude' : 'lyric'
    lines.push({ time, text, type })
  }
  return lines
}

export async function searchSongs(query: string): Promise<Song[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  const data: LrclibTrack[] = await res.json()
  return data.slice(0, 20).map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artistName,
    duration: Math.round(t.duration),
    albumArt: '🎵',
  }))
}

export async function getLyrics(trackId: number): Promise<LyricLine[]> {
  const res = await fetch(`${BASE}/get/${trackId}`)
  if (!res.ok) throw new Error('Lyrics fetch failed')
  const data: LrclibTrack = await res.json()
  if (data.syncedLyrics) return parseLrc(data.syncedLyrics)
  if (data.plainLyrics) {
    return data.plainLyrics
      .split('\n')
      .filter(Boolean)
      .map((text, i) => ({ time: i * 4, text, type: 'lyric' as const }))
  }
  return []
}
