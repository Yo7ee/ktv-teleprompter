import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/components/molecules/SettingRow'
import { SettingsGroup } from '@/components/organisms/SettingsGroup'
import { PageHeader } from '@/components/templates/PageHeader'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSongStore } from '@/stores/songStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const { settings, setSetting } = useSettingsStore()
  const { songs, clearAll } = useSongStore()

  return (
    <div className="page-root">
      <PageHeader
        title="設定"
        onBack={() => navigate(-1)}
        backLabel="返回"
      />

      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
        <SettingsGroup title="語音提示 (TTS)">
          <SettingRow label="啟用語音提示" description="透過耳機預讀歌詞" htmlFor="tts-toggle">
            <Switch
              id="tts-toggle"
              checked={settings.tts}
              onCheckedChange={(v) => setSetting('tts', v)}
              aria-label="啟用語音提示"
              className="data-[state=checked]:bg-app-accent"
            />
          </SettingRow>

          <SettingRow label="提前秒數">
            <div role="radiogroup" aria-label="提前秒數" className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <Button
                  key={n}
                  role="radio"
                  aria-checked={settings.advance === n}
                  aria-label={`${n} 秒`}
                  onClick={() => setSetting('advance', n)}
                  className={cn(
                    'h-8 w-9 rounded-lg text-[11px] font-bold border',
                    settings.advance === n
                      ? 'bg-app-accent text-white border-app-accent hover:bg-app-accent/90'
                      : 'bg-app-bg text-app-muted border-app-rim hover:bg-app-elev',
                  )}
                >
                  {n}s
                </Button>
              ))}
            </div>
          </SettingRow>
        </SettingsGroup>

        <SettingsGroup title="顯示">
          <SettingRow
            label="歌詞字體大小"
            stacked
            value={`${settings.fontSize}px`}
          >
            <Slider
              min={16}
              max={32}
              step={2}
              value={settings.fontSize}
              onValueChange={(val) => setSetting('fontSize', val as number)}
              aria-label={`歌詞字體大小，目前 ${settings.fontSize} 像素`}
              className="w-full"
            />
          </SettingRow>
        </SettingsGroup>

        <SettingsGroup title="離線資料">
          <SettingRow label="快取歌曲" description="已離線儲存">
            <span className="text-app-accent-g text-[13px] font-bold">{songs.length} 首</span>
          </SettingRow>
          <div className="px-5 py-2.5">
            <Button
              variant="outline"
              onClick={clearAll}
              aria-label="清除所有已快取歌詞"
              className="w-full h-11 bg-app-bg border-app-rim rounded-xl text-app-muted text-[13px]"
            >
              清除所有快取
            </Button>
          </div>
        </SettingsGroup>
      </div>
    </div>
  )
}
