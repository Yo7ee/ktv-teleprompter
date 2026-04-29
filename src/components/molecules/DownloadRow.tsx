import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/atoms/Badge'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import type { Song } from '@/types/song'

interface DownloadRowProps {
  song: Song
  isCached: boolean
  downloadProgress?: number
  onDownload: (song: Song) => void
}

export function DownloadRow({ song, isCached, downloadProgress, onDownload }: DownloadRowProps) {
  const isDownloading = downloadProgress !== undefined

  return (
    <li>
      <div className="flex items-center gap-3 py-3 border-b border-app-rim min-h-[56px]">
        <div
          className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center text-xl bg-app-elev"
          aria-hidden="true"
        >
          {song.albumArt}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-app-text text-sm font-semibold truncate">{song.title}</p>
          <p className="song-meta">{song.artist}</p>
          {isDownloading && (
            <ProgressBar
              value={downloadProgress}
              max={100}
              label={`下載 ${song.title}`}
              className="mt-1.5"
            />
          )}
        </div>
        <div className="shrink-0">
          {isCached ? (
            <Badge variant="cached">已快取</Badge>
          ) : isDownloading ? (
            <span className="text-app-muted text-xs font-semibold tabular-nums">
              {Math.round(downloadProgress)}%
            </span>
          ) : (
            <Button
              variant="ghost"
              onClick={() => onDownload(song)}
              aria-label={`下載 ${song.title}，${song.artist}`}
              className="flex items-center gap-1 bg-app-elev border border-app-rim rounded-lg px-3 py-1.5 text-app-accent text-xs font-semibold min-h-[44px] min-w-[44px]"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" aria-hidden="true" />
              下載
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
