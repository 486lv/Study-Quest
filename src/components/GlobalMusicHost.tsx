'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import type { MusicSource } from '@/store/useStore';

const isEmbedSource = (source?: MusicSource | null) =>
  !!source && (source.mediaKind === 'embed' || ['bilibili', 'youtube', 'netease'].includes(source.type));

const isAudioSource = (source?: MusicSource | null) => !!source && !isEmbedSource(source);

const appendQuery = (url: string, key: string, value: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    return url;
  }
};

export default function GlobalMusicHost() {
  const { music, focusSessionState, setMusicProgress } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [embedTick, setEmbedTick] = useState(0);

  const focusShouldPlay = focusSessionState === 'active' && music.isPlaying;

  const currentSource = useMemo(
    () => music.library.find((item) => item.id === music.currentSourceId) || null,
    [music.library, music.currentSourceId]
  );

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!currentSource || !isAudioSource(currentSource)) {
      el.pause();
      el.removeAttribute('src');
      el.load();
      setMusicProgress(0, 0);
      return;
    }

    if (el.dataset.sourceId !== currentSource.id) {
      el.src = currentSource.value;
      el.dataset.sourceId = currentSource.id;
      el.load();
    }
    el.volume = music.volume;

    if (focusShouldPlay) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [currentSource, focusShouldPlay, music.volume, setMusicProgress]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      setMusicProgress(el.currentTime || 0, Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onLoaded = () => {
      setMusicProgress(el.currentTime || 0, Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onEnded = () => {
      setMusicProgress(el.duration || 0, el.duration || 0);
      // Manual switching only: do not auto-next.
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('ended', onEnded);
    };
  }, [setMusicProgress]);

  useEffect(() => {
    if (focusShouldPlay && isEmbedSource(currentSource)) setEmbedTick(Date.now());
    if (!focusShouldPlay) setMusicProgress(0, 0);
  }, [focusShouldPlay, currentSource?.id, setMusicProgress]);

  const embedSrc = useMemo(() => {
    if (!currentSource || !isEmbedSource(currentSource) || !focusShouldPlay) return '';
    let src = appendQuery(currentSource.value, 'autoplay', '1');
    if (currentSource.type === 'youtube') src = appendQuery(src, 'enablejsapi', '1');
    src = appendQuery(src, 't', `${embedTick || Date.now()}`);
    return src;
  }, [currentSource, focusShouldPlay, embedTick]);

  return (
    <div aria-hidden className="fixed -left-[9999px] -top-[9999px] w-px h-px opacity-0 pointer-events-none overflow-hidden">
      <audio ref={audioRef} preload="auto" />
      {embedSrc && <iframe src={embedSrc} className="w-px h-px border-0" allow="autoplay; fullscreen" />}
    </div>
  );
}
