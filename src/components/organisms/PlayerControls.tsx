import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'

interface PlayerControlsProps {
  playing: boolean
  onTogglePlay: () => void
  onReset: () => void
}

export function PlayerControls({ playing, onTogglePlay, onReset }: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-2 px-5 pb-3 pt-2">
      <Button
        variant="ghost"
        onClick={onReset}
        aria-label="重置回到開頭"
        className="btn-control"
      >
        <ArrowPathIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        重置
      </Button>

      <Button
        onClick={onTogglePlay}
        aria-label={playing ? '暫停' : '播放'}
        aria-pressed={playing}
        className="w-[54px] h-[54px] rounded-full shrink-0 btn-gradient-play"
      >
        {playing ? (
          <PauseIcon className="w-5 h-5 text-white" aria-hidden="true" />
        ) : (
          <PlayIcon className="w-5 h-5 text-white" aria-hidden="true" />
        )}
      </Button>

      <div className="flex-1" />
    </div>
  )
}
