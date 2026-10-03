import { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/molecules/SearchBar'
import { Spinner } from '@/components/atoms/Spinner'
import { DownloadResultList } from '@/components/organisms/DownloadResultList'
import { searchSongs, getLyrics } from '@/services/lrclibApi'
import { useSongStore } from '@/stores/songStore'
import { useAnnounce } from '@/hooks/useAnnounce'
import type { Song } from '@/types/song'

export function DownloadPage() {
  const [query, setQuery] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({})
  const { songs, addSong, hasSong } = useSongStore()
  const { say, announcement } = useAnnounce()

  const cachedIds = new Set(songs.map((s) => s.id))

  const handleSearch = async () => {
    const q = query.trim()
    if (!q || searching) return
    setSearchedQuery(q)
    setQuery('')
    setSearching(true)
    setSearched(false)
    say('正在查詢歌詞')
    try {
      const data = await searchSongs(q)
      setResults(data)
      say(data.length ? `找到 ${data.length} 首歌詞` : `找不到「${q}」的歌詞`)
    } catch {
      setResults([])
      say('查詢失敗，請檢查網路後再試')
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  const handleDownload = async (song: Song) => {
    if (hasSong(song.id) || downloadProgress[song.id] !== undefined) return
    setDownloadProgress((p) => ({ ...p, [song.id]: 0 }))
    say(`正在下載 ${song.title}`)
    try {
      const lyrics = await getLyrics(song.id)
      for (let p = 10; p <= 90; p += 20) {
        await new Promise((r) => setTimeout(r, 200))
        setDownloadProgress((prev) => ({ ...prev, [song.id]: p }))
      }
      addSong({ ...song, lyrics, cachedAt: Date.now() })
      setDownloadProgress((prev) => ({ ...prev, [song.id]: 100 }))
      say(`${song.title} 下載完成`)
      setTimeout(() => {
        setDownloadProgress((prev) => {
          const next = { ...prev }
          delete next[song.id]
          return next
        })
      }, 600)
    } catch {
      say(`${song.title} 下載失敗`)
      setDownloadProgress((prev) => {
        const next = { ...prev }
        delete next[song.id]
        return next
      })
    }
  }

  return (
    <div className="page-root">
      <div aria-live="assertive" aria-atomic="true" className="sr-only">{announcement}</div>
      <header className="px-5 pt-2.5 pb-2 border-b border-app-rim shrink-0">
        <h1 tabIndex={-1} className="page-title mb-2.5 outline-none">下載歌詞</h1>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              placeholder="搜尋歌曲名稱或歌手…"
              label="搜尋歌名或歌手"
            />
          </div>
          <Button
            onClick={handleSearch}
            aria-label="搜尋"
            className="bg-app-accent text-white text-[13px] font-bold px-4 rounded-xl min-h-[44px]"
          >
            {searching ? '…' : '搜尋'}
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-app-accent-g" aria-hidden="true" />
          <span className="text-[10px] text-app-faint">開源歌詞資料庫</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!searched && !searching && (
          <div className="flex flex-col items-center justify-center h-full gap-3.5 px-7 py-12">
            <ArrowDownTrayIcon className="w-10 h-10 text-app-faint" aria-hidden="true" />
            <p className="text-[13px] text-app-muted text-center leading-relaxed">
              輸入歌名或歌手搜尋
            </p>
          </div>
        )}

        {searching && (
          <div className="flex flex-col items-center justify-center h-full gap-3.5">
            <Spinner label="正在查詢歌詞" />
            <p className="text-app-muted text-[13px]" aria-hidden="true">正在查詢歌詞</p>
          </div>
        )}

        {searched && !searching && (
          <>
            <div className="px-5 pt-2.5 pb-1">
              <span className="label-section">
                找到 {results.length} 首歌詞
              </span>
            </div>
            <DownloadResultList
              results={results}
              cachedIds={cachedIds}
              downloadProgress={downloadProgress}
              onDownload={handleDownload}
              query={searchedQuery}
            />
          </>
        )}
      </div>
    </div>
  )
}
