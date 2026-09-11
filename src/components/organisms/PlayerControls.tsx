import { PlayIcon, PauseIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'

interface PlayerControlsProps {
  playing: boolean
  onTogglePlay: () => void
  onCalibrate: () => void
}

export function PlayerControls({ playing, onTogglePlay, onCalibrate }: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-2 px-5 pb-3 pt-2">
      <Button
        variant="ghost"
        onClick={onCalibrate}
        aria-label="校正時間軸，聽到歌詞開唱時按下"
        className="btn-control"
      >
        <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        校正
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
