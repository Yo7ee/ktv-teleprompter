export const FONT_SIZE_CLASS: Record<number, string> = {
  16: 'text-base',
  18: 'text-lg',
  20: 'text-xl',
  22: 'text-[22px]',
  24: 'text-2xl',
  26: 'text-[26px]',
  28: 'text-[28px]',
  30: 'text-3xl',
  32: 'text-[32px]',
}

const ART_CLASSES = [
  'song-art-0', 'song-art-1', 'song-art-2',
  'song-art-3', 'song-art-4', 'song-art-5',
]
const GLOW_CLASSES = [
  'song-glow-0', 'song-glow-1', 'song-glow-2',
  'song-glow-3', 'song-glow-4', 'song-glow-5',
]

export const songArtClass = (id: number) => ART_CLASSES[id % ART_CLASSES.length]
export const songGlowClass = (id: number) => GLOW_CLASSES[id % GLOW_CLASSES.length]
