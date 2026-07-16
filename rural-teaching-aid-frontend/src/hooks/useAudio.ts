import { useState, useCallback, useRef, useEffect } from 'react'
import { Howl } from 'howler'
import * as Synth from '../audio/synth'

type SfxName = 'hover' | 'enter' | 'correct' | 'wrong' | 'victory' | 'fail' | 'unlock' | 'battleStart' | 'tick'

type BgmName = 'worldMap' | 'huaguoshan' | 'battle'

const BGM_PATHS: Record<BgmName, string> = {
  worldMap: '/audio/bgm/world-map.mp3',
  huaguoshan: '/audio/bgm/huaguoshan.mp3',
  battle: '/audio/bgm/battle.mp3',
}

/** 统一音效管理 Hook */
export function useAudio() {
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  // =========== 音效（Web Audio 合成） ===========
  const playSfx = useCallback((name: SfxName) => {
    if (muted) return
    const fn: Record<SfxName, () => void> = {
      hover: Synth.playHover,
      enter: Synth.playEnter,
      correct: Synth.playCorrect,
      wrong: Synth.playWrong,
      victory: Synth.playVictory,
      fail: Synth.playFail,
      unlock: Synth.playUnlock,
      battleStart: Synth.playBattleStart,
      tick: Synth.playTick,
    }
    fn[name]?.()
  }, [muted])

  // =========== BGM（原生 HTML5 Audio） ===========
  const playBgm = useCallback((name: BgmName) => {
    const src = BGM_PATHS[name]
    if (!src) return
    bgmRef.current?.pause()
    bgmRef.current = null
    if (muted) return
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    bgmRef.current = audio
    audio.play().catch(() => {}) // 忽略 autoplay 拦截
  }, [muted, volume])

  const stopBgm = useCallback(() => {
    bgmRef.current?.pause()
    bgmRef.current = null
  }, [])

  // 音量变化时更新 BGM
  useEffect(() => {
    if (bgmRef.current) bgmRef.current.volume = volume
  }, [volume])

  // 静音切换
  useEffect(() => {
    if (muted) { bgmRef.current?.pause() }
    else if (bgmRef.current) { bgmRef.current.play().catch(() => {}) }
  }, [muted])

  // =========== 控制 ===========
  const toggleMute = useCallback(() => setMuted(m => !m), [])
  const setVol = useCallback((v: number) => setVolume(Math.max(0, Math.min(1, v))), [])

  // 预加载语音列表
  useEffect(() => { window.speechSynthesis.getVoices() }, [])

  // 清理
  useEffect(() => () => { bgmRef.current?.pause() }, [])

  // =========== 台词 MP3 播放 ===========
  const speak = useCallback((text: string, _level?: number): Promise<void> => {
    return new Promise((resolve) => {
      if (muted) { resolve(); return }
      // 尝试加载对应关卡台词MP3
      const src = `/audio/lines/line-${_level || 1}.mp3`
      const sound = new Howl({ src: [src], volume, html5: true, onend: resolve, onloaderror: resolve })
      sound.play()
      setTimeout(resolve, 5000)
    })
  }, [muted, volume])

  return { playSfx, playBgm, stopBgm, speak, muted, toggleMute, volume, setVol }
}
