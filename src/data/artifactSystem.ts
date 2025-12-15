// src/data/artifactSystem.ts

// ==========================================
// 1. 类型定义与配置
// ==========================================

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Glitched';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  timestamp: number;
  sourceDepth: number; // 专注时长（作为挖掘深度的参考）
}

// 稀有度视觉配置 (供前端 UI 直接调用颜色和光效)
export const RARITY_CONFIG: Record<Rarity, { color: string; label: string; shadow: string }> = {
  Common: { 
    color: '#94a3b8', // Slate-400 (灰色)
    label: '普通', 
    shadow: 'shadow-slate-500/20' 
  },
  Rare: { 
    color: '#3b82f6', // Blue-500 (蓝色)
    label: '稀有', 
    shadow: 'shadow-blue-500/30' 
  },
  Epic: { 
    color: '#a855f7', // Purple-500 (紫色)
    label: '史诗', 
    shadow: 'shadow-purple-500/40' 
  },
  Legendary: { 
    color: '#eab308', // Yellow-500 (金色)
    label: '传说', 
    shadow: 'shadow-yellow-500/50' 
  },
  Glitched: { 
    color: '#ef4444', // Red-500 (红色故障风)
    label: '错误', 
    shadow: 'shadow-red-500/50' 
  }
};

// ==========================================
// 2. 生成词库 (Roguelike 核心)
// ==========================================

const PREFIXES = [
  "被遗忘的", "半透明的", "加密的", "闪烁的", "严重损坏的", 
  "来自2077年的", "量子纠缠的", "只有一半的", "无法渲染的", 
  "带噪点的", "二进制的", "只读的", "过热的", "没有碰撞体积的",
  "无限递归的", "被诅咒的", "全息投影的", "低多边形的"
];

const ITEMS = [
  "咖啡杯", "机械键帽", "情书", "地铁票", "猫项圈", 
  "软盘", "高达模型", "吉他拨片", "拍立得照片", "运算核心", 
  "视网膜屏", "泡面叉", "过期药瓶", "MP3", "VR眼镜碎片",
  "旧日记本", "工牌", "硬盘", "游戏手柄", "发光二极管"
];

const DESCRIPTIONS = [
  "表面覆盖着一层厚厚的数字尘埃。",
  "当你触碰它时，会听到微弱的电流声。",
  "上面刻着一个模糊的名字，已经无法辨认。",
  "它总是试图飘向天花板，仿佛不受重力束缚。",
  "系统提示：该物品缺少纹理文件 (Texture Missing)。",
  "拿着它，你会感到一种莫名的悲伤。",
  "它闻起来像下雨前的柏油路。",
  "里面似乎存着一段无法播放的音频。",
  "它在不断地在 0 和 1 之间切换状态。",
  "这是旧人类用来储存记忆的容器。",
  "看着它，你仿佛能看到一段从未发生过的回忆。",
  "它有时候会凭空消失，几秒后又出现在原处。",
  "物品说明写着：'不要在午夜十二点后使用'。",
  "它散发着微弱的余温，像是刚被人放下。",
  "这是一个逻辑悖论的具象化产物。"
];

// ==========================================
// 3. 核心生成算法
// ==========================================

/**
 * 根据专注时长挖掘文物
 * @param focusMinutes 专注分钟数
 * @returns Artifact 对象 或 null (未挖到)
 */
export function digForArtifact(focusMinutes: number): Artifact | null {
  // 1. 掉落率计算
  // 基础掉落率：每分钟增加 1.5% 概率。
  // 例如：25分钟 = 37.5% 概率，60分钟 = 90% 概率。
  const dropChance = Math.min(focusMinutes * 0.015, 1.0);
  
  // 随机检定：如果没有通过概率，则返回 null
  if (Math.random() > dropChance) {
    return null; 
  }

  // 2. 决定稀有度
  let rarity: Rarity = 'Common';
  const roll = Math.random(); // 0.0 ~ 1.0

  // 稀有度阈值逻辑 (专注时间越长，越容易出好东西)
  if (focusMinutes >= 45) {
    // 长时间专注 (45分钟+)：高概率出史诗/传说
    if (roll > 0.90) rarity = 'Legendary';     // 10% 传说
    else if (roll > 0.70) rarity = 'Epic';     // 20% 史诗
    else if (roll > 0.40) rarity = 'Rare';     // 30% 稀有
    else rarity = 'Common';                    // 40% 普通
  } else if (focusMinutes >= 25) {
    // 中等专注 (25-45分钟)
    if (roll > 0.95) rarity = 'Legendary';     // 5% 传说
    else if (roll > 0.85) rarity = 'Epic';     // 10% 史诗
    else if (roll > 0.60) rarity = 'Rare';     // 25% 稀有
    else rarity = 'Common';                    // 60% 普通
  } else {
    // 短时间专注 (<25分钟)
    if (roll > 0.98) rarity = 'Legendary';     // 2% 传说 (欧皇时刻)
    else if (roll > 0.90) rarity = 'Epic';
    else if (roll > 0.70) rarity = 'Rare';
    else rarity = 'Common';
  }

  // 彩蛋：极低概率出现 "Glitched" (故障) 物品
  if (Math.random() < 0.01) {
    rarity = 'Glitched';
  }

  // 3. 随机组合名称和描述
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const desc = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];

  // 4. 构建并返回对象
  return {
    id: `ART-${Date.now()}-${Math.floor(Math.random() * 9999)}`, // 生成唯一ID
    name: `${prefix}${item}`,
    description: desc,
    rarity: rarity,
    timestamp: Date.now(),
    sourceDepth: focusMinutes // 记录来源深度（专注时长）
  };
}