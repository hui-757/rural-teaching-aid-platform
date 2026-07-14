import type { MapNode, MonsterInfo } from '../types'

/** 取经路线：单元 ID → 地界 */
export const WESTWARD_MAP: Record<number, MapNode> = {
  2: { unitId: 2, mapName: '花果山', mapIcon: '🏔️', mapOrder: 1 },
  3: { unitId: 3, mapName: '高老庄', mapIcon: '🏘️', mapOrder: 2 },
  4: { unitId: 4, mapName: '流沙河', mapIcon: '🌊', mapOrder: 3 },
  5: { unitId: 5, mapName: '白虎岭', mapIcon: '💀', mapOrder: 4 },
  6: { unitId: 6, mapName: '火焰山', mapIcon: '🔥', mapOrder: 5 },
  7: { unitId: 7, mapName: '乌鸡国', mapIcon: '👑', mapOrder: 6 },
  8: { unitId: 8, mapName: '大雷音寺', mapIcon: '🛕', mapOrder: 7 },
}

/** 各单元妖怪谱（10 关） */
export const MONSTER_BOOK: Record<number, MonsterInfo[]> = {
  2: [
    { level: 1, name: '巡山小妖', emoji: '🐒', tier: 'minion' },
    { level: 2, name: '赤尻马猴', emoji: '🐵', tier: 'minion' },
    { level: 3, name: '通臂猿猴', emoji: '🦍', tier: 'chief' },
    { level: 4, name: '混世魔王', emoji: '👹', tier: 'chief' },
    { level: 5, name: '黑风大王', emoji: '🐻', tier: 'king' },
    { level: 6, name: '黄袍老怪', emoji: '🦅', tier: 'king' },
    { level: 7, name: '金角大王', emoji: '🥇', tier: 'general' },
    { level: 8, name: '银角大王', emoji: '🥈', tier: 'general' },
    { level: 9, name: '独角兕大王', emoji: '🦏', tier: 'boss' },
    { level: 10, name: '大力牛魔王', emoji: '🐂', tier: 'boss' },
  ],
  3: [
    { level: 1, name: '猪刚鬣', emoji: '🐷', tier: 'minion' },
    { level: 2, name: '黄风小妖', emoji: '🐭', tier: 'minion' },
    { level: 3, name: '虎先锋', emoji: '🐯', tier: 'chief' },
    { level: 4, name: '黄风怪', emoji: '🌪️', tier: 'chief' },
    { level: 5, name: '白骨夫人', emoji: '☠️', tier: 'king' },
    { level: 6, name: '奎木狼', emoji: '🐺', tier: 'king' },
    { level: 7, name: '九头虫', emoji: '🐲', tier: 'general' },
    { level: 8, name: '灵感大王', emoji: '🐡', tier: 'general' },
    { level: 9, name: '青毛狮子', emoji: '🦁', tier: 'boss' },
    { level: 10, name: '黄眉老佛', emoji: '🧘', tier: 'boss' },
  ],
  4: [
    { level: 1, name: '沙悟净', emoji: '🧔', tier: 'minion' },
    { level: 2, name: '奔波儿灞', emoji: '🐸', tier: 'minion' },
    { level: 3, name: '巡海夜叉', emoji: '🦀', tier: 'chief' },
    { level: 4, name: '鼍龙怪', emoji: '🐊', tier: 'chief' },
    { level: 5, name: '蝎子精', emoji: '🦂', tier: 'king' },
    { level: 6, name: '六耳猕猴', emoji: '🐒', tier: 'king' },
    { level: 7, name: '铁扇公主', emoji: '👸', tier: 'general' },
    { level: 8, name: '玉面狐狸', emoji: '🦊', tier: 'general' },
    { level: 9, name: '金翅大鹏', emoji: '🦅', tier: 'boss' },
    { level: 10, name: '如来的考验', emoji: '☀️', tier: 'boss' },
  ],
  5: [
    { level: 1, name: '白骨小妖', emoji: '💀', tier: 'minion' },
    { level: 2, name: '骷髅兵', emoji: '🦴', tier: 'minion' },
    { level: 3, name: '化身村姑', emoji: '👩', tier: 'chief' },
    { level: 4, name: '化身老妇', emoji: '👵', tier: 'chief' },
    { level: 5, name: '白骨精真身', emoji: '☠️', tier: 'king' },
    { level: 6, name: '黄眉童儿', emoji: '🧒', tier: 'king' },
    { level: 7, name: '百眼魔君', emoji: '👁️', tier: 'general' },
    { level: 8, name: '蜘蛛精', emoji: '🕷️', tier: 'general' },
    { level: 9, name: '狮驼王', emoji: '🦁', tier: 'boss' },
    { level: 10, name: '大鹏金翅雕', emoji: '🦅', tier: 'boss' },
  ],
  6: [
    { level: 1, name: '火云童子', emoji: '🔥', tier: 'minion' },
    { level: 2, name: '烈焰小鬼', emoji: '👺', tier: 'minion' },
    { level: 3, name: '红孩儿', emoji: '👶', tier: 'chief' },
    { level: 4, name: '避水金睛兽', emoji: '🦄', tier: 'chief' },
    { level: 5, name: '牛魔王', emoji: '🐂', tier: 'king' },
    { level: 6, name: '铁扇公主', emoji: '👸', tier: 'king' },
    { level: 7, name: '九灵元圣', emoji: '🦁', tier: 'general' },
    { level: 8, name: '青牛精', emoji: '🐃', tier: 'general' },
    { level: 9, name: '黄狮精', emoji: '🦁', tier: 'boss' },
    { level: 10, name: '太乙天尊考验', emoji: '⚡', tier: 'boss' },
  ],
  7: [
    { level: 1, name: '假侍卫', emoji: '🗡️', tier: 'minion' },
    { level: 2, name: '乌鸡小兵', emoji: '🪖', tier: 'minion' },
    { level: 3, name: '假国师', emoji: '🧙', tier: 'chief' },
    { level: 4, name: '狮子精', emoji: '🦁', tier: 'chief' },
    { level: 5, name: '假国王', emoji: '👑', tier: 'king' },
    { level: 6, name: '狮猁王', emoji: '🦁', tier: 'king' },
    { level: 7, name: '白象精', emoji: '🐘', tier: 'general' },
    { level: 8, name: '大鹏怪', emoji: '🦅', tier: 'general' },
    { level: 9, name: '孔雀明王', emoji: '🦚', tier: 'boss' },
    { level: 10, name: '如来法阵', emoji: '🔮', tier: 'boss' },
  ],
  8: [
    { level: 1, name: '经书守卫', emoji: '⚔️', tier: 'minion' },
    { level: 2, name: '佛前童子', emoji: '👦', tier: 'minion' },
    { level: 3, name: '金刚护法', emoji: '💪', tier: 'chief' },
    { level: 4, name: '阿难尊者', emoji: '🙏', tier: 'chief' },
    { level: 5, name: '迦叶尊者', emoji: '🧘', tier: 'king' },
    { level: 6, name: '四大金刚', emoji: '⚡', tier: 'king' },
    { level: 7, name: '文殊菩萨', emoji: '📜', tier: 'general' },
    { level: 8, name: '普贤菩萨', emoji: '🪷', tier: 'general' },
    { level: 9, name: '观音菩萨', emoji: '🌊', tier: 'boss' },
    { level: 10, name: '如来佛祖', emoji: '☀️', tier: 'boss' },
  ],
}

export interface MonsterPosition {
  level: number
  /** 百分比定位 x */
  x: number
  /** 百分比定位 y */
  y: number
}

/** 各地界妖怪在地图上的坐标位置（百分比） */
export const MONSTER_POSITIONS: Record<number, MonsterPosition[]> = {
  2: [
    { level: 1, x: 12, y: 61 },  { level: 2, x: 26, y: 40 },
    { level: 3, x: 38, y: 32 },  { level: 4, x: 52, y: 52 },
    { level: 5, x: 35, y: 70 },  { level: 6, x: 65, y: 40 },
    { level: 7, x: 55, y: 75 },  { level: 8, x: 78, y: 60 },
    { level: 9, x: 82, y: 35 },  { level: 10, x: 88, y: 78 },
  ],
  3: [
    { level: 1, x: 12, y: 55 },  { level: 2, x: 22, y: 40 },
    { level: 3, x: 35, y: 65 },  { level: 4, x: 48, y: 38 },
    { level: 5, x: 58, y: 70 },  { level: 6, x: 42, y: 50 },
    { level: 7, x: 70, y: 42 },  { level: 8, x: 82, y: 58 },
    { level: 9, x: 88, y: 35 },  { level: 10, x: 92, y: 72 },
  ],
  4: [
    { level: 1, x: 10, y: 40 },  { level: 2, x: 20, y: 65 },
    { level: 3, x: 32, y: 30 },  { level: 4, x: 45, y: 60 },
    { level: 5, x: 38, y: 48 },  { level: 6, x: 58, y: 35 },
    { level: 7, x: 55, y: 72 },  { level: 8, x: 72, y: 50 },
    { level: 9, x: 82, y: 68 },  { level: 10, x: 90, y: 30 },
  ],
  5: [
    { level: 1, x: 15, y: 48 },  { level: 2, x: 28, y: 68 },
    { level: 3, x: 22, y: 32 },  { level: 4, x: 40, y: 52 },
    { level: 5, x: 52, y: 28 },  { level: 6, x: 48, y: 70 },
    { level: 7, x: 65, y: 42 },  { level: 8, x: 75, y: 62 },
    { level: 9, x: 82, y: 35 },  { level: 10, x: 92, y: 55 },
  ],
  6: [
    { level: 1, x: 12, y: 50 },  { level: 2, x: 28, y: 35 },
    { level: 3, x: 35, y: 55 },  { level: 4, x: 50, y: 40 },
    { level: 5, x: 45, y: 68 },  { level: 6, x: 65, y: 32 },
    { level: 7, x: 62, y: 58 },  { level: 8, x: 78, y: 45 },
    { level: 9, x: 85, y: 68 },  { level: 10, x: 92, y: 38 },
  ],
  7: [
    { level: 1, x: 15, y: 58 },  { level: 2, x: 28, y: 42 },
    { level: 3, x: 38, y: 35 },  { level: 4, x: 52, y: 55 },
    { level: 5, x: 45, y: 25 },  { level: 6, x: 62, y: 68 },
    { level: 7, x: 72, y: 38 },  { level: 8, x: 82, y: 55 },
    { level: 9, x: 88, y: 30 },  { level: 10, x: 92, y: 62 },
  ],
  8: [
    { level: 1, x: 12, y: 55 },  { level: 2, x: 25, y: 35 },
    { level: 3, x: 38, y: 50 },  { level: 4, x: 50, y: 32 },
    { level: 5, x: 48, y: 65 },  { level: 6, x: 62, y: 42 },
    { level: 7, x: 72, y: 58 },  { level: 8, x: 80, y: 35 },
    { level: 9, x: 88, y: 50 },  { level: 10, x: 92, y: 32 },
  ],
}
