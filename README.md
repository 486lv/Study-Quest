# Study Quest (v2.3.0)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.3.0-5b8cff.svg)
![Platform](https://img.shields.io/badge/platform-Windows-4b6bff.svg)

Study Quest 是一个本地优先的专注成长应用：番茄专注、剧情推进、彩蛋收藏、待办管理、音乐库都在同一个桌面 App 中完成。

## v2.3.0 更新内容

- 专注页音乐区改为播放器展示，不再使用仅展示进度条。
- 音乐系统支持本地导入、链接解析、歌单管理与专注联动。
- 新增独立音乐库界面，支持曲目浏览与预览。
- 待办功能增强（筛选、日历联动、编辑与状态管理）。
- 本地单档模式持续优化：重启后数据持久化保留。

## 核心功能

- 专注计时：倒计时 / 正计时、标签管理、专注结算。
- 剧情成长：段位与章节推进、持续更新型剧情结构。
- 彩蛋收藏：专注过程触发彩蛋，收藏可回看。
- 商城系统：库存、兑换、记录状态。
- 待办系统：任务列表 + 月历视图联动。
- 音乐系统：歌单、曲目选择、专注内播放。

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Electron + IPC 本地存储
- Zustand（状态管理）
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

## 打包 Windows 安装包（EXE）

```bash
npm run dist:clean
```

打包产物目录：

```text
dist/
```

常见命令：

```bash
npm run clean:cache   # 清理 .next/cache
npm run dist          # 直接打包
```

## 版本发布（GitHub）

```bash
git add -A
git commit -m "release: v2.3.0 update docs and music player display"
git push origin main

git tag -a v2.3.0 -m "Release v2.3.0"
git push origin v2.3.0
```

## 数据持久化说明

- 当前是本地存档模式，数据保存在本机。
- 正常覆盖安装新版本不会清空数据。
- 若手动卸载并删除用户数据，存档会丢失。

## License

MIT
