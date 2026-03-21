'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { RARITY_CONFIG, Artifact } from '@/data/artifactSystem';
import { BookOpen, Box, Clock, Search, Sparkles, X } from 'lucide-react';

export default function Museum() {
  const { artifacts, hiddenStoryIds, setActiveTab, theme } = useStore();
  const [selected, setSelected] = useState<Artifact | null>(null);
  const isLightTheme = theme === 'forest' || theme === 'pixel' || theme === 'bw';
  const shellBg = isLightTheme ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10';
  const mutedText = isLightTheme ? 'text-slate-700' : 'text-text/70';

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2"><Box className="text-purple-400" /> 彩蛋收藏馆</h2>
        <p className={`text-sm ${mutedText}`}>已收录彩蛋 {artifacts.length} · 已解锁剧情节点 {hiddenStoryIds.length}</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        {artifacts.length === 0 ? (
          <div className={`h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl ${shellBg} ${mutedText}`}>
            <Search size={48} className="mb-4 opacity-50" />
            <p>还没有掉落彩蛋</p>
            <p className="text-xs mt-2 opacity-60">完成专注后随机掉落，长时和连击会提升概率</p>
            <button
              onClick={() => setActiveTab('timer')}
              className="mt-3 px-3 py-1.5 rounded border border-border text-xs text-text hover:bg-white/5"
            >
              去专注
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artifacts.map((item) => {
              const config = RARITY_CONFIG[item.rarity];
              return (
                <button key={item.id} onClick={() => setSelected(item)} className={`relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg ${shellBg}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-black/30 border border-white/5 ${config.shadow}`}>📦</div>
                  <div className="w-full">
                    <div className="text-sm font-bold truncate" style={{ color: config.color }}>{item.name}</div>
                    <div className={`text-[10px] mt-1 uppercase tracking-wider font-bold ${mutedText}`}>{config.label} · CH{item.chapter}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-text/50 hover:text-text"><X size={20} /></button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className={`w-24 h-24 rounded-2xl bg-black/50 flex items-center justify-center text-5xl border border-white/10 ${RARITY_CONFIG[selected.rarity].shadow}`}>📦</div>
              <div>
                <h3 className="text-2xl font-black mb-1" style={{ color: RARITY_CONFIG[selected.rarity].color }}>{selected.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold bg-white/10 px-2 py-1 rounded-full text-text/70 border border-white/5">{RARITY_CONFIG[selected.rarity].label}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl w-full text-sm text-text/80 border-l-2 text-left" style={{ borderColor: RARITY_CONFIG[selected.rarity].color }}>{selected.description}</div>
              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                <div className="bg-black/30 p-2 rounded flex items-center justify-center gap-2 text-[10px] text-text/50"><Clock size={10} /> {new Date(selected.timestamp).toLocaleDateString()}</div>
                <div className="bg-black/30 p-2 rounded flex items-center justify-center gap-2 text-[10px] text-text/50"><Sparkles size={10} /> 章节: {selected.chapter}</div>
              </div>

              <div className="mt-2 flex gap-2">
                <button onClick={() => { setSelected(null); setActiveTab('rank'); }} className="px-3 py-2 rounded bg-primary text-white text-xs font-bold flex items-center gap-1">
                  查看剧情 <BookOpen size={12} />
                </button>
                <button onClick={() => { setSelected(null); setActiveTab('timer'); }} className="px-3 py-2 rounded border border-border text-xs font-bold text-text hover:bg-white/5">
                  继续专注
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
