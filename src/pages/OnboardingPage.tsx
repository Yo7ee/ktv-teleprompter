import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  HandRaisedIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { OnboardingStep } from '@/components/organisms/OnboardingStep'
import { StepDots } from '@/components/molecules/StepDots'
import { useSettingsStore } from '@/stores/settingsStore'

const STEPS = [
  {
    icon: <MicrophoneIcon className="w-9 h-9 text-app-accent" />,
    title: '歡迎使用\nKTV 提詞機',
    body: '專為視障者設計的 KTV 演唱輔助工具。透過語音提示與震動回饋，讓你完全自主掌控演唱節奏。',
    aria: '歡迎使用 KTV 提詞機。這是專為視障者設計的演唱輔助工具。',
  },
  {
    icon: <SpeakerWaveIcon className="w-9 h-9 text-app-accent" />,
    title: '語音預報歌詞',
    body: '演唱前 2 秒，耳機會自動播報下一句歌詞，讓你提前準備，從容開口。',
    aria: '功能一：語音預報。演唱前 2 秒自動播報下一句歌詞。',
  },
  {
    icon: <DevicePhoneMobileIcon className="w-9 h-9 text-app-accent" />,
    title: '震動提示間奏',
    body: '遇到間奏或前奏時，手機會震動提示（Android），iOS 顯示視覺閃爍，讓你知道何時暫停、何時繼續。',
    aria: '功能二：震動提示。遇到間奏時手機震動或畫面閃爍提醒。',
  },
  {
    icon: <ArrowDownTrayIcon className="w-9 h-9 text-app-accent" />,
    title: '事先下載歌詞',
    body: '在有網路的地方先下載歌詞。進入 KTV 包廂後，沒有網路也能完美使用。',
    aria: '功能四：離線使用。事先下載歌詞，包廂內無需網路。',
  },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const isLast = step === STEPS.length - 1

  const handleDone = () => {
    localStorage.setItem('ktv-onboarded', '1')
    navigate('/library', { replace: true })
  }

  return (
    <div
      className="page-root"
      role="dialog"
      aria-modal="true"
      aria-label="使用說明"
    >
      {/* Skip */}
      <div className="flex justify-end px-5 pt-3">
        <Button
          variant="ghost"
          onClick={handleDone}
          aria-label="略過說明"
          className="text-app-muted text-[13px] min-h-[44px] min-w-[44px]"
        >
          略過
        </Button>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <OnboardingStep step={STEPS[step]} />
      </div>

      {/* Dots */}
      <div className="flex justify-center pb-4">
        <StepDots total={STEPS.length} current={step} onSelect={setStep} />
      </div>

      {/* CTA */}
      <div className="px-5 pb-8">
        <Button
          onClick={() => (isLast ? handleDone() : setStep((s) => s + 1))}
          aria-label={isLast ? '開始使用' : `繼續，前往第 ${step + 2} 步`}
          className="w-full py-3.5 rounded-2xl text-white text-base font-bold btn-gradient-accent"
        >
          {isLast ? '開始使用' : '繼續'}
        </Button>
      </div>
    </div>
  )
}
