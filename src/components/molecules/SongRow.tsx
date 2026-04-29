import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/atoms/Badge'
import { TrashIcon } from '@heroicons/react/24/outline'
import { songArtClass } from '@/lib/songPalette'
import type { Song } from '@/types/song'

interface SongRowProps {
  song: Song
  onSelect: (song: Song) => void
  onDelete?: (song: Song) => void
}

export function SongRow({ song, onSelect, onDelete }: SongRowProps) {
  const [pressed, setPressed] = useState(false)

  return (
    <li role="listitem" className="flex items-center border-b border-app-rim">
      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => { setPressed(false); onSelect(song) }}
        onPointerLeave={() => setPressed(false)}
        onClick={() => onSelect(song)}
        aria-label={`${song.title}，${song.artist}，已快取，點擊開始演唱`}
        className={cn(
          'flex items-center gap-3 py-3 flex-1 min-w-0 text-left transition-colors duration-100 min-h-[56px]',
          pressed ? 'bg-app-elev' : 'bg-transparent',
        )}
      >
        <div
          className={cn(
            'w-11 h-11 rounded-lg shrink-0 flex items-center justify-center text-xl',
            songArtClass(song.id),
          )}
          aria-hidden="true"
        >
          {song.albumArt || '🎵'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-app-text text-sm font-semibold truncate">{song.title}</p>
          <p className="song-meta">{song.artist}</p>
        </div>
        <Badge variant="offline">離線</Badge>
      </button>

      {onDelete && (
        <button
          onClick={() => onDelete(song)}
          aria-label={`刪除 ${song.title}`}
          className="shrink-0 p-2.5 ml-1 text-app-faint hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <TrashIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </li>
  )
}
