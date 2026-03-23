'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ChevronDown, ChevronUp, Link2, ListMusic, Music2, Pause, Play, Plus, Trash2, Upload } from 'lucide-react';

type MusicImportType = 'local' | 'url';

type ParsedMedia = {
  type: 'url' | 'bilibili' | 'youtube' | 'netease';
  mediaKind: 'audio' | 'embed';
  value: string;
  raw: string;
};

type MetaInfo = {
  ok: boolean;
  title?: string;
  bvid?: string;
  aid?: string;
  durationSec?: number;
};

const parseBiliIds = (url: string) => {
  const bvid = url.match(/BV[0-9A-Za-z]+/i)?.[0];
  const aid = url.match(/(?:av)(\d+)/i)?.[1];
  return { bvid, aid };
};

const fetchJsonp = <T,>(url: string, timeoutMs = 6000): Promise<T | null> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const cb = `__sq_cb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      try { delete (window as any)[cb]; } catch {}
      script.remove();
      resolve(null);
    }, timeoutMs);
    (window as any)[cb] = (data: T) => {
      window.clearTimeout(timer);
      try { delete (window as any)[cb]; } catch {}
      script.remove();
      resolve(data);
    };
    script.src = `${url}${url.includes('?') ? '&' : '?'}jsonp=jsonp&callback=${cb}`;
    script.onerror = () => {
      window.clearTimeout(timer);
      try { delete (window as any)[cb]; } catch {}
      script.remove();
      resolve(null);
    };
    document.body.appendChild(script);
  });

const buildBiliEmbed = (id: { bvid?: string; aid?: string }) => {
  if (id.bvid) return `https://player.bilibili.com/player.html?bvid=${id.bvid}&page=1&high_quality=1&as_wide=1`;
  if (id.aid) return `https://player.bilibili.com/player.html?aid=${id.aid}&page=1&high_quality=1&as_wide=1`;
  return '';
};

const parseUnifiedMedia = (raw: string): ParsedMedia | null => {
  const input = raw.trim();
  if (!input || !/^https?:\/\//i.test(input)) return null;
  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase();
    const bvid = input.match(/BV[0-9A-Za-z]+/i)?.[0];
    const av = input.match(/(?:av)(\d+)/i)?.[1];

    if (host.includes('bilibili.com') || host.includes('b23.tv') || bvid || av) {
      return {
        type: 'bilibili',
        mediaKind: 'embed',
        value: buildBiliEmbed({ bvid, aid: av }) || input,
        raw: input,
      };
    }

    const yt = u.searchParams.get('v') || (host.includes('youtu.be') ? u.pathname.replace('/', '') : '');
    if ((host.includes('youtube.com') || host.includes('youtu.be')) && yt) {
      return { type: 'youtube', mediaKind: 'embed', value: `https://www.youtube.com/embed/${yt}`, raw: input };
    }

    if (host.includes('music.163.com')) {
      const id = u.searchParams.get('id') || input.match(/song\/(\d+)/)?.[1];
      if (!id) return null;
      return {
        type: 'netease',
        mediaKind: 'embed',
        value: `https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=86`,
        raw: input,
      };
    }

    const isAudioLike = /\.(mp3|wav|m4a|flac|ogg)(\?|#|$)/i.test(u.pathname);
    if (isAudioLike) return { type: 'url', mediaKind: 'audio', value: input, raw: input };
    return { type: 'url', mediaKind: 'embed', value: input, raw: input };
  } catch {
    return null;
  }
};

const fetchMediaMeta = async (url: string): Promise<MetaInfo | null> => {
  if (typeof window !== 'undefined' && window.electronAPI?.fetchMediaMeta) {
    try {
      const viaIpc = await window.electronAPI.fetchMediaMeta(url);
      if (viaIpc?.ok) return viaIpc as MetaInfo;
    } catch {}
  }

  if (/bilibili\.com|b23\.tv/i.test(url)) {
    const { bvid, aid } = parseBiliIds(url);
    if (bvid || aid) {
      const api = bvid
        ? `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`
        : `https://api.bilibili.com/x/web-interface/view?aid=${encodeURIComponent(aid || '')}`;
      const payload = await fetchJsonp<any>(api);
      const data = payload?.data;
      if (payload?.code === 0 && data) {
        return {
          ok: true,
          title: String(data.title || '').trim(),
          bvid: String(data.bvid || bvid || ''),
          aid: data.aid ? String(data.aid) : aid,
          durationSec: Number(data.duration) || undefined,
        };
      }
    }
  }
  return null;
};

const resolveMediaForSubmit = async (parsed: ParsedMedia): Promise<ParsedMedia> => {
  if (parsed.type !== 'bilibili' || parsed.value.includes('player.bilibili.com')) return parsed;
  const meta = await fetchMediaMeta(parsed.raw);
  if (!meta?.ok) return parsed;
  const embed = buildBiliEmbed({ bvid: meta.bvid, aid: meta.aid });
  return embed ? { ...parsed, value: embed } : parsed;
};

const detectTitleFromLink = async (parsed: ParsedMedia) => {
  const meta = await fetchMediaMeta(parsed.raw);
  if (meta?.ok && meta.title) return meta.title;
  if (parsed.type === 'bilibili') {
    const bvid = parsed.raw.match(/BV[0-9A-Za-z]+/i)?.[0];
    if (bvid) return bvid.toUpperCase();
  }
  try {
    const u = new URL(parsed.raw);
    const seg = decodeURIComponent(
      u.pathname
        .split('/')
        .filter(Boolean)
        .pop() || ''
    ).replace(/\.[a-z0-9]+$/i, '');
    if (seg) return seg;
    return (u.searchParams.get('title') || u.searchParams.get('name') || '').trim();
  } catch {
    return '';
  }
};

export default function MusicLibrary() {
  const {
    music,
    focusSessionState,
    musicPlaylists,
    currentPlaylistId,
    addMusicSource,
    removeMusicSource,
    createMusicPlaylist,
    deleteMusicPlaylist,
    setCurrentPlaylist,
    addSourceToPlaylist,
    removeSourceFromPlaylist,
  } = useStore();

  const [musicType, setMusicType] = useState<MusicImportType>('local');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicValue, setMusicValue] = useState('');
  const [musicError, setMusicError] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);

  const [previewSourceId, setPreviewSourceId] = useState<string>('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const focusLocked = focusSessionState !== 'idle';

  const currentPlaylist = useMemo(
    () => musicPlaylists.find((p) => p.id === currentPlaylistId) || musicPlaylists[0],
    [musicPlaylists, currentPlaylistId]
  );

  const scopedLibrary = useMemo(() => {
    if (!currentPlaylist) return music.library;
    const ids = new Set(currentPlaylist.sourceIds);
    return music.library.filter((item) => ids.has(item.id));
  }, [music.library, currentPlaylist]);

  useEffect(() => {
    if (!previewSourceId && scopedLibrary[0]) setPreviewSourceId(scopedLibrary[0].id);
  }, [previewSourceId, scopedLibrary]);

  const previewSource = useMemo(
    () => music.library.find((item) => item.id === previewSourceId) || null,
    [music.library, previewSourceId]
  );

  const previewIsEmbed = previewSource?.mediaKind === 'embed';
  const previewAudioSrc = previewSource?.mediaKind === 'audio' ? previewSource.value : '';

  useEffect(() => {
    const el = previewAudioRef.current;
    if (!el || !previewAudioSrc) return;
    if (previewPlaying) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [previewPlaying, previewAudioSrc]);

  useEffect(() => () => previewAudioRef.current?.pause(), []);

  const handleMusicSubmit = async () => {
    setMusicError('');
    if (musicType === 'local') {
      fileInputRef.current?.click();
      return;
    }

    const parsed = parseUnifiedMedia(musicValue);
    if (!parsed) {
      setMusicError('链接无法识别。支持：B站 / YouTube / 网易云歌曲页 / 音频直链。');
      return;
    }

    const meta = await fetchMediaMeta(parsed.raw);
    const resolved = parsed.type === 'bilibili' && !parsed.value.includes('player.bilibili.com')
      ? (() => {
          const embed = buildBiliEmbed({ bvid: meta?.bvid, aid: meta?.aid });
          return embed ? { ...parsed, value: embed } : parsed;
        })()
      : parsed;
    const autoTitle = musicTitle.trim() ? '' : (meta?.title || await detectTitleFromLink(resolved));
    const title = (musicTitle || autoTitle || musicValue || '未命名音轨').trim();

    addMusicSource({
      type: resolved.type,
      mediaKind: resolved.mediaKind,
      title,
      value: resolved.value,
      durationSec: meta?.durationSec,
    });
    setMusicTitle('');
    setMusicValue('');
    setShowImportPanel(false);
  };

  const onLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setMusicError('请选择音频文件。');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMusicError('本地音频需小于 8MB。');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      addMusicSource({
        type: 'local',
        mediaKind: 'audio',
        title: musicTitle.trim() || file.name,
        value: String(reader.result || ''),
      });
      setMusicTitle('');
      setMusicValue('');
      setMusicError('');
      setShowImportPanel(false);
    };
    reader.onerror = () => setMusicError('本地文件读取失败。');
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
      <section className="min-h-0 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_18px_48px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden">
        <div className="shrink-0 px-5 py-4 border-b border-white/15">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-black flex items-center gap-2">
                <Music2 size={18} />
                {currentPlaylist?.name || '默认歌单'}
              </div>
              <div className="text-xs text-text-muted mt-1">当前歌单：{currentPlaylist?.name || '默认歌单'} · 曲目 {scopedLibrary.length}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPlaylistPanel((v) => !v)} className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-text">
                歌单管理 {showPlaylistPanel ? <ChevronUp size={13} className="inline ml-1" /> : <ChevronDown size={13} className="inline ml-1" />}
              </button>
              <button onClick={() => setShowImportPanel((v) => !v)} className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-text">
                导入 {showImportPanel ? <ChevronUp size={13} className="inline ml-1" /> : <ChevronDown size={13} className="inline ml-1" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {showPlaylistPanel && (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="text-xs font-bold mb-2 flex items-center gap-1"><ListMusic size={12} />歌单管理</div>
              <div className="flex gap-2 mb-2">
                <input value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} placeholder="新歌单名" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted" />
                <button disabled={focusLocked} onClick={() => { if (!playlistName.trim()) return; createMusicPlaylist(playlistName.trim()); setPlaylistName(''); }} className="rounded-xl bg-primary px-3 text-white disabled:opacity-40"><Plus size={14} /></button>
              </div>
              <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {musicPlaylists.map((p) => (
                  <div key={p.id} className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${p.id === currentPlaylistId ? 'border-primary bg-primary/15' : 'border-white/20 bg-white/5'}`}>
                    <button disabled={focusLocked} onClick={() => setCurrentPlaylist(p.id)} className="flex-1 text-left min-w-0 disabled:opacity-40"><div className="text-xs font-semibold truncate">{p.name}</div></button>
                    <span className="text-[10px] text-text-muted">{p.sourceIds.length}</span>
                    <button disabled={focusLocked} onClick={() => deleteMusicPlaylist(p.id)} className="text-red-400 hover:text-red-300 p-1 disabled:opacity-40"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showImportPanel && (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(['local', 'url'] as MusicImportType[]).map((t) => (
                  <button key={t} onClick={() => setMusicType(t)} className={`rounded-xl border py-2 text-xs ${musicType === t ? 'border-primary bg-primary/15 text-primary' : 'border-white/20 text-text-muted bg-white/5'}`}>
                    {t === 'local' ? '本地导入' : '链接解析'}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <input value={musicTitle} onChange={(e) => setMusicTitle(e.target.value)} placeholder="曲目名（可选，不填自动识别）" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted" />
                {musicType === 'url' && <input value={musicValue} onChange={(e) => setMusicValue(e.target.value)} placeholder="粘贴链接（B站 / YouTube / 网易云 / 音频直链）" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted" />}
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onLocalFileChange} />
                {musicError && <div className="text-xs text-red-400">{musicError}</div>}
                <button disabled={focusLocked} onClick={handleMusicSubmit} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white flex items-center gap-2 disabled:opacity-40">
                  {musicType === 'local' ? <Upload size={14} /> : <Link2 size={14} />}导入到音乐库
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs text-text-muted mb-2">当前歌单曲目</div>
            <div className="max-h-[56vh] overflow-y-auto custom-scrollbar pr-1 space-y-2">
              {scopedLibrary.map((item) => (
                <div key={item.id} className={`rounded-xl border p-2.5 ${previewSourceId === item.id ? 'border-primary bg-primary/12' : 'border-white/20 bg-white/5'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <button onClick={() => { setPreviewSourceId(item.id); setPreviewPlaying(false); }} className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-semibold truncate">{item.title}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{item.type} · {item.mediaKind === 'audio' ? '音频' : '嵌入播放器'}</div>
                    </button>
                    <button disabled={focusLocked} onClick={() => removeMusicSource(item.id)} className="text-red-400 hover:text-red-300 p-1 disabled:opacity-40"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {musicPlaylists.map((playlist) => {
                      const inList = playlist.sourceIds.includes(item.id);
                      return (
                        <button
                          key={`${item.id}-${playlist.id}`}
                          disabled={focusLocked}
                          onClick={() => inList ? removeSourceFromPlaylist(playlist.id, item.id) : addSourceToPlaylist(playlist.id, item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] border disabled:opacity-40 ${inList ? 'border-emerald-400/60 text-emerald-300 bg-emerald-500/10' : 'border-white/20 text-text-muted'}`}
                        >
                          {playlist.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {scopedLibrary.length === 0 && <div className="h-24 flex items-center justify-center text-sm text-text-muted">这个歌单还没有曲目</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_18px_48px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden">
        <div className="shrink-0 px-4 py-3 border-b border-white/15">
          <div className="text-sm font-bold">音乐库预览</div>
          <div className="text-xs text-text-muted mt-1">仅用于试听，不影响专注播放。</div>
        </div>
        <div className="p-4 space-y-3">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs text-text-muted">当前预览</div>
            <div className="text-sm font-bold truncate">{previewSource?.title || '未选择'}</div>
          </div>
          {!previewIsEmbed && (
            <button onClick={() => setPreviewPlaying((v) => !v)} disabled={!previewSource} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40 flex items-center gap-2">
              {previewPlaying ? <Pause size={14} /> : <Play size={14} />}{previewPlaying ? '暂停预览' : '播放预览'}
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 px-4 pb-4">
          <div className="h-full rounded-2xl border border-white/15 bg-black/20 overflow-auto custom-scrollbar">
            {!previewIsEmbed && <div className="h-full min-h-[220px] flex items-center justify-center p-4"><audio ref={previewAudioRef} src={previewAudioSrc} controls className="w-full" /></div>}
            {previewIsEmbed && previewSource?.value && <iframe src={previewSource.value} className="w-full h-full min-h-[320px]" allow="autoplay; fullscreen" />}
            {!previewSource && <div className="h-full min-h-[220px] flex items-center justify-center text-sm text-text-muted">先在左侧选一首歌</div>}
          </div>
        </div>
      </section>
    </div>
  );
}


