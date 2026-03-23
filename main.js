const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';
const serve = require('electron-serve');
const loadURL = serve({ directory: 'out' });
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const userDataPath = app.getPath('userData');
const getFilePath = (filename) => path.join(userDataPath, filename);
const appIconPath = path.join(__dirname, 'assets', 'icon.ico');

let mainWindow;
let tray;
let minimizeToTray = true;
let quitting = false;

const ensureTray = () => {
  if (tray) return;
  const icon = fs.existsSync(appIconPath) ? nativeImage.createFromPath(appIconPath) : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Study Quest');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '显示主界面', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
      { label: '退出', click: () => { quitting = true; app.quit(); } },
    ])
  );
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};

const clearDevCacheDir = () => {
  const cacheDir = path.join(app.getAppPath(), '.next', 'cache');
  try {
    if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchJson = async (url) => {
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': 'StudyQuest/2.3' },
      redirect: 'follow',
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

const resolveFinalUrl = async (raw) => {
  try {
    const r = await fetch(raw, {
      method: 'GET',
      headers: { 'user-agent': 'StudyQuest/2.3' },
      redirect: 'follow',
    });
    return r.url || raw;
  } catch {
    return raw;
  }
};

const fetchMediaMetaLocal = async (rawUrl) => {
  const raw = String(rawUrl || '').trim();
  if (!raw) return { ok: false, reason: 'missing_url' };

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }

  const host = parsed.hostname.toLowerCase();

  if (host.includes('bilibili.com') || host.includes('b23.tv')) {
    const finalUrl = await resolveFinalUrl(raw);
    const bvid = finalUrl.match(/BV[0-9A-Za-z]+/i)?.[0] || '';
    const aid = finalUrl.match(/(?:av)(\d+)/i)?.[1] || '';
    let title = '';
    let durationSec;

    const pickDurationFromView = (data) => {
      const d = Number(data?.data?.duration) || 0;
      return d > 0 ? d : 0;
    };
    const pickDurationFromPagelist = (data) => {
      const d = Number(data?.data?.[0]?.duration) || 0;
      return d > 0 ? d : 0;
    };

    if (bvid) {
      const view = await fetchJson(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
      title = view?.data?.title ? String(view.data.title) : '';
      durationSec = pickDurationFromView(view) || undefined;
      if (!durationSec) {
        const pagelist = await fetchJson(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`);
        const d = pickDurationFromPagelist(pagelist);
        if (d > 0) durationSec = d;
      }
    } else if (aid) {
      const view = await fetchJson(`https://api.bilibili.com/x/web-interface/view?aid=${aid}`);
      title = view?.data?.title ? String(view.data.title) : '';
      durationSec = pickDurationFromView(view) || undefined;
      if (!durationSec) {
        const pagelist = await fetchJson(`https://api.bilibili.com/x/player/pagelist?aid=${aid}`);
        const d = pickDurationFromPagelist(pagelist);
        if (d > 0) durationSec = d;
      }
    }

    if (!durationSec) {
      return {
        ok: false,
        reason: 'bilibili_duration_unavailable',
        type: 'bilibili',
        title: title || (bvid ? `B站 ${bvid}` : aid ? `B站 av${aid}` : 'B站视频'),
        bvid,
        aid,
        resolvedUrl: finalUrl,
      };
    }

    return {
      ok: true,
      type: 'bilibili',
      title: title || (bvid ? `B站 ${bvid}` : aid ? `B站 av${aid}` : 'B站视频'),
      bvid,
      aid,
      durationSec,
      resolvedUrl: finalUrl,
    };
  }

  if (host.includes('music.163.com')) {
    const id = parsed.searchParams.get('id') || raw.match(/song\/(\d+)/)?.[1] || '';
    let durationSec;
    if (id) {
      const detail = await fetchJson(`https://music.163.com/api/song/detail/?ids=[${id}]`);
      const ms = Number(detail?.songs?.[0]?.duration) || 0;
      if (ms > 0) durationSec = Math.floor(ms / 1000);
    }
    if (!durationSec) {
      return {
        ok: false,
        reason: 'netease_duration_unavailable',
        type: 'netease',
        title: id ? `网易云 ${id}` : '网易云音乐',
        resolvedUrl: raw,
      };
    }
    return {
      ok: true,
      type: 'netease',
      title: id ? `网易云 ${id}` : '网易云音乐',
      durationSec,
      resolvedUrl: raw,
    };
  }

  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    const y = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent(raw)}&format=json`);
    return {
      ok: true,
      type: 'youtube',
      title: y?.title ? String(y.title) : 'YouTube 视频',
      resolvedUrl: raw,
    };
  }

  return { ok: true, type: 'url', title: raw, resolvedUrl: raw };
};

ipcMain.handle('save-data', async (_event, filename, data) => {
  try {
    fs.writeFileSync(getFilePath(filename), data, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-data', async (_event, filename) => {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
    return null;
  } catch {
    return null;
  }
});

ipcMain.handle('notify', async (_event, title, body) => {
  try {
    if (Notification.isSupported()) new Notification({ title, body }).show();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-auto-launch', async (_event, enabled) => {
  try {
    app.setLoginItemSettings({ openAtLogin: !!enabled });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-minimize-to-tray', async (_event, enabled) => {
  minimizeToTray = !!enabled;
  return { success: true };
});

ipcMain.handle('get-app-info', async () => ({
  version: app.getVersion(),
  platform: process.platform,
}));

ipcMain.handle('clear-dev-cache', async () => clearDevCacheDir());
ipcMain.handle('fetch-media-meta', async (_event, url) => fetchMediaMetaLocal(url));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Study Quest',
    icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
    },
  });

  ensureTray();
  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.on('close', (e) => {
    if (!quitting && minimizeToTray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    loadURL(mainWindow);
  }

  mainWindow.webContents.on('did-fail-load', () => {
    clearDevCacheDir();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('before-quit', () => {
  quitting = true;
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
