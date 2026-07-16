import type { Unit, MonsterInfo } from '../../types'
import { WESTWARD_MAP, MONSTER_BOOK, MONSTER_POSITIONS } from '../../data/westward-journey'
import { useAudioCtx } from '../../hooks/AudioContext'

interface LocationSceneProps {
  unit: Unit
  completedLevels: number[]
  onSelectLevel: (level: number) => void
  studentName?: string
}

/** unit_id → 场景图文件名（新版：1=花果山） */
const SCENE_IMAGES: Record<number, string> = {
  1: '/maps/scenes/huaguoshan.png',
}

/** 妖怪节点 */
function MonsterNode({
  monster, status, position, onClick, onHover,
}: {
  monster: MonsterInfo
  status: 'locked' | 'available' | 'passed'
  position: { x: number; y: number }
  onClick: () => void
  onHover: () => void
}) {
  return (
    <button
      onClick={status !== 'locked' ? onClick : undefined}
      onMouseEnter={status !== 'locked' ? onHover : undefined}
      disabled={status === 'locked'}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 focus:outline-none group z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {status === 'available' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-wall-brick/25 animate-breathe-ring pointer-events-none" />
      )}
      <div
        className={`text-lg sm:text-xl transition-all duration-300 select-none ${
          status === 'passed' ? 'brightness-110 drop-shadow-md'
          : status === 'locked' ? 'grayscale opacity-30'
          : 'group-hover:scale-110 drop-shadow-sm'
        }`}
      >
        {monster.emoji}
      </div>
      <div
        className={`mt-0.5 px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] font-serif tracking-wider whitespace-nowrap transition-all ${
          status === 'passed' ? 'bg-wall-gold/15 text-wall-gold'
          : status === 'locked' ? 'bg-gray-200/50 text-wall-text-muted'
          : 'bg-wall-brick/10 text-wall-brick-dark'
        }`}
      >
        {status === 'passed' && '✅ '}{monster.name}
      </div>
      <span
        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold ${
          status === 'passed' ? 'bg-wall-gold text-white'
          : status === 'locked' ? 'bg-gray-300 text-gray-500'
          : 'bg-wall-brick text-white'
        }`}
      >
        {monster.level}
      </span>
    </button>
  )
}

export default function LocationScene({ unit, completedLevels, onSelectLevel }: LocationSceneProps) {
  const mapNode = WESTWARD_MAP[unit.unit_id]
  const { playSfx } = useAudioCtx()
  const monsters = MONSTER_BOOK[unit.unit_id] || []
  const positions = MONSTER_POSITIONS[unit.unit_id] || []
  const sceneImg = SCENE_IMAGES[unit.unit_id]

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl select-none">
      {/* 场景底图 */}
      {sceneImg ? (
        <img src={sceneImg} alt={mapNode?.mapName || unit.unit_name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      ) : (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(180deg, #e8f5e9 0%, #a5d6a7 70%, #4caf50 100%)' }} />
      )}

      {/* 地界名牌 — 右上角小标 */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-3 py-1.5">
        <span className="text-xl">{mapNode?.mapIcon || '📖'}</span>
        <span className="font-serif text-sm tracking-wider text-white/90">{mapNode?.mapName || unit.unit_name}</span>
      </div>

      {/* 妖怪热区 */}
      {monsters.map((monster, i) => {
        const pos = positions[i] || { x: 10 + i * 9, y: 50 + (i % 3) * 12 }
        const isCompleted = completedLevels.includes(monster.level)
        const isAvailable = monster.level === 1 || completedLevels.includes(monster.level - 1)
        return (
          <MonsterNode key={monster.level} monster={monster}
            status={isCompleted ? 'passed' : isAvailable ? 'available' : 'locked'}
            position={pos}
            onClick={() => { playSfx('battleStart'); onSelectLevel(monster.level) }}
            onHover={() => playSfx('hover')} />
        )
      })}
    </div>
  )
}
