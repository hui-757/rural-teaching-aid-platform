import { create } from 'zustand'
import type { Unit, GameState } from '../types'

interface AppState {
  currentGrade: number
  units: Unit[]
  setGrade: (grade: number) => void
  setUnits: (units: Unit[]) => void
  gameState: GameState
  setGameState: (state: Partial<GameState>) => void
  resetGame: () => void
}

const defaultGameState: GameState = {
  unitId: null,
  currentLevel: 1,
  totalLevels: 10,
  questions: [],
  answers: [],
  startTime: 0,
  studentName: '',
  isActive: false,
}

export const useAppStore = create<AppState>((set) => ({
  currentGrade: 4,
  units: [],
  setGrade: (grade) => set({ currentGrade: grade }),
  setUnits: (units) => set({ units }),
  gameState: defaultGameState,
  setGameState: (state) => set((prev) => ({ gameState: { ...prev.gameState, ...state } })),
  resetGame: () => set({ gameState: defaultGameState }),
}))
