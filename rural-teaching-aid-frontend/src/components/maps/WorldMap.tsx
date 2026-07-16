import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { Unit } from '../../types'
import { WESTWARD_MAP } from '../../data/westward-journey'
import { useAudioCtx } from '../../hooks/AudioContext'

interface WorldMapProps {
  units: Unit[]
  completedMaps: number[]
  onSelectUnit: (unit: Unit) => void
}

/** 地界 → 知识点 */
const CATEGORY_LABELS: Record<number, string> = {
  1: '口算乘法',
  2: '不进位笔算乘法',
  3: '连续进位笔算乘法',
  4: '中间有0的乘法',
  5: '末尾有0的乘法',
  6: '积的变化规律',
  7: '乘法估算与数学文化',
  8: '口算除法',
  9: '笔算除法竖式',
}

// 9 据点坐标（百分比，基于实际底图）——取经路线从东南蜿蜒向西北
const MAP_NODES = [
  { x: 86.1, y: 70.6, unitId: 1 },  // 1. 花果山（起点·东南）
  { x: 74.2, y: 37.3, unitId: 2 },  // 2. 高老庄
  { x: 54.4, y: 53.9, unitId: 3 },  // 3. 流沙河
  { x: 33.7, y: 30.7, unitId: 4 },  // 4. 白虎岭
  { x: 54.1, y: 74.9, unitId: 5 },  // 5. 盘丝洞
  { x: 31.0, y: 63.1, unitId: 6 },  // 6. 火焰山
  { x: 11.1, y: 63.5, unitId: 7 },  // 7. 通天河
  { x: 21.5, y: 48.4, unitId: 8 },  // 8. 乌鸡国
  { x: 17.3, y: 25.0, unitId: 9 },  // 9. 大雷音寺（终点·西北）
]

export default function WorldMap({ units, completedMaps, onSelectUnit }: WorldMapProps) {
  const sortedUnits = useMemo(() => [...units].sort((a, b) => a.unit_id - b.unit_id), [units])
  const containerRef = useRef<HTMLDivElement>(null)
  const { playSfx } = useAudioCtx()
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

  // ==================== Tooltip ====================
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; category: string } | null>(null)
  const showTooltip = useCallback((e: React.MouseEvent, unitId: number) => {
    const node = WESTWARD_MAP[unitId]
    if (!node) return
    setTooltip({ x: e.clientX, y: e.clientY, name: node.mapName, category: CATEGORY_LABELS[unitId] || '' })
  }, [])
  const hideTooltip = useCallback(() => setTooltip(null), [])

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

          {/* SVG 取经路线 */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <marker id="arrow" markerWidth="2" markerHeight="2" refX="1.8" refY="1" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L2,1 L0,2 L0.6,1 Z" fill="#a0522d" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={`M ${MAP_NODES.map(n => `${n.x},${n.y}`).join(' L ')}`}
              fill="none"
              stroke="#a0522d"
              strokeWidth="0.35"
              strokeDasharray="1.2 0.8"
              strokeLinecap="round"
              filter="url(#glow)"
              markerEnd="url(#arrow)"
            />
            <path
              d={`M ${MAP_NODES.map(n => `${n.x},${n.y}`).join(' L ')}`}
              fill="none"
              stroke="#2c1810"
              strokeWidth="0.7"
              strokeDasharray="1.2 0.8"
              strokeLinecap="round"
              opacity="0.25"
            />
          </svg>

          {/* 热区 —— 地形圆窗（从底图裁剪放大） */}
          {MAP_NODES.map((loc, i) => {
            const node = WESTWARD_MAP[loc.unitId]
            const unit = sortedUnits.find(u => u.unit_id === loc.unitId)
            const isCompleted = completedMaps.includes(loc.unitId)
            const firstUncompletedIdx = MAP_NODES.findIndex(l => !completedMaps.includes(l.unitId))
            const isAccessible = isCompleted || firstUncompletedIdx === i || i === 0
            const isCurrent = isAccessible && !isCompleted
            const isLast = i === MAP_NODES.length - 1

            return (
              <button
                key={loc.unitId}
                onMouseEnter={(e) => { if (isAccessible) playSfx('hover'); showTooltip(e, loc.unitId) }}
                onMouseMove={(e) => showTooltip(e, loc.unitId)}
                onMouseLeave={hideTooltip}
                onClick={() => { if (isAccessible && unit) { playSfx('enter'); onSelectUnit(unit) } }}
                style={{ left: `${loc.x}%`, top: `${loc.y}%`, cursor: isAccessible && unit ? 'pointer' : 'default' }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none group z-20 ${
                  isAccessible ? 'hover:scale-[2.6]' : 'hover:scale-[1.3]'
                }`}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                {/* 地形圆窗 —— 从底图裁剪 */}
                <div
                  className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl transition-all"
                  style={{
                    backgroundImage: 'url(/maps/map-base.jpg)',
                    backgroundSize: '400% 400%',
                    backgroundPosition: `${loc.x}% ${loc.y}%`,
                    border: isLast ? '3px solid #f4c542' : isCompleted ? '2.5px solid #e8b84b' : isCurrent ? '2.5px solid #a0522d' : '2px solid rgba(180,160,130,0.4)',
                  }}
                />

                {/* 未解锁：锁链遮罩 */}
                {!isAccessible && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-black/40 pointer-events-none" style={{ margin: '-2px' }} />
                    <div className="absolute -inset-1 rounded-full border-2 border-dashed border-white/30 pointer-events-none" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl drop-shadow-lg pointer-events-none">🔒</span>
                  </>
                )}

                {/* 进行中：呼吸光环 */}
                {isCurrent && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+20px)] h-[calc(100%+20px)] rounded-full border-1.5 border-[#a0522d]/20 animate-breathe-ring pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 悬停浮窗 */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-black/85 backdrop-blur text-wall-paper rounded-xl px-5 py-3 shadow-2xl border border-wall-gold/40"
          style={{ left: tooltip.x + 16, top: tooltip.y - 60, transform: 'translateY(-100%)' }}
        >
          <p className="font-serif text-lg tracking-wider text-wall-gold-light whitespace-nowrap">{tooltip.name}</p>
          <p className="text-xs text-wall-text-muted mt-0.5 whitespace-nowrap">{tooltip.category}</p>
        </div>
      )}
    </div>
  )
}
