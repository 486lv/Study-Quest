// src/data/artifactSystem.ts
import { StoryEgg, pickStoryEggByRarity, StoryRank } from '@/data/storyData';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Glitched';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  timestamp: number;
  sourceDepth: number;
  storyId: string;
  chapter: number;
  characterLine: string;
  isHandcrafted: boolean;
}

export const RARITY_CONFIG: Record<Rarity, { color: string; label: string; shadow: string }> = {
  Common: { color: '#94a3b8', label: '普通', shadow: 'shadow-slate-500/20' },
  Rare: { color: '#3b82f6', label: '稀有', shadow: 'shadow-blue-500/30' },
  Epic: { color: '#a855f7', label: '史诗', shadow: 'shadow-purple-500/40' },
  Legendary: { color: '#eab308', label: '传说', shadow: 'shadow-yellow-500/50' },
  Glitched: { color: '#ef4444', label: '故障', shadow: 'shadow-red-500/50' },
};

const rollRarity = (focusMinutes: number): Rarity => {
  const roll = Math.random();

  if (Math.random() < 0.015) return 'Glitched';

  if (focusMinutes >= 60) {
    if (roll > 0.86) return 'Legendary';
    if (roll > 0.62) return 'Epic';
    if (roll > 0.35) return 'Rare';
    return 'Common';
  }

  if (focusMinutes >= 45) {
    if (roll > 0.92) return 'Legendary';
    if (roll > 0.72) return 'Epic';
    if (roll > 0.45) return 'Rare';
    return 'Common';
  }

  if (focusMinutes >= 25) {
    if (roll > 0.96) return 'Legendary';
    if (roll > 0.82) return 'Epic';
    if (roll > 0.58) return 'Rare';
    return 'Common';
  }

  if (roll > 0.985) return 'Legendary';
  if (roll > 0.93) return 'Epic';
  if (roll > 0.72) return 'Rare';
  return 'Common';
};

const shouldDrop = (focusMinutes: number, combo: number): boolean => {
  if (focusMinutes >= 70) return true;
  const base = 0.1;
  const comboBonus = Math.min(combo * 0.025, 0.2);
  const longBonus = focusMinutes >= 45 ? 0.12 : focusMinutes >= 30 ? 0.06 : 0;
  return Math.random() < Math.min(0.88, base + comboBonus + longBonus);
};

const eggToArtifact = (egg: StoryEgg, focusMinutes: number): Artifact => ({
  id: `ART-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
  name: egg.title,
  description: egg.content,
  rarity: egg.rarity,
  timestamp: Date.now(),
  sourceDepth: focusMinutes,
  storyId: egg.id,
  chapter: egg.chapter,
  characterLine: egg.characterLine,
  isHandcrafted: true,
});

export function digForArtifact(params: {
  focusMinutes: number;
  combo: number;
  unlockedEggIds: string[];
  rank: StoryRank;
}): Artifact | null {
  const { focusMinutes, combo, unlockedEggIds, rank } = params;
  if (!shouldDrop(focusMinutes, combo)) return null;

  const rarity = rollRarity(focusMinutes);
  const egg = pickStoryEggByRarity(rarity, unlockedEggIds, rank);
  if (!egg) return null;

  return eggToArtifact(egg, focusMinutes);
}
