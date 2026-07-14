import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { Unit } from '../../types'
import { WESTWARD_MAP } from '../../data/westward-journey'

interface WorldMapProps {
  units: Unit[]
  completedMaps: number[]
  onSelectUnit: (unit: Unit) => void
}

// 9 据点坐标（百分比，基于实际底图）
const MAP_NODES = [
  { x: 95.0, y: 68.9 },  // 1. 花果山
  { x: 77.5, y: 25.6 },  // 2. 高老庄
  { x: 52.8, y: 39.6 },  // 3. 流沙河
  { x: 36.0, y: 21.8 },  // 4. 白虎岭
  { x: 51.0, y: 92.2 },  // 5. 盘丝洞
  { x: 27.1, y: 86.9 },  // 6. 火焰山
  { x: 5.0,  y: 77.8 },  // 7. 通天河
  { x: 8.5,  y: 42.2 },  // 8. 乌鸡国
  { x: 10.7, y: 7.8  },  // 9. 大雷音寺
]

export default function WorldMap({ units, completedMaps, onSelectUnit }: WorldMapProps) {
  const sortedUnits = useMemo(() => [...units].sort((a, b) => a.unit_id - b.unit_id), [units])
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 })

  // ==================== Wheel Zoom ====================
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.15 : 0.15
      setScale((s) => Math.max(1, Math.min(3, +(s + delta).toFixed(2))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ==================== Drag Pan ====================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    setDragging(true)
    setDragOrigin({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [scale, offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setOffset({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y })
  }, [dragging, dragOrigin])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  const [viewSize, setViewSize] = useState({ w: 800, h: 360 })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el) setViewSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setViewSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const clampedOffset = useMemo(() => {
    const maxX = Math.max(0, viewSize.w * (scale - 1) / 2)
    const maxY = Math.max(0, viewSize.h * (scale - 1) / 2)
    return {
      x: Math.max(-maxX, Math.min(maxX, offset.x)),
      y: Math.max(-maxY, Math.min(maxY, offset.y)),
    }
  }, [scale, offset, viewSize])

  const resetView = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }) }, [])

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 工具栏 */}
      <div className="absolute top-2 right-2 z-30 flex gap-1.5">
        <button onClick={() => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)))} className="w-7 h-7 rounded-full bg-white/80 border border-wall-border flex items-center justify-center font-bold text-wall-text-soft hover:bg-white text-sm shadow-sm" title="放大">+</button>
        <button onClick={() => setScale(s => Math.max(1, +(s - 0.25).toFixed(2)))} className="w-7 h-7 rounded-full bg-white/80 border border-wall-border flex items-center justify-center font-bold text-wall-text-soft hover:bg-white text-sm shadow-sm" title="缩小">−</button>
        <button onClick={resetView} className="w-7 h-7 rounded-full bg-white/80 border border-wall-border flex items-center justify-center text-wall-text-soft hover:bg-white text-xs shadow-sm" title="重置视图">⟳</button>
      </div>

      {/* 视口 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden rounded-2xl relative select-none"
        style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 变换层 */}
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `scale(${scale}) translate(${clampedOffset.x / scale}px, ${clampedOffset.y / scale}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* 底图 */}
          <img
            src="/maps/map-base.jpg"
            alt="取经之路"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* 热区按钮 */}
          {sortedUnits.map((unit, i) => {
            const node = WESTWARD_MAP[unit.unit_id]
            const pos = MAP_NODES[i] || { x: 50, y: 50 }
            const isCompleted = completedMaps.includes(unit.unit_id)
            const firstUncompletedIdx = sortedUnits.findIndex((u) => !completedMaps.includes(u.unit_id))
            const isAccessible =
              isCompleted || (firstUncompletedIdx === -1 && i === sortedUnits.length - 1) || i === firstUncompletedIdx || i === 0
            const isCurrent = isAccessible && !isCompleted && firstUncompletedIdx !== -1
            const isLast = i === sortedUnits.length - 1

            return (
              <button
                key={unit.unit_id}
                onClick={() => isAccessible && onSelectUnit(unit)}
                disabled={!isAccessible}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 focus:outline-none group z-20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={node?.mapName || unit.unit_name}
              >
                <div
                  className={`mx-auto flex items-center justify-center transition-all duration-300 shadow-md ${
                    isLast ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-[28%]' : 'w-10 h-10 sm:w-12 sm:h-12 rounded-full'
                  }`}
                  style={{
                    background: isCompleted ? '#fff9c4' : isCurrent ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: isLast ? '3px solid #f4c542' : isCompleted ? '2.5px solid #e8b84b' : isCurrent ? '2.5px solid #a0522d' : '2px solid rgba(180,160,130,0.4)',
                    transform: isLast ? 'rotate(45deg)' : 'none',
                    boxShadow: isCurrent ? '0 3px 12px rgba(160,82,45,0.25)' : isCompleted ? '0 2px 6px rgba(180,160,40,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  <span
                    className={`text-xl sm:text-2xl select-none ${!isAccessible ? 'grayscale opacity-30' : ''}`}
                    style={isLast ? { transform: 'rotate(-45deg)' } : undefined}
                  >
                    {node?.mapIcon || '📖'}
                  </span>
                </div>
                <span className={`block mt-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-serif tracking-wider whitespace-nowrap ${
                  isCompleted ? 'bg-[#fff9c4]/80 text-[#8b6914]' : isCurrent ? 'bg-[#a0522d]/10 text-[#a0522d] font-bold' : 'bg-white/50 text-gray-400'
                }`}>
                  {isCompleted && '✅'}{node?.mapName || unit.unit_name}
                </span>
                {isCurrent && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+16px)] h-[calc(100%+16px)] rounded-full border-2 border-[#a0522d]/20 animate-breathe-ring pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 text-[10px] sm:text-xs bg-black/30 rounded-full px-4 py-1.5 backdrop-blur pointer-events-none">
        <span className="flex items-center gap-1 text-white/80"><span className="w-2 h-2 rounded-full bg-[#e8b84b]" /> 已通关</span>
        <span className="flex items-center gap-1 text-white/80"><span className="w-2 h-2 rounded-full bg-[#a0522d] animate-pulse" /> 进行中</span>
        <span className="flex items-center gap-1 text-white/60"><span className="w-2 h-2 rounded-full bg-white/30" /> 未解锁</span>
      </div>
    </div>
  )
}
