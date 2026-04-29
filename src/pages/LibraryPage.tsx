import { useState } from 'react'
import { useNavigate } from 'react-router'
import { WifiIcon } from '@heroicons/react/24/outline'
import { SearchBar } from '@/components/molecules/SearchBar'
import { SongList } from '@/components/organisms/SongList'
import { useSongStore } from '@/stores/songStore'
import { usePlayerStore } from '@/stores/playerStore'
import type { Song } from '@/types/song'

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const { songs, removeSong } = useSongStore()
  const { setCurrentSong } = usePlayerStore()
  const navigate = useNavigate()

  const filtered = query
    ? songs.filter((s) => s.title.includes(query) || s.artist.includes(query))
    : songs

  const handleSelect = (song: Song) => {
    const cached = songs.find((s) => s.id === song.id)
    if (!cached) return
    setCurrentSong(cached)
    navigate(`/player/${song.id}`)
  }

  return (
    <div className="page-root">
      <header className="px-5 pt-2.5 pb-2 border-b border-app-rim shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <h1 tabIndex={-1} className="page-title outline-none">KTV 提詞機</h1>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-app-muted bg-app-faint px-2 py-0.5 rounded-lg" aria-label="目前為離線模式">
              離線模式
            </span>
            <WifiIcon className="w-3.5 h-3.5 text-app-accent-a" aria-hidden="true" />
          </div>
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="篩選已快取歌曲…"
          label="篩選已快取歌曲"
          autoFocus
        />
      </header>

      <div className="px-5 pt-2.5 pb-1 shrink-0">
        <span className="label-section">
          已快取歌曲 ({filtered.length})
        </span>
      </div>

      <ul
        role="list"
        aria-label={`已快取 ${filtered.length} 首歌`}
        className="flex-1 overflow-y-auto list-none px-5"
      >
        <SongList songs={filtered} query={query} onSelect={handleSelect} onDelete={(s) => removeSong(s.id)} />
      </ul>

      <p className="text-center text-[10px] text-app-faint py-2 border-t border-app-rim shrink-0" aria-hidden="true">
        輕觸歌曲開始演唱
      </p>
    </div>
  )
}
