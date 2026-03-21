const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
  loadData: (filename) => ipcRenderer.invoke('load-data', filename),
  notify: (title, body) => ipcRenderer.invoke('notify', title, body),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  setMinimizeToTray: (enabled) => ipcRenderer.invoke('set-minimize-to-tray', enabled),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  clearDevCache: () => ipcRenderer.invoke('clear-dev-cache'),
});
