import { DownloadRow } from '@/components/molecules/DownloadRow'
import type { Song } from '@/types/song'

interface DownloadResultListProps {
  results: Song[]
  cachedIds: Set<number>
  downloadProgress: Record<number, number>
  onDownload: (song: Song) => void
  query: string
}

export function DownloadResultList({
  results,
  cachedIds,
  downloadProgress,
  onDownload,
  query,
}: DownloadResultListProps) {
  if (results.length === 0) {
    return (
      <p className="text-center py-8 px-7 text-app-muted text-[13px]">
        找不到「{query}」的歌詞
        <span className="block text-app-faint text-[11px] mt-1">試試不同關鍵字</span>
      </p>
    )
  }

  return (
    <ul role="list" aria-label={`找到 ${results.length} 首歌`} className="list-none px-5">
      {results.map((song) => (
        <DownloadRow
          key={song.id}
          song={song}
          isCached={cachedIds.has(song.id)}
          downloadProgress={downloadProgress[song.id]}
          onDownload={onDownload}
        />
      ))}
    </ul>
  )
}
