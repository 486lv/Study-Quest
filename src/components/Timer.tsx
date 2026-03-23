'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Music2,
  Pause,
  Play,
  Plus,
  Save,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Artifact, digForArtifact, RARITY_CONFIG } from '@/data/artifactSystem';

const PRESET_MINUTES = [15, 25, 45, 60];

const formatTime = (sec: number) => {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

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
    onboarding,
    setOnboardingStep,
    music,
    musicPlaylists,
    currentPlaylistId,
    setCurrentPlaylist,
    setCurrentSource,
    playNextPlaylistSource,
    playPrevPlaylistSource,
    setFocusSessionState,
  } = useStore();

  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [displaySeconds, setDisplaySeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [currentTag, setCurrentTag] = useState(customTags[0]?.name || 'Focus');
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ energy: 0, xp: 0 });
  const [newArtifact, setNewArtifact] = useState<Artifact | null>(null);

  const [showMusicDrawer, setShowMusicDrawer] = useState(true);
  const [previewSourceId, setPreviewSourceId] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const drawerScrollRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef(0);
  const pausedRef = useRef(0);
  const pauseStartRef = useRef(0);
  const initialTargetRef = useRef(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) setDisplaySeconds(mode === 'countdown' ? targetMinutes * 60 : 0);
  }, [targetMinutes, mode, isActive]);

  useEffect(() => {
    if (!customTags.find((t) => t.name === currentTag) && customTags[0]) {
      setCurrentTag(customTags[0].name);
    }
  }, [customTags, currentTag]);

  const currentPlaylist = useMemo(
    () => musicPlaylists.find((p) => p.id === currentPlaylistId) || musicPlaylists[0],
    [musicPlaylists, currentPlaylistId]
  );

  const scopedSources = useMemo(() => {
    if (!currentPlaylist) return music.library;
    const ids = new Set(currentPlaylist.sourceIds);
    return music.library.filter((item) => ids.has(item.id));
  }, [music.library, currentPlaylist]);

  useEffect(() => {
    const nextId = previewSourceId || music.currentSourceId;
    if (!nextId && scopedSources[0]) {
      setPreviewSourceId(scopedSources[0].id);
      return;
    }
    if (nextId && !scopedSources.some((item) => item.id === nextId)) {
      setPreviewSourceId(scopedSources[0]?.id || '');
    }
  }, [scopedSources, previewSourceId, music.currentSourceId]);

  const previewSource = useMemo(
    () => music.library.find((item) => item.id === previewSourceId) || null,
    [music.library, previewSourceId]
  );

  const previewIsEmbed = previewSource?.mediaKind === 'embed';
  const previewAudioSrc = previewSource?.mediaKind === 'audio' ? previewSource.value : '';

  useEffect(() => {
    const el = previewAudioRef.current;
    if (!el || !previewAudioSrc) return;
    if (previewPlaying) void el.play().catch(() => undefined);
    else el.pause();
  }, [previewPlaying, previewAudioSrc]);

  useEffect(() => () => previewAudioRef.current?.pause(), []);

  useEffect(() => {
    if (!showMusicDrawer) return;
    const el = drawerScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [showMusicDrawer]);

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

  const resetDisplay = () => {
    setDisplaySeconds(mode === 'countdown' ? targetMinutes * 60 : 0);
  };

  const resetRuntimeRefs = () => {
    startRef.current = 0;
    pausedRef.current = 0;
    pauseStartRef.current = 0;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setFocusSessionState('active');
    startRef.current = Date.now();
    pausedRef.current = 0;
    initialTargetRef.current = targetMinutes;

    if (!onboarding.completed && onboarding.step === 1) setOnboardingStep(2);
  };

  const handlePause = () => {
    setIsPaused(true);
    setFocusSessionState('paused');
    pauseStartRef.current = Date.now();
  };

  const handleResume = () => {
    setIsPaused(false);
    setFocusSessionState('active');
    pausedRef.current += Date.now() - pauseStartRef.current;
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
    setFocusSessionState('idle');

    if (actualMinutes >= 1) {
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
        setTimeout(() => setShowReward(false), 4500);
      }
    }

    resetRuntimeRefs();
    resetDisplay();
  };

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

  const totalFocusedMinutes = useMemo(
    () => sessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0),
    [sessions]
  );

  const totalHours = Math.floor(totalFocusedMinutes / 60);
  const remainMinutes = totalFocusedMinutes % 60;

  const selectPreviewSource = (id: string) => {
    setPreviewSourceId(id);
    setCurrentSource(id);
    setPreviewPlaying(false);
  };

  return (
    <div className="relative h-full min-h-0 grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-5">
      <section className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_18px_48px_rgba(0,0,0,0.22)] p-6 flex flex-col min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black">专注计时</div>
            <div className="text-xs text-text-muted mt-1">专注控制独立运行，音乐不跟开始/暂停按钮强绑定。</div>
          </div>
          <div className="inline-flex rounded-xl border border-white/20 bg-black/10 p-1">
            <button onClick={() => !isActive && setMode('countdown')} className={`px-3 py-1.5 text-xs rounded-lg ${mode === 'countdown' ? 'bg-primary text-white' : 'text-text-muted'}`}>
              倒计时
            </button>
            <button onClick={() => !isActive && setMode('stopwatch')} className={`px-3 py-1.5 text-xs rounded-lg ${mode === 'stopwatch' ? 'bg-primary text-white' : 'text-text-muted'}`}>
              正计时
            </button>
          </div>
        </div>

        {mode === 'countdown' && (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  disabled={isActive}
                  onClick={() => setTargetMinutes(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-40 ${targetMinutes === m ? 'border-primary bg-primary/15 text-primary' : 'border-white/20 text-text-muted'}`}
                >
                  {m} 分钟
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-text-muted">自定义</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  disabled={isActive}
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Math.min(180, Math.max(1, Number(e.target.value) || 25)))}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex-1 min-h-0 rounded-3xl border border-white/15 bg-black/20 flex items-center justify-center">
          <div className="text-center px-6 py-8">
            <div className="text-xs text-text-muted mb-2">{mode === 'countdown' ? '倒计时模式' : '正计时模式'}</div>
            <div className="text-[74px] leading-none md:text-[92px] font-black tabular-nums tracking-tight">{formatTime(displaySeconds)}</div>
            <div className="mt-3 text-sm text-text-muted">当前标签: <span className="font-semibold text-text">{currentTag}</span></div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!isActive && (
            <button onClick={handleStart} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
              <Play size={14} /> 开始专注
            </button>
          )}
          {isActive && !isPaused && (
            <button onClick={handlePause} className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold flex items-center gap-2">
              <Pause size={14} /> 暂停
            </button>
          )}
          {isActive && isPaused && (
            <button onClick={handleResume} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
              <Play size={14} /> 继续
            </button>
          )}
          {isActive && (
            <button onClick={() => finishSession(false)} className="rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 flex items-center gap-2">
              <X size={14} /> 结束
            </button>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_18px_48px_rgba(0,0,0,0.22)] p-4 pb-6 flex flex-col gap-4 min-h-0 overflow-hidden">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="text-xs text-text-muted">今日进度</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">完成场次: <span className="font-bold">{dailyProgress.focusSessions}</span></div>
            <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">连续天数: <span className="font-bold">{dailyProgress.streakDays}</span></div>
            <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">总专注: <span className="font-bold">{totalHours}h {remainMinutes}m</span></div>
            <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">升级还差: <span className="font-bold">{storyProgress.rankNeed} XP</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold">标签</div>
            <button onClick={() => setShowTagEditor((v) => !v)} className="text-xs text-text-muted hover:text-text">
              {showTagEditor ? '收起' : '编辑'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => setCurrentTag(tag.name)}
                className={`px-2.5 py-1 rounded-full text-xs border ${currentTag === tag.name ? 'border-primary bg-primary/15 text-primary' : 'border-white/20 text-text-muted'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {showTagEditor && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="新增标签" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                <button onClick={addTagInline} className="rounded-xl bg-primary px-3 py-2 text-white"><Plus size={14} /></button>
              </div>
              <div className="max-h-28 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                {customTags.map((tag) => (
                  <div key={`edit-${tag.name}`} className="rounded-xl border border-white/15 bg-black/10 p-2 flex items-center gap-2">
                    {editingTag === tag.name ? (
                      <>
                        <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs" />
                        <button onClick={() => saveRename(tag.name)} className="p-1 text-emerald-300"><Save size={13} /></button>
                        <button onClick={() => { setEditingTag(null); setEditingValue(''); }} className="p-1 text-text-muted"><X size={13} /></button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 text-xs truncate">{tag.name}</div>
                        <button onClick={() => { setEditingTag(tag.name); setEditingValue(tag.name); }} className="p-1 text-text-muted hover:text-text"><ArrowRight size={13} /></button>
                        <button onClick={() => deleteTag(tag.name)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-3 flex-1 min-h-0 flex flex-col overflow-hidden">
          <button onClick={() => setShowMusicDrawer((v) => !v)} className="w-full flex items-center justify-between text-left rounded-xl border border-white/15 bg-black/10 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-bold"><Music2 size={15} /> 专注音乐抽屉</span>
            {showMusicDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMusicDrawer && (
            <div
              ref={drawerScrollRef}
              className="mt-3 h-[520px] md:h-[560px] overflow-y-scroll pr-2 space-y-2"
              style={{ scrollbarGutter: 'stable both-edges' }}
            >
              <div className="rounded-xl border border-white/15 bg-black/10 p-2.5">
                <div className="text-xs text-text-muted">当前歌单</div>
                <div className="text-sm font-bold truncate">{currentPlaylist?.name || '默认歌单'}</div>
                <div className="text-xs text-text-muted mt-1">曲目 {scopedSources.length} · 预览与音乐库一致</div>
              </div>

              <div className="rounded-xl border border-white/15 bg-black/10 p-2.5 space-y-2">
                <div>
                  <div className="text-[11px] text-text-muted mb-1">选择歌单</div>
                  <select
                    value={currentPlaylist?.id || currentPlaylistId}
                    onChange={(e) => setCurrentPlaylist(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-2.5 py-2 text-sm text-text"
                  >
                    {musicPlaylists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id} className="bg-slate-900 text-white">
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-[11px] text-text-muted mb-1">选择歌曲</div>
                  <select
                    value={previewSourceId}
                    onChange={(e) => selectPreviewSource(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-2.5 py-2 text-sm text-text"
                    disabled={!scopedSources.length}
                  >
                    {scopedSources.map((item) => (
                      <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playPrevPlaylistSource();
                    const ids = scopedSources.map((s) => s.id);
                    const currentIdx = ids.indexOf(previewSourceId);
                    const nextIdx = currentIdx <= 0 ? ids.length - 1 : currentIdx - 1;
                    if (ids[nextIdx]) setPreviewSourceId(ids[nextIdx]);
                  }}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs flex items-center gap-1"
                  disabled={!scopedSources.length}
                >
                  <SkipBack size={13} /> 上一首
                </button>
                <button
                  onClick={() => {
                    playNextPlaylistSource();
                    const ids = scopedSources.map((s) => s.id);
                    const currentIdx = ids.indexOf(previewSourceId);
                    const nextIdx = currentIdx < 0 || currentIdx >= ids.length - 1 ? 0 : currentIdx + 1;
                    if (ids[nextIdx]) setPreviewSourceId(ids[nextIdx]);
                  }}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs flex items-center gap-1"
                  disabled={!scopedSources.length}
                >
                  下一首 <SkipForward size={13} />
                </button>
              </div>

              <div className="space-y-1.5 pb-2">
                {scopedSources.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectPreviewSource(item.id)}
                    className={`w-full text-left rounded-xl border px-2.5 py-2 ${previewSourceId === item.id ? 'border-primary bg-primary/15' : 'border-white/20 bg-white/5'}`}
                  >
                    <div className="text-xs font-semibold truncate">{item.title}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{item.type} · {item.mediaKind === 'audio' ? '音频' : '嵌入播放器'}</div>
                  </button>
                ))}
                {scopedSources.length === 0 && <div className="text-xs text-text-muted px-1 py-2">这个歌单还没有曲目</div>}
              </div>

              <div className="rounded-xl border border-white/15 bg-black/20 overflow-visible">
                <div className="px-3 pt-3 pb-2">
                  <div className="text-xs text-text-muted">当前预览</div>
                  <div className="text-sm font-semibold truncate">{previewSource?.title || '未选择曲目'}</div>
                </div>

                {!previewIsEmbed && (
                  <div className="px-3 pb-2">
                    <button onClick={() => setPreviewPlaying((v) => !v)} disabled={!previewSource} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40 flex items-center gap-2">
                      {previewPlaying ? <Pause size={13} /> : <Play size={13} />} {previewPlaying ? '暂停预览' : '播放预览'}
                    </button>
                  </div>
                )}

                <div className="h-[360px] md:h-[420px] px-3 pb-4">
                  <div className="h-full rounded-xl border border-white/15 bg-black/30 overflow-hidden">
                    {!previewIsEmbed && (
                      <div className="h-full flex items-center justify-center p-3">
                        <audio ref={previewAudioRef} src={previewAudioSrc} controls className="w-full" />
                      </div>
                    )}
                    {previewIsEmbed && previewSource?.value && <iframe src={previewSource.value} className="w-full h-full min-h-[320px]" allow="autoplay; fullscreen" />}
                    {!previewSource && <div className="h-full flex items-center justify-center text-sm text-text-muted">先选择一首曲目</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {showReward && (
        <div className="absolute right-3 bottom-3 z-20 rounded-2xl border border-emerald-400/40 bg-emerald-900/30 backdrop-blur-md p-4 w-[300px] shadow-xl">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-emerald-300 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-emerald-200">本次专注已记录</div>
              <div className="text-xs text-emerald-100/80 mt-1">+{rewardData.energy} 能量 · +{rewardData.xp} XP</div>
              {newArtifact && (
                <div className="mt-2 rounded-lg border border-white/20 bg-black/20 p-2">
                  <div className="text-xs font-bold" style={{ color: RARITY_CONFIG[newArtifact.rarity].color }}>
                    {RARITY_CONFIG[newArtifact.rarity].label} · {newArtifact.name}
                  </div>
                  <div className="text-[11px] text-emerald-100/80 mt-1 line-clamp-2">{newArtifact.description}</div>
                </div>
              )}
            </div>
            <button onClick={() => setShowReward(false)} className="text-emerald-100/70 hover:text-white"><X size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
