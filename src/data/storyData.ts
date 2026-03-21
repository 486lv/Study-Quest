// src/data/storyData.ts
import type { Rarity } from '@/data/artifactSystem';

export type StoryRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type StoryFragmentType = 'main' | 'season' | 'hidden';

export interface StoryFragment {
  id: string;
  title: string;
  chapter: number;
  rank: StoryRank;
  minStars: number;
  type: StoryFragmentType;
  content: string;
  characterLine?: string;
  rarity?: Rarity;
}

export interface StoryEgg {
  id: string;
  title: string;
  chapter: number;
  rank: StoryRank;
  characterLine: string;
  rarity: Rarity;
  content: string;
}

const rankOrder: Record<StoryRank, number> = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Platinum: 3,
  Diamond: 4,
};

export const isRankUnlocked = (current: StoryRank, target: StoryRank) => rankOrder[current] >= rankOrder[target];

export const MAINLINE_FRAGMENTS: StoryFragment[] = [
  { id: 'M-001', title: '第1章：冷启动协议', chapter: 1, rank: 'Bronze', minStars: 0, type: 'main', content: '系统在凌晨 04:17 重启。世界没有崩溃，只是停在“能被理解”的最低分辨率。你收到的第一条指令是：保持一次 25 分钟的专注，验证现实是否还能被稳定渲染。' },
  { id: 'M-002', title: '第1章：防火墙宣言', chapter: 1, rank: 'Bronze', minStars: 1, type: 'main', content: '你在底层文档看到一行注释：专注不是效率技巧，而是文明防火墙。每一次深度专注都在把混沌概率压成可生活的秩序。', characterLine: 'Director' },
  { id: 'M-003', title: '第2章：回声地铁站', chapter: 2, rank: 'Silver', minStars: 0, type: 'main', content: '地铁广播循环播报同一分钟。站台上的人像冻结的占位符，只有你的脚步声在更新时间戳。你意识到：时间不是消失了，而是只给还在专注的人流动。', characterLine: 'Archivist' },
  { id: 'M-004', title: '第3章：段位审判庭', chapter: 3, rank: 'Gold', minStars: 1, type: 'main', content: '审判庭只问一个问题：你能不能在噪声中持续思考。通过的人获得更高段位和更多权限，失败的人被退回到“刷屏舒适区”。', characterLine: 'Watcher' },
  { id: 'M-005', title: '第4章：持续更新公约', chapter: 4, rank: 'Platinum', minStars: 2, type: 'main', content: '你终于看到主线的真相：这个故事不会完结。版本只会更新，章节只会追加。终局不是“打通”，而是“持续构建”。', characterLine: 'System' },
  { id: 'M-006', title: '第5章：当前版本终点', chapter: 5, rank: 'Diamond', minStars: 2, type: 'main', content: '你到达当前版本主线末尾。系统没有给出“END”，而是给出“PATCH SOON”。从现在开始，所有额外专注都会储存为下一季剧情的开服优势。', characterLine: 'System' },
];

export const SEASON_FRAGMENTS: StoryFragment[] = [
  { id: 'S-001', title: '赛季线A：失落电台', chapter: 2, rank: 'Silver', minStars: 1, type: 'season', content: '电台在凌晨恢复信号，播报的却是你未来七天的专注日志。你听到还未发生的失败，也听到被你逆转的结局。', characterLine: 'Radio Host' },
  { id: 'S-002', title: '赛季线B：无眠图书馆', chapter: 3, rank: 'Gold', minStars: 2, type: 'season', content: '图书馆每晚只开放一小时。你每完成一次深度专注，空白书页就会浮现一段补丁叙事，记录你如何把一个普通日程变成稳定现实的施工图。', characterLine: 'Librarian' },
];

const EGG_LINES = [
  '你在旧课桌里找到一张折到发脆的便签：不要等状态，先开始。',
  '走廊尽头的钟停在 21:40，只有你坐下专注时秒针才会跳动。',
  '失真录像里有一个你，正把手机调成飞行模式后微笑。',
  '窗外广告屏闪过一行字：今天的胜利，不是完美，是完成。',
  '你捡到一枚编号徽章，背面刻着“第 132 次重启仍未放弃”。',
  '旧耳机里传来嘈杂人群，随后有人轻声说：现在开始，25 分钟。',
  '被删改的日报里写着：真正危险的不是困难，是分心被合理化。',
  '破损电梯门反光里，你看到的自己眼神比昨天更稳。',
  '街角路灯忽明忽暗，直到你把第一行笔记写完才彻底亮起。',
  '纸杯底部压着一句印刷错误：专注不是苦行，是权限升级。',
  '机房日志提示：你刚刚替未来的自己偿还了一次拖延债务。',
  '档案柜第 7 层写着：如果你能读到这里，说明你连续赢过了噪声。',
  '便携收音机里有人播报：今天你会想放弃两次，但只要第三次继续就够。',
  '巡检无人机给你打了个“可持续输出”标签后飞走。',
  '你在厕所镜子上看到雾气留言：先做，再优化。',
  '桌面角落滚出一颗旧纽扣，上面刻着“保持节奏”。',
  '废弃车站墙面有喷漆：不被看见的努力，也会累计成等级。',
  '文件损坏提示后弹出一句替换文本：你不是没天赋，是没连续。',
  '凌晨备忘录写着：今天先守住第一段专注，其它交给时间。',
  '你打开抽屉，里面只有一支笔和一张卡片：完成比天赋可靠。',
  '实验室门禁记录显示：你比昨天早进入专注区 11 分钟。',
  '闪烁的终端给出错误码 FOCUS_021，解释却是“继续即可修复”。',
  '旧地图上被圈出的安全区只有一个词：书桌。',
  '你在雨夜公告栏看到：越往后解锁越慢，别急，值得。',
  '损坏硬盘恢复出一句话：今天的你正在成为明天最感谢的人。',
  '被风吹开的手册写着：深度专注会改变你，这是设计目标。',
  '停电后一盏应急灯亮起，照着你刚写完的待办第一项。',
  '有一张没人署名的周计划，只勾掉了“开始”。',
  '归档机器人递来一张纸条：你连续三天都在同一时间坐下。',
  '在噪声最重的一分钟，你写下了今天最关键的一行。',
  '图书馆借书卡背后印着：慢并不失败，停才是。',
  '你在旧键盘下找到一句话：每次坐下，都在重建自信回路。',
  '过期车票写着目的地“下一版本”，检票条件是坚持。',
  '凌晨系统提示：你刚把“我不行”降级为“我再试一次”。',
  '投影墙上短暂出现你未来的工位，桌面非常整洁。',
  '长廊广播重复三遍：别追求瞬间逆天，追求稳定推进。',
  '你在风扇噪音里听见一句很清楚的话：这一段做完就赢。',
  '维修记录显示：你不是修好了机器，而是修好了节奏。',
  '空白奖状忽然出现内容：授予今日“抗分心优秀者”。',
  '终端末尾追加注释：本彩蛋由你的专注行为直接触发。',
];

const lineToRank = (idx: number): StoryRank => {
  if (idx < 8) return 'Bronze';
  if (idx < 16) return 'Silver';
  if (idx < 26) return 'Gold';
  if (idx < 34) return 'Platinum';
  return 'Diamond';
};

const lineToChapter = (idx: number) => {
  if (idx < 8) return 1;
  if (idx < 16) return 2;
  if (idx < 26) return 3;
  if (idx < 34) return 4;
  return 5;
};

const lineToRarity = (idx: number): Rarity => {
  if (idx % 19 === 0) return 'Glitched';
  if (idx >= 34) return 'Legendary';
  if (idx >= 26) return 'Epic';
  if (idx >= 16) return 'Rare';
  return 'Common';
};

export const STORY_EGGS: StoryEgg[] = EGG_LINES.map((content, i) => ({
  id: `H-${String(i + 1).padStart(3, '0')}`,
  title: `隐藏彩蛋 ${String(i + 1).padStart(2, '0')}`,
  chapter: lineToChapter(i),
  rank: lineToRank(i),
  characterLine: i % 2 === 0 ? 'Archivist' : 'Watcher',
  rarity: lineToRarity(i),
  content,
}));

export const HIDDEN_FRAGMENTS: StoryFragment[] = STORY_EGGS.map((egg) => ({
  id: egg.id,
  title: egg.title,
  chapter: egg.chapter,
  rank: egg.rank,
  minStars: 0,
  type: 'hidden',
  content: egg.content,
  characterLine: egg.characterLine,
  rarity: egg.rarity,
}));

export const CURRENT_STORY_VERSION = 'v3.1.0';
export const CURRENT_STORY_MAX_CHAPTER = 5;

export const getAvailableFragments = (rank: StoryRank, stars: number, hiddenIds: string[]) => {
  const main = MAINLINE_FRAGMENTS.filter((f) => isRankUnlocked(rank, f.rank) && (rank !== f.rank || stars >= f.minStars));
  const season = SEASON_FRAGMENTS.filter((f) => isRankUnlocked(rank, f.rank) && (rank !== f.rank || stars >= f.minStars));
  const hidden = HIDDEN_FRAGMENTS.filter((f) => hiddenIds.includes(f.id));
  return [...main, ...season, ...hidden].sort((a, b) => a.chapter - b.chapter || a.id.localeCompare(b.id));
};

export const pickStoryEggByRarity = (rarity: Rarity, unlockedEggIds: string[], rank: StoryRank) => {
  const pool = STORY_EGGS.filter((egg) => egg.rarity === rarity && isRankUnlocked(rank, egg.rank) && !unlockedEggIds.includes(egg.id));
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];

  const fallback = STORY_EGGS.filter((egg) => isRankUnlocked(rank, egg.rank) && !unlockedEggIds.includes(egg.id));
  if (fallback.length === 0) return null;
  return fallback[Math.floor(Math.random() * fallback.length)];
};

export const getStoryStatusText = (rank: StoryRank) => {
  if (rank === 'Diamond') return '已到当前版本主线末尾，继续专注可储备下一季章节进度。';
  return '主线常驻更新中，段位越高解锁越慢。';
};

export const getStoryVersionProgress = (currentChapter: number) => {
  return Math.min(1, currentChapter / CURRENT_STORY_MAX_CHAPTER);
};
