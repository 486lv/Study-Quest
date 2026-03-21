# Study Quest (v2.2.0)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.2.0-purple.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blueviolet)

Study Quest 是一个本地优先的专注成长应用：  
一次专注结束后，稳定获得「奖励 + 剧情推进 + 彩蛋机会」，形成长期正反馈循环。
<img width="1984" height="1206" alt="image" src="https://github.com/user-attachments/assets/d1443154-6ae2-4ff4-b223-d527f4345e33" />

---

## v2.2.0 版本更新

- 本地单档免登录：冷启动直接进入主页，数据全本地持久化。
- 专注页标签系统重构：支持新增 / 重命名 / 删除，新增后自动选中。
- 商城系统重构：支持库存（无限/限量）与兑换记录（未使用/已使用）。
- 剧情系统升级：段位-星级-章节推进，支持长期更新而非“一次性完结”。
- 收藏系统重定位：改为专注结算触发的剧情彩蛋收藏，不再依赖通关主线。
- 交互体验增强：新手引导、顶部状态摘要、专注页快捷时长、剧情/收藏 CTA 串联。
- 主题可读性优化：修复部分主题下剧情与信息文本对比度不足问题。

---

## 核心功能

### 1) 专注系统
- 倒计时 / 正计时双模式
- 专注标签管理（可编辑）
- 严格模式（中断可判定放弃）
- 连续天数与累计专注时长统计

### 2) 剧情与段位
- 主线 + 赛季 + 隐藏彩蛋结构
- 段位进度递增（前快后慢）
- 当前版本进度可见，后续版本可持续扩展

### 3) 彩蛋收藏
- 专注结算概率触发彩蛋
- 彩蛋与剧情节点双向关联
- 收藏页可回看详情并跳转剧情

### 4) 商城与奖励资产
- 自定义奖励项
- 能量兑换
- 库存与自动下架
- 兑换记录与状态追踪

### 5) 任务 / 习惯 / 数据
- 待办任务管理
- 习惯打卡与连续统计
- 专注统计图表

---

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Electron + IPC（本地文件持久化）
- Zustand（状态管理与持久化）
- Tailwind CSS

---

## 本地开发

```bash
npm install
npm run dev
```

---

## 打包为 Windows 安装包（exe）

```bash
npm run clean:cache
npm run dist
```

打包产物默认在：

```text
dist/
```

---

## 发布流程（GitHub）

```bash
git add -A
git commit -m "docs: update README for v2.2.0"
git push origin main
git tag -a v.2.2.0 -m "Release v.2.2.0"
git push origin v.2.2.0
```

然后在 GitHub 创建 Release 页面并选择对应 tag。

---

## 说明

- 当前版本为本地模式，不含联网账号系统。
- 未来可扩展云同步与多端数据同步能力。

---

## Author

Create by Ice
