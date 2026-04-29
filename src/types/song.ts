export interface Song {
  id: number
  title: string
  artist: string
  duration: number
  albumArt: string
}

export interface LyricLine {
  time: number
  text: string
  type: 'lyric' | 'interlude'
}

export interface CachedSong extends Song {
  lyrics: LyricLine[]
  cachedAt: number
}
