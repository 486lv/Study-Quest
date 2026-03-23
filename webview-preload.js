const { ipcRenderer } = require('electron');

const send = (channel, payload) => {
  try {
    ipcRenderer.sendToHost(channel, payload);
  } catch {
    // Ignore host messaging failures.
  }
};

let activeMedia = null;
let endedSentByOverlay = false;
let lastProgressAt = 0;

const reportProgress = (media) => {
  if (!media) return;
  lastProgressAt = Date.now();
  send('media-progress', {
    currentTime: Number.isFinite(media.currentTime) ? media.currentTime : 0,
    duration: Number.isFinite(media.duration) ? media.duration : 0,
  });
};

const bindMediaElement = (media) => {
  if (!media || media.dataset.studyQuestBound === '1') return;
  media.dataset.studyQuestBound = '1';

  const markActive = () => {
    activeMedia = media;
  };

  media.addEventListener('loadedmetadata', () => {
    markActive();
    reportProgress(media);
  });
  media.addEventListener('timeupdate', () => {
    markActive();
    reportProgress(media);
  });
  media.addEventListener('play', () => {
    endedSentByOverlay = false;
    markActive();
    reportProgress(media);
  });
  media.addEventListener('pause', () => {
    reportProgress(media);
  });
  media.addEventListener('ended', () => {
    reportProgress(media);
    const duration = Number.isFinite(media.duration) ? media.duration : 0;
    const current = Number.isFinite(media.currentTime) ? media.currentTime : 0;
    if (duration > 20 && current >= duration * 0.9) {
      send('media-ended', { source: 'html-media' });
      endedSentByOverlay = true;
    }
  });
};

const collectMediaDeep = () => {
  const list = [];
  const visited = new Set();
  const walk = (root) => {
    if (!root || visited.has(root)) return;
    visited.add(root);
    const media = root.querySelectorAll('audio, video');
    for (const m of media) list.push(m);
    const all = root.querySelectorAll('*');
    for (const el of all) {
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
  return list;
};

const collectElementsDeep = () => {
  const out = [];
  const visited = new Set();
  const walk = (root) => {
    if (!root || visited.has(root)) return;
    visited.add(root);
    const all = root.querySelectorAll('*');
    for (const el of all) {
      out.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
  return out;
};

const tryStartPlayback = (media) => {
  if (!media) return;
  if (typeof media.play !== 'function') return;
  if (!media.paused) return;
  if (media.readyState < 2) return;
  Promise.resolve(media.play()).catch(() => {
    // Some providers block scripted play; keep trying on later scans.
  });
};

const isVisibleNode = (el) => {
  if (!el || !(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width < 14 || rect.height < 14) return false;
  if (rect.bottom < 0 || rect.right < 0) return false;
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  if (rect.left > vw || rect.top > vh) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
};

const hasReplaySignal = (el) => {
  if (!(el instanceof HTMLElement) || !isVisibleNode(el)) return false;
  const text = (el.textContent || '').toLowerCase().trim();
  const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
  const title = (el.getAttribute('title') || '').toLowerCase();
  const aria = (el.getAttribute('aria-label') || '').toLowerCase();
  const dataTip = (el.getAttribute('data-tooltip') || '').toLowerCase();
  const joined = `${text} ${cls} ${title} ${aria} ${dataTip}`;
  if (!joined) return false;
  return (
    joined.includes('replay') ||
    joined.includes('watch again') ||
    joined.includes('restart') ||
    joined.includes('ending') ||
    joined.includes('ended') ||
    joined.includes('\u91cd\u64ad') ||
    joined.includes('\u91cd\u65b0\u64ad\u653e') ||
    joined.includes('\u91cd\u65b0\u89c2\u770b')
  );
};

const detectReplayOverlay = () => {
  const now = Date.now();
  const stagnantSec = lastProgressAt > 0 ? Math.floor((now - lastProgressAt) / 1000) : 0;
  if (stagnantSec < 4) return false;

  const nodes = collectElementsDeep();
  for (const node of nodes) {
    if (hasReplaySignal(node)) return true;
  }
  return false;
};

const scanAndMaintain = () => {
  const list = collectMediaDeep();
  if (!list.length) {
    if (!endedSentByOverlay && detectReplayOverlay()) {
      endedSentByOverlay = true;
      send('media-ended', { source: 'ui-replay-no-media' });
    }
    return;
  }

  list.forEach((node) => bindMediaElement(node));

  const playing = list.find((node) => !node.paused);
  const target = playing || activeMedia || list[0];
  if (!target) return;

  activeMedia = target;
  reportProgress(target);
  tryStartPlayback(target);

  if (!endedSentByOverlay && detectReplayOverlay()) {
    endedSentByOverlay = true;
    send('media-ended', { source: 'ui-replay' });
  }
};

const tryHandleStructuredMessage = (payload) => {
  if (!payload || typeof payload !== 'object') return false;

  if (payload.event === 'onStateChange' && payload.info === 0) {
    send('media-ended', { source: 'youtube-postmessage' });
    return true;
  }

  if (payload.event === 'infoDelivery' && payload.info && typeof payload.info.currentTime === 'number') {
    send('media-progress', {
      currentTime: payload.info.currentTime || 0,
      duration: payload.info.duration || 0,
    });
    return true;
  }

  return false;
};

window.addEventListener('message', (event) => {
  const raw = event.data;
  if (!raw) return;

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (tryHandleStructuredMessage(parsed)) return;
    } catch {
      if (/ended|finish|complete/i.test(raw)) {
        send('media-ended', { source: 'string-message' });
      }
    }
    return;
  }

  tryHandleStructuredMessage(raw);
});

window.addEventListener('DOMContentLoaded', () => {
  endedSentByOverlay = false;
  lastProgressAt = Date.now();
  scanAndMaintain();

  const observer = new MutationObserver(() => scanAndMaintain());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setInterval(() => scanAndMaintain(), 1200);
});
