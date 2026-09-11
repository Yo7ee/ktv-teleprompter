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
  return data
    .filter((t) => Boolean(t.syncedLyrics))
    .slice(0, 20)
    .map((t) => ({
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
  // searchSongs 已濾掉沒有時間軸的曲目，但這是另一次請求（且回應會被 SW 快取
  // 30 天），仍可能拿到 null。這個判斷同時也是 parseLrc 需要的型別收窄。
  if (!data.syncedLyrics) throw new Error('No synced lyrics for this track')
  return parseLrc(data.syncedLyrics)
}
