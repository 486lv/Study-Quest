// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 保存：需要文件名和数据
  saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
  // 读取：需要文件名
  loadData: (filename) => ipcRenderer.invoke('load-data', filename),
});