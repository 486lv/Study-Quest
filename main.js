const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve');

// 🟢 核心魔法：使用 electron-serve 加载 out 文件夹
// 这样就不用担心相对路径问题了
const loadURL = serve({ directory: 'out' });

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // 隐藏菜单栏
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  // 🟢 加载页面
  // electron-serve 会自动处理 'app://' 协议
  loadURL(win);

  // 如果你想调试，可以把下面这行注释取消掉
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});