import { create } from 'zustand'
import type { Unit, GameState } from '../types'

interface AppState {
  currentGrade: number | null
  units: Unit[]
  setGrade: (grade: number) => void
  setUnits: (units: Unit[]) => void
  gameState: GameState
  setGameState: (state: Partial<GameState>) => void
  resetGame: () => void
  hasGradeSelected: () => boolean
}

const STORAGE_KEY = 'rta_selected_grade'

const savedGrade = localStorage.getItem(STORAGE_KEY)
const initialGrade: number | null = savedGrade ? Number(savedGrade) : null

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

export const useAppStore = create<AppState>((set, get) => ({
  currentGrade: initialGrade,
  units: [],
  setGrade: (grade) => {
    localStorage.setItem(STORAGE_KEY, String(grade))
    set({ currentGrade: grade })
  },
  setUnits: (units) => set({ units }),
  gameState: defaultGameState,
  setGameState: (state) => set((prev) => ({ gameState: { ...prev.gameState, ...state } })),
  resetGame: () => set({ gameState: defaultGameState }),
  hasGradeSelected: () => get().currentGrade !== null,
}))
