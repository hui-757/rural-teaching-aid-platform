/**
 * Web Audio API 合成音效
 * 无音频文件时的占位方案，后期替换为真实音频即可
 */
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

/** 短提示音：水滴/风铃（hover） */
export function playHover() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(1200, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.1)
  g.gain.setValueAtTime(0.08, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
  o.start(c.currentTime); o.stop(c.currentTime + 0.15)
}

/** 进入地界：战鼓一声 */
export function playEnter() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'triangle'
  o.frequency.setValueAtTime(180, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.25)
  g.gain.setValueAtTime(0.3, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4)
  o.start(c.currentTime); o.stop(c.currentTime + 0.4)
}

/** 答对：锣鼓轻敲 */
export function playCorrect() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(523, c.currentTime)
  o.frequency.setValueAtTime(659, c.currentTime + 0.08)
  o.frequency.setValueAtTime(784, c.currentTime + 0.16)
  g.gain.setValueAtTime(0.15, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
  o.start(c.currentTime); o.stop(c.currentTime + 0.3)
}

/** 答错：闷鼓 */
export function playWrong() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'triangle'
  o.frequency.setValueAtTime(200, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.2)
  g.gain.setValueAtTime(0.2, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
  o.start(c.currentTime); o.stop(c.currentTime + 0.3)
}

/** 通关：胜利 */
export function playVictory() {
  const c = getCtx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'triangle'
    const t = c.currentTime + i * 0.12
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.15, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    o.start(t); o.stop(t + 0.25)
  })
}

/** 失败：叹息 */
export function playFail() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(330, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.5)
  g.gain.setValueAtTime(0.12, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6)
  o.start(c.currentTime); o.stop(c.currentTime + 0.6)
}

/** 解锁：金光一闪 */
export function playUnlock() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(800, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(1400, c.currentTime + 0.15)
  g.gain.setValueAtTime(0.1, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2)
  o.start(c.currentTime); o.stop(c.currentTime + 0.2)
}

/** 开始闯关：金箍棒敲地 */
export function playBattleStart() {
  const c = getCtx()
  // 低频敲击
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'triangle'
  o.frequency.setValueAtTime(100, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.3)
  g.gain.setValueAtTime(0.4, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5)
  o.start(c.currentTime); o.stop(c.currentTime + 0.5)
}

/** 倒计时急促 */
export function playTick() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = 'square'
  o.frequency.setValueAtTime(600, c.currentTime)
  g.gain.setValueAtTime(0.06, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05)
  o.start(c.currentTime); o.stop(c.currentTime + 0.05)
}
