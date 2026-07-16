import { createContext, useContext, type ReactNode } from 'react'
import { useAudio } from './useAudio'

type AudioCtx = ReturnType<typeof useAudio>
const Ctx = createContext<AudioCtx | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudio()
  return <Ctx.Provider value={audio}>{children}</Ctx.Provider>
}

export function useAudioCtx() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAudioCtx must be used within AudioProvider')
  return c
}
