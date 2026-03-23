const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
  loadData: (filename) => ipcRenderer.invoke('load-data', filename),
  notify: (title, body) => ipcRenderer.invoke('notify', title, body),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  setMinimizeToTray: (enabled) => ipcRenderer.invoke('set-minimize-to-tray', enabled),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  clearDevCache: () => ipcRenderer.invoke('clear-dev-cache'),
  webviewPreloadPath: pathToFileURL(path.join(__dirname, 'webview-preload.js')).toString(),
  fetchMediaMeta: (url) => ipcRenderer.invoke('fetch-media-meta', url),
});

