const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';
const serve = require('electron-serve');
const loadURL = serve({ directory: 'out' });

const userDataPath = app.getPath('userData');
const getFilePath = (filename) => path.join(userDataPath, filename);

let mainWindow;
let tray;
let minimizeToTray = true;
let quitting = false;

const ensureTray = () => {
  if (tray) return;
  const iconPath = path.join(__dirname, 'node_modules', 'app-builder-lib', 'templates', 'icons', 'proton-native', 'proton-native.ico');
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Study Quest',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
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
