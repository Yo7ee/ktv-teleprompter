import { useState } from 'react'
import { useNavigate } from 'react-router'
import { SearchBar } from '@/components/molecules/SearchBar'
import { SongList } from '@/components/organisms/SongList'
import { useSongStore } from '@/stores/songStore'
import { useAnnounce } from '@/hooks/useAnnounce'
import type { Song } from '@/types/song'

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const { songs, removeSong } = useSongStore()
  const navigate = useNavigate()
  const { say, announcement } = useAnnounce()

  const filtered = query
    ? songs.filter((s) => s.title.includes(query) || s.artist.includes(query))
    : songs

  const handleSelect = (song: Song) => {
    navigate(`/player/${song.id}`)
  }

  const handleDelete = (song: Song) => {
    removeSong(song.id)
    say(`已刪除 ${song.title}`)
  }

  return (
    <div className="page-root">
      <div aria-live="assertive" aria-atomic="true" className="sr-only">{announcement}</div>
      <header className="px-5 pt-2.5 pb-2 border-b border-app-rim shrink-0">
        <h1 tabIndex={-1} className="page-title outline-none mb-2.5">歌詞清單</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="搜尋已下載的歌名或歌手…"
          label="搜尋已下載歌詞"
          autoFocus
        />
      </header>

      <div className="px-5 pt-2.5 pb-1 shrink-0">
        <span className="label-section">
          已下載 {filtered.length} 首歌詞
        </span>
      </div>

      <ul
        role="list"
        aria-label={`已下載 ${filtered.length} 首歌詞`}
        className="flex-1 overflow-y-auto list-none px-5"
      >
        <SongList songs={filtered} query={query} onSelect={handleSelect} onDelete={handleDelete} />
      </ul>

      <p className="text-center text-[10px] text-app-faint py-2 border-t border-app-rim shrink-0" aria-hidden="true">
        輕觸歌詞開始提詞
      </p>
    </div>
  )
}
