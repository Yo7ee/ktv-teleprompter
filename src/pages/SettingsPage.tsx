import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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
        <SettingsGroup title="歌詞提示">
          <SettingRow
            label="提前秒數"
            stacked
            value={`${settings.advance}s`}
          >
            <Slider
              min={1}
              max={12}
              step={1}
              value={settings.advance}
              onValueChange={(val) => setSetting('advance', val as number)}
              aria-label={`提前秒數，目前 ${settings.advance} 秒`}
              className="w-full"
            />
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

        <SettingsGroup title="已下載歌曲">
          <SettingRow label="快取歌曲">
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
