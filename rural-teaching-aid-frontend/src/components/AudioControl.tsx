import { Volume2, VolumeX } from 'lucide-react'

interface AudioControlProps {
  muted: boolean
  toggleMute: () => void
  volume: number
  setVol: (v: number) => void
}

/** 全局音频控制按钮 — 浮动在右下角 */
export default function AudioControl({ muted, toggleMute, volume, setVol }: AudioControlProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/40 backdrop-blur rounded-full px-3 py-2 shadow-lg">
      {/* 静音切换 */}
      <button
        onClick={toggleMute}
        className="text-white/80 hover:text-white transition-colors"
        title={muted ? '取消静音' : '静音'}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* 音量滑块 */}
      {!muted && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVol(Number(e.target.value))}
          className="w-16 h-1 accent-wall-gold cursor-pointer"
        />
      )}
    </div>
  )
}
