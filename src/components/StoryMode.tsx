'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  CURRENT_STORY_VERSION,
  getAvailableFragments,
  getStoryStatusText,
  StoryFragment,
  getStoryVersionProgress,
} from '@/data/storyData';
import { BookOpen, Lock, Sparkles, Trophy } from 'lucide-react';

type ViewType = 'all' | 'main' | 'season' | 'hidden';

export default function StoryMode() {
  const { storyProgress, hiddenStoryIds, theme, setActiveTab } = useStore();
  const { storyRank, rankStars, rankProgress, rankNeed, currentChapter } = storyProgress;

  const allFragments = useMemo(
    () => getAvailableFragments(storyRank, rankStars, hiddenStoryIds),
    [storyRank, rankStars, hiddenStoryIds]
  );

  const [view, setView] = useState<ViewType>('all');
  const [selected, setSelected] = useState<StoryFragment | null>(null);

  const fragments = useMemo(() => {
    if (view === 'all') return allFragments;
    return allFragments.filter((f) => f.type === view);
  }, [allFragments, view]);

  useEffect(() => {
    if (!selected && fragments.length > 0) setSelected(fragments[fragments.length - 1]);
    if (selected && !fragments.some((f) => f.id === selected.id)) {
      setSelected(fragments[fragments.length - 1] || null);
    }
  }, [fragments, selected]);

  const versionProgress = getStoryVersionProgress(currentChapter);
  const nextChapterNeed = Math.max(0, currentChapter * 4000 - 10 - (currentChapter - 1) * 4000 + rankNeed);

  const isLightTheme = theme === 'forest' || theme === 'pixel' || theme === 'bw';
  const panelBg = isLightTheme ? 'bg-white/85' : 'bg-slate-950/50';
  const panelSubBg = isLightTheme ? 'bg-black/5' : 'bg-black/20';
  const textMain = isLightTheme ? 'text-slate-900' : 'text-text';
  const textMuted = isLightTheme ? 'text-slate-700' : 'text-text-muted';
  const readPanelBg = isLightTheme ? 'bg-white/95' : 'bg-surface';
  const characterLineClass = isLightTheme ? 'text-slate-700' : 'text-slate-300';

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-2 overflow-hidden">
      <div className={`lg:w-[380px] w-full ${panelBg} rounded-xl border border-border overflow-hidden`}>
        <div className={`p-4 border-b border-border ${panelSubBg}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${textMain} flex items-center gap-2`}>
              <Trophy size={14} className="text-yellow-400" /> 剧情中心
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${textMuted}`}>{CURRENT_STORY_VERSION}</span>
              <button
                onClick={() => setActiveTab('timer')}
                className="px-2 py-1 rounded border border-border text-[10px] text-text-muted hover:text-text hover:bg-white/5"
              >
                去专注
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className={`text-xs ${textMuted}`}>
              当前段位: <span className={`${textMain} font-bold`}>{storyRank}</span> · 星级: <span className={`${textMain} font-bold`}>{rankStars + 1}</span>
            </div>
            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.max(3, rankProgress * 100)}%` }} />
            </div>
            <div className={`text-[11px] ${textMuted}`}>
              距离下一星还需 <span className={`${textMain} font-bold`}>{rankNeed}</span> XP
            </div>
            <div className={`text-[11px] ${textMuted}`}>
              下一章条件：预计还需约 <span className={`${textMain} font-bold`}>{Math.max(1, Math.ceil(nextChapterNeed / 250))}</span> 次 25 分钟专注
            </div>

            <div className="pt-2">
              <div className={`text-[10px] ${textMuted} mb-1`}>当前版本主线推进</div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.max(5, versionProgress * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className={`mt-3 text-[11px] ${textMuted}`}>{getStoryStatusText(storyRank)}</div>
        </div>

        <div className={`p-2 border-b border-border ${isLightTheme ? 'bg-black/5' : 'bg-black/10'} flex gap-1`}>
          {([
            { id: 'all', label: '全部' },
            { id: 'main', label: '主线' },
            { id: 'season', label: '赛季线' },
            { id: 'hidden', label: '彩蛋' },
          ] as Array<{ id: ViewType; label: string }>).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-2.5 py-1 text-[11px] rounded ${view === item.id ? 'bg-primary text-white' : `${textMuted} hover:bg-white/10`}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-2 h-[calc(100%-220px)] overflow-y-auto custom-scrollbar space-y-1">
          {fragments.map((fragment) => {
            const isActive = selected?.id === fragment.id;
            return (
              <button
                key={fragment.id}
                onClick={() => setSelected(fragment)}
                className={`w-full p-3 rounded-lg border text-left transition ${isActive ? 'bg-primary/10 border-primary' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${textMain} truncate`}>{fragment.title}</div>
                    <div className={`text-[10px] ${textMuted} mt-1`}>
                      第{fragment.chapter}章 · {fragment.type === 'main' ? '主线' : fragment.type === 'season' ? '赛季支线' : '隐藏彩蛋'}
                    </div>
                  </div>
                  {fragment.type === 'hidden' ? (
                    <Sparkles size={12} className="text-purple-400 shrink-0" />
                  ) : (
                    <BookOpen size={12} className="text-text-muted shrink-0" />
                  )}
                </div>
              </button>
            );
          })}

          {fragments.length === 0 && (
            <div className={`h-full flex flex-col items-center justify-center ${textMuted} text-sm gap-2`}>
              <Lock size={20} /> 当前分类暂无可读剧情
              <button
                onClick={() => setActiveTab('timer')}
                className="mt-1 px-3 py-1 rounded border border-border text-xs text-text hover:bg-white/5"
              >
                继续专注解锁
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 ${readPanelBg} rounded-xl border border-border p-6 overflow-y-auto custom-scrollbar`}>
        {selected ? (
          <>
            <h2 className={`text-2xl font-black ${textMain} mb-2`}>{selected.title}</h2>
            <div className={`text-xs ${textMuted} mb-1`}>章节 {selected.chapter} · {selected.id}</div>
            {selected.characterLine && (
              <div className={`text-xs mb-4 ${characterLineClass}`}>角色线：{selected.characterLine}</div>
            )}
            <div className={`whitespace-pre-wrap text-sm leading-7 ${isLightTheme ? 'text-slate-900' : 'text-text/95'}`}>
              {selected.content}
            </div>
          </>
        ) : (
          <div className={`h-full flex flex-col items-center justify-center ${textMuted} gap-2`}>
            继续专注来解锁剧情
            <button
              onClick={() => setActiveTab('timer')}
              className="px-3 py-1 rounded border border-border text-xs text-text hover:bg-white/5"
            >
              去专注
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
