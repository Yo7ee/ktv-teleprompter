import { useEffect, useState } from 'react'
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
  const [filterMsg, setFilterMsg] = useState('')

  const filtered = query
    ? songs.filter((s) => s.title.includes(query) || s.artist.includes(query))
    : songs

  // 篩選時念出結果數量。等使用者停手 600ms 再念，避免每打一個字就打斷一次
  const filterCount = filtered.length
  useEffect(() => {
    const id = setTimeout(() => {
      setFilterMsg(!query ? '' : filterCount ? `找到 ${filterCount} 首` : `找不到「${query}」`)
    }, 600)
    return () => clearTimeout(id)
  }, [query, filterCount])

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
      <div aria-live="polite" aria-atomic="true" className="sr-only">{filterMsg}</div>
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

      {/* 數量只給視覺看；螢幕閱讀器由清單語意與篩選播報得知 */}
      <div className="px-5 pt-2.5 pb-1 shrink-0" aria-hidden="true">
        <span className="label-section">
          已下載 {filtered.length} 首歌詞
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <SongList songs={filtered} query={query} onSelect={handleSelect} onDelete={handleDelete} />
      </div>

      <p className="text-center text-[10px] text-app-faint py-2 border-t border-app-rim shrink-0" aria-hidden="true">
        輕觸歌詞開始提詞
      </p>
    </div>
  )
}
