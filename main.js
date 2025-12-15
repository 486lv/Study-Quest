// main.js (Nextron/Next.js Electron 模板的标准结构)

// 1. 核心模块引入 (确保 ipcMain, fs, path 都在这里)
const { app, BrowserWindow, ipcMain, shell } = require('electron'); 
const path = require('path');
const fs = require('fs'); // 文件读写
const isDev = process.env.NODE_ENV === 'development';
const serve = require('electron-serve'); // 用于加载 Next.js 页面
const loadURL = serve({ directory: 'out' }); // 你的 Next.js 静态文件输出目录

// ==========================================================
// 2. 🔥 【多用户存档系统 IPC 逻辑插入点】 🔥
// ==========================================================

// 获取 UserData 目录（安全且不会被卸载清除）
const userDataPath = app.getPath('userData');

// 辅助函数：获取文件路径
const getFilePath = (filename) => path.join(userDataPath, filename);

// 监听保存请求 (接收 filename 和 data 参数)
ipcMain.handle('save-data', async (event, filename, data) => {
  try {
    fs.writeFileSync(getFilePath(filename), data, 'utf-8');
    return { success: true };
  } catch (err) {
    console.error(`❌ [主进程] 保存失败 (${filename}):`, err);
    return { success: false, error: err.message };
  }
});

// 监听读取请求 (接收 filename 参数)
ipcMain.handle('load-data', async (event, filename) => {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (err) {
    console.error(`❌ [主进程] 读取失败 (${filename}):`, err);
    return null;
  }
});


// ==========================================================
// 3. 【原有的窗口创建和应用生命周期逻辑】
// ==========================================================

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Study Quest',
    webPreferences: {
      // 必须配置 preload 脚本的路径
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // 如果需要访问 Electron API
    },
  });

  // 加载 Next.js 页面
  if (isDev) {
    // 开发环境：使用 Next.js 开发服务器
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的静态文件
    loadURL(mainWindow);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 阻止应用创建多个实例
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}