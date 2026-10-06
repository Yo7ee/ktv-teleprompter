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
      // 空狀態放在清單外，否則螢幕閱讀器會念成「清單，1 個項目」
      <div className="text-center py-10 px-4">
        <p className="text-app-muted text-[13px]">
          {query ? `找不到「${query}」` : '尚無已下載歌詞'}
        </p>
        <p className="text-app-faint text-[11px] mt-1">前往「下載」頁面搜尋並下載歌詞</p>
      </div>
    )
  }

  return (
    <ul role="list" className="list-none">
      {songs.map((s) => (
        <SongRow key={s.id} song={s} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </ul>
  )
}
