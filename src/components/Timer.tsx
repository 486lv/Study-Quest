'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Music2, Pause, Play, Plus, Save, SkipBack, SkipForward, Sparkles, Trash2, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Artifact, digForArtifact, RARITY_CONFIG } from '@/data/artifactSystem';

export default function Timer() {
  const {
    addSession,
    strictMode,
    customTags,
    addTag,
    renameTag,
    removeTag,
    storyProgress,
    dailyProgress,
    sessions,
    focusCombo,
    addArtifact,
    hiddenStoryIds,
    addHiddenStoryId,
    setActiveTab,
    theme,
    onboarding,
    setOnboardingStep,
    focusSessionState,
    music,
    musicPlaylists,
    currentPlaylistId,
    setCurrentPlaylist,
    setCurrentSource,
    setMusicPlaying,
    setMusicProgress,
    setFocusSessionState,
    playNextPlaylistSource,
    playPrevPlaylistSource,
  } = useStore();

  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [displaySeconds, setDisplaySeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTag, setCurrentTag] = useState(customTags[0]?.name || '学习');

  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ energy: 0, xp: 0 });
  const [newArtifact, setNewArtifact] = useState<Artifact | null>(null);

  const startRef = useRef(0);
  const pausedRef = useRef(0);
  const pauseStartRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTargetRef = useRef(25);

  useEffect(() => {
    if (!isActive) setDisplaySeconds(mode === 'countdown' ? targetMinutes * 60 : 0);
  }, [targetMinutes, mode, isActive]);

  useEffect(() => {
    if (!customTags.find((t) => t.name === currentTag) && customTags[0]) setCurrentTag(customTags[0].name);
  }, [customTags, currentTag]);

  const currentSource = useMemo(
    () => music.library.find((m) => m.id === music.currentSourceId) || null,
    [music.library, music.currentSourceId]
  );

  const currentPlaylist = useMemo(
    () => musicPlaylists.find((p) => p.id === currentPlaylistId) || musicPlaylists[0],
    [musicPlaylists, currentPlaylistId]
  );

  const scopedSources = useMemo(() => {
    if (!currentPlaylist) return music.library;
    const ids = new Set(currentPlaylist.sourceIds);
    return music.library.filter((s) => ids.has(s.id));
  }, [music.library, currentPlaylist]);

  const isEmbedSource = !!currentSource && (currentSource.mediaKind === 'embed' || ['bilibili', 'youtube', 'netease'].includes(currentSource.type));

  useEffect(() => {
    if (!scopedSources.length) {
      if (music.currentSourceId) setCurrentSource('');
      return;
    }
    if (!scopedSources.some((item) => item.id === music.currentSourceId)) {
      setCurrentSource(scopedSources[0].id);
    }
  }, [scopedSources, music.currentSourceId, setCurrentSource]);

  useEffect(() => {
    if (!(isActive && !isPaused)) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current - pausedRef.current) / 1000);
      if (mode === 'countdown') {
        const remaining = initialTargetRef.current * 60 - elapsed;
        if (remaining <= 0) {
          setDisplaySeconds(0);
          finishSession(true);
        } else {
          setDisplaySeconds(remaining);
        }
      } else {
        setDisplaySeconds(elapsed);
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, mode]);

  const handleStart = () => {
    const sourceToPlay = currentSource || scopedSources[0] || null;
    setIsActive(true);
    setIsPaused(false);
    startRef.current = Date.now();
    pausedRef.current = 0;
    initialTargetRef.current = targetMinutes;
    if (sourceToPlay) {
      if (music.currentSourceId !== sourceToPlay.id) setCurrentSource(sourceToPlay.id);
      setMusicPlaying(true);
    }
    setFocusSessionState('active');
    if (!onboarding.completed && onboarding.step === 1) setOnboardingStep(2);
  };

  const handlePause = () => {
    setIsPaused(true);
    pauseStartRef.current = Date.now();
    setMusicPlaying(false);
    setFocusSessionState('paused');
  };

  const handleResume = () => {
    setIsPaused(false);
    pausedRef.current += Date.now() - pauseStartRef.current;
    const sourceToPlay = currentSource || scopedSources[0] || null;
    if (sourceToPlay) {
      if (music.currentSourceId !== sourceToPlay.id) setCurrentSource(sourceToPlay.id);
      setMusicPlaying(true);
    }
    setFocusSessionState('active');
  };

  const finishSession = (isNaturalEnd: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const elapsed = isPaused
      ? Math.floor((pauseStartRef.current - startRef.current - pausedRef.current) / 1000)
      : Math.floor((Date.now() - startRef.current - pausedRef.current) / 1000);

    let actualMinutes = Math.floor(elapsed / 60);
    if (mode === 'countdown' && isNaturalEnd) actualMinutes = initialTargetRef.current;

    setIsActive(false);
    setIsPaused(false);
    setMusicPlaying(false);
    setMusicProgress(0, 0);
    setFocusSessionState('idle');

    if (actualMinutes < 1) {
      resetTimer();
      return;
    }

    const completed = !(mode === 'countdown' && !isNaturalEnd && strictMode);

    addSession({
      id: Date.now().toString(),
      startTime: new Date(startRef.current).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: actualMinutes,
      tag: currentTag,
      note: '',
      status: completed ? 'completed' : 'abandoned',
      mode,
    });

    if (completed) {
      setRewardData({ energy: actualMinutes, xp: actualMinutes * 10 });

      const found = digForArtifact({
        focusMinutes: actualMinutes,
        combo: focusCombo,
        unlockedEggIds: hiddenStoryIds,
        rank: storyProgress.storyRank,
      });

      if (found) {
        addArtifact(found);
        addHiddenStoryId(found.storyId);
        setNewArtifact(found);
      } else {
        setNewArtifact(null);
      }

      setShowReward(true);
      if (!onboarding.completed && onboarding.step === 2) setOnboardingStep(3);
      setTimeout(() => setShowReward(false), 5000);
    }

    resetTimer();
  };

  const resetTimer = () => {
    startRef.current = 0;
    pausedRef.current = 0;
    setDisplaySeconds(mode === 'countdown' ? targetMinutes * 60 : 0);
  };

  useEffect(() => {
    if (!isActive) {
      setMusicPlaying(false);
      setMusicProgress(0, 0);
      setFocusSessionState('idle');
    }
  }, [isActive, setMusicPlaying, setMusicProgress, setFocusSessionState]);

  const fmt = (sec: number) => {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const nearUpgradeSessions = Math.max(1, Math.ceil(storyProgress.rankNeed / 250));
  const totalFocusedMinutes = useMemo(
    () =>
      sessions
        .filter((s) => s.status === 'completed')
        .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0),
    [sessions]
  );
  const totalHours = Math.floor(totalFocusedMinutes / 60);
  const remainMinutes = totalFocusedMinutes % 60;
  const presetMinutes = [15, 25, 45, 60];

  const addTagInline = () => {
    const safe = newTag.trim();
    if (!safe) return;
    addTag(safe);
    setCurrentTag(safe);
    setNewTag('');
  };

  const saveRename = (oldName: string) => {
    const safe = editingValue.trim();
    if (!safe) return;
    renameTag(oldName, safe);
    if (currentTag === oldName) setCurrentTag(safe);
    setEditingTag(null);
    setEditingValue('');
  };

  const deleteTag = (name: string) => {
    removeTag(name);
    if (currentTag === name) {
      const fallback = customTags.find((t) => t.name !== name)?.name;
      if (fallback) setCurrentTag(fallback);
    }
  };

  const renderTimerFace = () => {
    const baseText = (
      <div className="text-center z-20">
        <div className="text-7xl font-black tracking-tight tabular-nums text-text">{fmt(displaySeconds)}</div>
        <div className="mt-2 text-xs text-text-muted">{mode === 'countdown' ? '倒计时模式' : '正计时模式'}</div>
        <div className="mt-4 text-sm text-text-muted">当前标签: <span className="font-bold text-text">{currentTag}</span></div>
      </div>
    );

    if (theme === 'film') {
      return (
        <div className="relative w-[380px] h-[380px] flex items-center justify-center overflow-visible">
          <div className="absolute w-[346px] h-[346px] rounded-full bg-[radial-gradient(circle_at_35%_25%,#4f4436_0%,#2a231b_45%,#1a1510_100%)] border border-[#5c4d3a] shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]">
            {[...Array(24)].map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-[8px] h-[24px] rounded-sm bg-[#0f0c09] border border-[#3d3328]"
                style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-156px)` }}
              />
            ))}
          </div>
          <div className="absolute w-[246px] h-[246px] rounded-full border border-[#79664f] bg-[radial-gradient(circle,#2d241a_0%,#19140f_90%)] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 246 246">
              {[...Array(6)].map((_, i) => (
                <line
                  key={i}
                  x1="123"
                  y1="123"
                  x2="123"
                  y2="26"
                  stroke="#8f795d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${i * 60} 123 123)`}
                />
              ))}
            </svg>
          </div>
          <div className="absolute w-[86px] h-[86px] rounded-full border-4 border-[#8f7a60] bg-[#261f17]" />
          <div className="absolute w-[24px] h-[24px] rounded-full bg-[#0f0c09] border border-[#514434]" />
          {baseText}
        </div>
      );
    }

    if (theme === 'forest') {
      return (
        <div className="relative w-[380px] h-[380px] flex items-center justify-center overflow-visible">
          <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[#eafff6] to-[#d7fbe9] border-4 border-[#a7f3d0]" />
          <div className="absolute inset-8 rounded-full overflow-hidden border border-[#22c55e]/50">
            <div className="absolute bottom-0 left-0 w-[140%] h-[45%] bg-gradient-to-r from-[#34d399] to-[#059669] opacity-65" />
            <div className="absolute bottom-[12%] left-[-10%] w-[130%] h-[32%] bg-gradient-to-r from-[#6ee7b7] to-[#10b981] opacity-45" />
          </div>
          <div className="absolute w-[330px] h-[330px] rounded-full border-2 border-[#34d399]/60" />
          {baseText}
        </div>
      );
    }

    if (theme === 'cyberpunk') {
      return (
        <div className="relative w-[380px] h-[380px] flex items-center justify-center overflow-visible">
          <div className="absolute w-[330px] h-[330px] border border-[#00ff41]/40" style={{ transform: 'rotate(45deg)' }} />
          <div className="absolute w-[290px] h-[290px] border border-[#00ff41]/70" style={{ transform: 'rotate(45deg)' }} />
          <div className="absolute w-[240px] h-[240px] bg-black border-2 border-[#00ff41]/70 shadow-[0_0_30px_rgba(0,255,65,0.25)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.08),transparent_65%)]" />
          {baseText}
        </div>
      );
    }

    if (theme === 'pixel') {
      return (
        <div className="relative w-[360px] h-[360px] flex items-center justify-center overflow-visible border-4 border-black bg-white shadow-[10px_10px_0_#000]">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.05)_100%)] bg-[length:100%_16px]" />
          <div className="absolute top-5 left-5 right-5 h-6 border-2 border-black">
            <div className="h-full w-full bg-red-500/70" />
          </div>
          {baseText}
        </div>
      );
    }

    if (theme === 'bw') {
      return (
        <div className="relative w-[380px] h-[380px] flex items-center justify-center overflow-visible">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 380">
            <path d="M188 24 C286 36 352 108 352 190 C352 284 279 352 188 352 C98 352 28 282 28 191 C28 103 94 31 188 24" fill="none" stroke="#111" strokeWidth="6" />
            <path d="M188 42 C272 54 332 114 332 190 C332 270 272 332 188 338 C108 334 46 274 44 194 C44 114 102 52 188 42" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="8 9" />
          </svg>
          {baseText}
        </div>
      );
    }

    return (
      <div className="relative w-[380px] h-[380px] flex items-center justify-center overflow-visible">
        <div className="absolute w-[330px] h-[330px] rounded-full bg-gradient-to-br from-[#4f46e5]/20 to-[#22d3ee]/10 blur-2xl" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-[#6366f1]/40" />
        <div className="absolute w-[250px] h-[250px] rounded-full border border-cyan-300/30" />
        {baseText}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      {showReward && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center">
          <div className="bg-black/90 border border-yellow-400 rounded-2xl p-6 min-w-[360px] text-center shadow-2xl">
            <h3 className="text-xl font-black text-white">SESSION COMPLETE</h3>
            <div className="flex justify-center gap-8 mt-3 text-sm">
              <div className="text-yellow-300 font-bold">+{rewardData.energy} Energy</div>
              <div className="text-blue-300 font-bold">+{rewardData.xp} XP</div>
            </div>

            {newArtifact ? (
              <div className="mt-4 border-t border-white/10 pt-4 text-left">
                <div className="text-xs uppercase tracking-widest text-purple-300 mb-2">剧情彩蛋已解锁</div>
                <div className="p-3 rounded-lg border bg-white/5" style={{ borderColor: RARITY_CONFIG[newArtifact.rarity].color }}>
                  <div className="text-sm font-bold" style={{ color: RARITY_CONFIG[newArtifact.rarity].color }}>{newArtifact.name}</div>
                  <div className="text-xs text-gray-300 mt-1 line-clamp-2">{newArtifact.description}</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-300">本次未掉落彩蛋，保持连击会提升概率。</div>
            )}

            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={() => { setShowReward(false); setActiveTab('rank'); }} className="px-3 py-1.5 rounded bg-primary text-white text-xs font-bold flex items-center gap-1">去剧情 <ArrowRight size={12} /></button>
              <button onClick={() => { setShowReward(false); setActiveTab('museum'); }} className="px-3 py-1.5 rounded border border-slate-500 text-slate-100 text-xs font-bold flex items-center gap-1">去收藏 <ArrowRight size={12} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl min-h-0">
        <div className="bg-surface border border-border rounded-theme p-8 flex items-center justify-center overflow-visible">
          {renderTimerFace()}
        </div>

        <div className="bg-surface border border-border rounded-theme p-6 flex flex-col gap-5 max-h-[72vh] overflow-y-auto custom-scrollbar">
          <div className="flex gap-2">
            {(['countdown', 'stopwatch'] as const).map((m) => (
              <button key={m} onClick={() => !isActive && setMode(m)} className={`flex-1 py-2.5 rounded-theme text-sm font-bold ${mode === m ? 'bg-primary text-white' : 'border border-border text-text hover:bg-white/5'}`}>{m === 'countdown' ? '倒计时' : '正计时'}</button>
            ))}
          </div>

          {mode === 'countdown' && !isActive && (
            <div>
              <div className="text-xs text-text-muted mb-1">时长: {targetMinutes} 分钟</div>
              <input type="range" min={1} max={120} value={targetMinutes} onChange={(e) => setTargetMinutes(Number(e.target.value))} className="w-full accent-primary" />
              <div className="mt-2 flex flex-wrap gap-2">
                {presetMinutes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setTargetMinutes(m)}
                    className={`px-2.5 py-1 rounded text-[11px] border transition ${targetMinutes === m ? 'border-primary text-primary bg-primary/10 font-bold' : 'border-border text-text-muted hover:text-text hover:bg-white/5'}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-text-muted">建议：日常 25m，深度任务 45m+</div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-text-muted">专注标签</div>
              <button onClick={() => setShowTagEditor((v) => !v)} className="text-xs text-primary flex items-center gap-1"><Plus size={12} /> 编辑</button>
            </div>

            <div className="flex flex-wrap gap-2">
              {customTags.map((tag) => (
                <button key={tag.name} onClick={() => setCurrentTag(tag.name)} className={`px-3 py-1 text-xs rounded-theme border ${currentTag === tag.name ? 'border-primary text-primary font-bold' : 'border-transparent bg-black/5 text-text-muted hover:text-text'}`}>{tag.name}</button>
              ))}
            </div>

            {showTagEditor && (
              <div className="mt-3 p-3 border border-border rounded-theme bg-black/10 space-y-2">
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addTagInline(); if (e.key === 'Escape') setNewTag(''); }} placeholder="新增标签（Enter 保存）" className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm" />
                  <button onClick={addTagInline} className="px-3 text-xs rounded bg-primary text-white">添加</button>
                </div>

                <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1">
                  {customTags.map((tag) => (
                    <div key={`${tag.name}-edit`} className="flex items-center gap-2">
                      {editingTag === tag.name ? (
                        <>
                          <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveRename(tag.name); if (e.key === 'Escape') { setEditingTag(null); setEditingValue(''); } }} className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs" />
                          <button onClick={() => saveRename(tag.name)} className="p-1 text-emerald-300"><Save size={12} /></button>
                          <button onClick={() => setEditingTag(null)} className="p-1 text-slate-400"><X size={12} /></button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-xs text-text">{tag.name}</span>
                          <button onClick={() => { setEditingTag(tag.name); setEditingValue(tag.name); }} className="p-1 text-slate-300"><Sparkles size={12} /></button>
                          <button onClick={() => deleteTag(tag.name)} className="p-1 text-red-300"><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border border-border rounded-theme p-3 bg-black/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-text-muted flex items-center gap-2"><Music2 size={14} /> 专注音乐</div>
              <button onClick={() => setActiveTab('music')} className="text-[11px] text-primary">打开音乐库</button>
            </div>
            <select value={currentPlaylistId} onChange={(e) => setCurrentPlaylist(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs">
              {musicPlaylists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={music.currentSourceId} onChange={(e) => setCurrentSource(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-2 text-xs">
              <option value="">请选择曲目</option>
              {scopedSources.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => playPrevPlaylistSource()}
                disabled={!currentSource || !scopedSources.length}
                className="px-3 py-1.5 rounded border border-border text-xs font-bold text-text disabled:opacity-40 flex items-center gap-1"
              >
                <SkipBack size={12} /> 上一首
              </button>
              <button
                onClick={() => playNextPlaylistSource()}
                disabled={!currentSource || !scopedSources.length}
                className="px-3 py-1.5 rounded border border-border text-xs font-bold text-text disabled:opacity-40 flex items-center gap-1"
              >
                <SkipForward size={12} /> 下一首
              </button>
            </div>
            <div className="h-[220px] rounded-2xl border border-white/15 bg-black/20 overflow-auto custom-scrollbar">
              {!currentSource && <div className="h-full min-h-[220px] flex items-center justify-center text-sm text-text-muted">先在上方选一首歌</div>}
              {currentSource && !isEmbedSource && (
                <div className="h-full min-h-[220px] flex items-center justify-center p-4">
                  <audio src={currentSource.value} controls className="w-full" />
                </div>
              )}
              {currentSource && isEmbedSource && (
                <iframe src={currentSource.value} className="w-full h-full min-h-[320px]" allow="autoplay; fullscreen" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="border border-border rounded p-2 bg-black/10">连续天数: <span className="font-bold text-text">{dailyProgress.streakDays}</span></div>
            <div className="border border-border rounded p-2 bg-black/10">累计时长: <span className="font-bold text-text">{totalHours}h {remainMinutes}m</span></div>
          </div>

          <div className="text-xs text-text-muted border border-border rounded p-3 bg-black/10">段位 {storyProgress.storyRank} · 还差 <span className="font-bold text-text">{storyProgress.rankNeed}</span> XP 升下一星，约再完成 <span className="font-bold text-text">{nearUpgradeSessions}</span> 次 25 分钟专注。</div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setActiveTab('rank')} className="py-2 rounded border border-border text-xs font-bold text-text hover:bg-white/5 transition">
              查看剧情进度
            </button>
            <button onClick={() => setActiveTab('museum')} className="py-2 rounded border border-border text-xs font-bold text-text hover:bg-white/5 transition">
              查看彩蛋收藏
            </button>
          </div>

          <div className="mt-2">
            {!isActive ? (
              <button onClick={handleStart} className="w-full py-3.5 rounded-theme bg-primary text-white font-bold text-lg flex items-center justify-center gap-2"><Play size={18} fill="currentColor" /> 开始专注</button>
            ) : (
              <div className="flex gap-3">
                <button onClick={isPaused ? handleResume : handlePause} className="flex-1 py-3 rounded-theme border border-primary text-primary font-bold flex items-center justify-center gap-2">{isPaused ? <Play size={18} /> : <Pause size={18} />} {isPaused ? '继续' : '暂停'}</button>
                <button onClick={() => finishSession(false)} className="px-4 rounded-theme bg-red-500/10 text-red-500 border border-red-500/40"><X size={20} /></button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
