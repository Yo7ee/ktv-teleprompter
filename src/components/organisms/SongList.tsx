import { SongRow } from '@/components/molecules/SongRow'
import type { Song } from '@/types/song'

interface SongListProps {
  songs: Song[]
  query: string
  onSelect: (song: Song) => void
  onDelete?: (song: Song) => void
}

export function SongList({ songs, query, onSelect, onDelete }: SongListProps) {
  if (songs.length === 0) {
    return (
      <li className="text-center py-10 px-4">
        <p className="text-app-muted text-[13px]">
          {query ? `找不到「${query}」` : '尚無已快取歌曲'}
        </p>
        <p className="text-app-faint text-[11px] mt-1">前往「下載」頁面搜尋並快取歌詞</p>
      </li>
    )
  }

  return (
    <>
      {songs.map((s) => (
        <SongRow key={s.id} song={s} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </>
  )
}
