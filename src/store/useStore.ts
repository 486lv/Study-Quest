// src/store/useStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Artifact } from '@/data/artifactSystem'; // 👈 确保这个路径是对的

// =========================================
// 1. 类型定义
// =========================================

export type ThemeType = 'default' | 'cyberpunk' | 'pixel' | 'film' | 'bw' | 'forest';
export type UserProfile = { username: string; avatar: string; isLoggedIn: boolean; joinedAt: string; };
export type Task = { id: string; title: string; isCompleted: boolean; priority: 'high' | 'normal' | 'low'; dueDate?: string; createdAt: string; };
export type SessionLog = { id: string; startTime: string; endTime: string; durationMinutes: number; tag: string; note?: string; status: 'completed'|'abandoned'; mode: string; };
export type ShopItem = { id: string; name: string; cost: number; icon: string; };
export type InventoryItem = { id: string; name: string; cost: number; icon: string; purchasedAt: string; status: 'unused'|'used'; };
export type Habit = { id: string; name: string; icon: string; streak: number; lastCheckIn: string; history: string[]; };

interface AppState {
  // State
  user: UserProfile; 
  energy: number; 
  xp: number; 
  theme: ThemeType; 
  bgImage: string; 
  blurLevel: number;
  activeTab: 'timer' | 'tasks' | 'habits' | 'stats' | 'shop' | 'rank' | 'settings' | 'museum';
  strictMode: boolean;
  tasks: Task[]; 
  sessions: SessionLog[]; 
  inventory: InventoryItem[]; 
  artifacts: Artifact[];      
  shopItems: ShopItem[]; 
  habits: Habit[]; 
  customTags: { name: string; color: string }[];

  // Actions
  login: (username: string) => Promise<void>; 
  logout: () => void; 
  updateUser: (data: Partial<UserProfile>) => void; 
  setActiveTab: (tab: any) => void;
  setTheme: (theme: ThemeType) => void;
  addTask: (title: string, priority: 'high' | 'normal' | 'low', dueDate?: string) => void; 
  toggleTask: (id: string) => void; 
  deleteTask: (id: string) => void; 
  updateTaskPriority: (id: string, priority: 'high' | 'normal' | 'low') => void;
  addSession: (data: SessionLog) => void;
  addHabit: (name: string, icon: string) => void; 
  deleteHabit: (id: string) => void; 
  checkInHabit: (id: string) => void;
  addShopItem: (name: string, cost: number, icon: string) => void; 
  deleteShopItem: (id: string) => void; 
  purchaseItem: (item: any) => boolean; 
  useInventoryItem: (id: string) => void;
  addArtifact: (item: Artifact) => void;
  setBgImage: (url: string) => void; 
  setBlurLevel: (val: number) => void; 
  setStrictMode: (val: boolean) => void; 
  addTag: (name: string, color?: string) => void; 
  removeTag: (name: string) => void;
  exportData: () => string; 
  importData: (json: string) => boolean; 
  resetData: () => void;
}


// 辅助函数：生成安全的文件名 (如 StudyQuest_ice.json)
const getSafeFilename = (username: string) => {
  const safeName = username.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
  return `StudyQuest_${safeName}.json`;
};

// 辅助函数：手动保存当前状态到文件
const saveCurrentState = async (getState: () => AppState) => {
  const state = getState();
  if (typeof window !== 'undefined' && (window as any).electronAPI && state.user.isLoggedIn && state.user.username) {
    try {
      // 只保存状态数据，不保存 actions
      const stateToSave = JSON.stringify({ 
        state: {
          user: state.user,
          energy: state.energy,
          xp: state.xp,
          theme: state.theme,
          bgImage: state.bgImage,
          blurLevel: state.blurLevel,
          activeTab: state.activeTab,
          strictMode: state.strictMode,
          tasks: state.tasks,
          sessions: state.sessions,
          inventory: state.inventory,
          artifacts: state.artifacts,
          shopItems: state.shopItems,
          habits: state.habits,
          customTags: state.customTags,
        }, 
        version: 0 
      });
      const filename = getSafeFilename(state.user.username);
      const result = await (window as any).electronAPI.saveData(filename, stateToSave);
      if (result?.success) {
        console.log(`✅ 用户数据已保存: ${filename}`);
        return true;
      } else {
        console.error(`❌ 保存失败: ${result?.error || '未知错误'}`);
        return false;
      }
    } catch (e) {
      console.error("手动保存存档出错:", e);
      return false;
    }
  }
  return false;
};

// =========================================
// 🔥 2. 自定义多用户文件存储系统 (核心修改)
// =========================================

const multiUserStorage: StateStorage = {
  // 启动时，我们不主动加载，等待 login 触发。
  getItem: async (name: string): Promise<string | null> => {
    return null; 
  },
  
  // 保存：根据当前的 username 保存到对应的文件
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const stateData = JSON.parse(value);
        const username = stateData.state?.user?.username;
        const isLoggedIn = stateData.state?.user?.isLoggedIn;

        // 只有当用户已登录且有用户名时才保存
        if (username && isLoggedIn) {
          const filename = getSafeFilename(username);
          const result = await (window as any).electronAPI.saveData(filename, value);
          if (result?.success) {
            console.log(`✅ 用户数据已保存: ${filename}`);
          } else {
            console.error(`❌ 保存失败: ${result?.error || '未知错误'}`);
          }
        } else {
          console.log('⏭️ 跳过保存：用户未登录或用户名为空');
        }
      } catch (e) {
        console.error("保存存档出错:", e);
      }
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    // 留空，不实现删除
  },
};

// =========================================
// 3. Store 实现
// =========================================

// 🔴 初始默认值，用于新用户或重置时使用
const INITIAL_STATE_DEFAULTS = {
    energy: 0, 
    xp: 0, 
    tasks: [], 
    sessions: [], 
    inventory: [], 
    artifacts: [], 
    shopItems: [],
    customTags: [
      { name: '工作', color: '#3b82f6' }, 
      { name: '学习', color: '#10b981' },
      { name: '阅读', color: '#f59e0b' },
      { name: '运动', color: '#ef4444' }
    ],
    habits: [
      { id: '1', name: '早起打卡', icon: '🌅', streak: 0, lastCheckIn: '', history: [] },
      { id: '2', name: '早睡打卡', icon: '🌙', streak: 0, lastCheckIn: '', history: [] },
      { id: '3', name: '锻炼打卡', icon: '💪', streak: 0, lastCheckIn: '', history: [] },
    ],
    // 其他非数据状态
    theme: 'default' as ThemeType, 
    bgImage: '', 
    blurLevel: 10, 
    activeTab: 'timer' as 'timer', 
    strictMode: false,
};


export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- 初始状态 ---
      ...INITIAL_STATE_DEFAULTS,
      user: { username: '', avatar: '', isLoggedIn: false, joinedAt: '' },


      // --- 🔴 关键修改：Login 逻辑 ---
      login: async (username) => {
        const newUser = { 
            username, 
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`, 
            isLoggedIn: true, 
            joinedAt: new Date().toISOString() 
        };

        // 尝试从硬盘加载这个用户的旧存档
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const filename = getSafeFilename(username);
            try {
                const savedDataStr = await (window as any).electronAPI.loadData(filename);
                
                if (savedDataStr) {
                    const savedJson = JSON.parse(savedDataStr);
                    if (savedJson.state) {
                        // 恢复存档数据，保留 activeTab 等当前状态，但确保用户状态是最新的
                        const restoredState = { ...savedJson.state, user: { ...savedJson.state.user, isLoggedIn: true } };
                        set(restoredState);
                        // 手动触发一次保存，确保数据被持久化
                        await saveCurrentState(get);
                        return;
                    }
                }
            } catch (e) {
                console.error('加载用户存档失败，将使用新账号:', e);
            }
        }

        // 没存档或加载失败：使用干净的初始默认状态
        const newState = { 
            ...INITIAL_STATE_DEFAULTS, // 确保所有数据都回到了干净的默认值
            user: newUser,
        };
        set(newState);

        // 🔥 关键修复：新用户注册后立即保存数据
        await saveCurrentState(get);
      },

      logout: () => {
        // 登出时，清空所有数据，防止下一个人看到
        set({ 
            ...INITIAL_STATE_DEFAULTS,
            user: { username: '', avatar: '', isLoggedIn: false, joinedAt: '' },
        });
      },

      // --- 其他 Actions ---
      updateUser: (data) => set(s => ({ user: { ...s.user, ...data } })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTheme: (theme) => set({ theme }),

      addTask: (title, priority, dueDate) => set(s => ({ tasks: [{ id: Date.now().toString(), title, isCompleted: false, priority, dueDate, createdAt: new Date().toISOString() }, ...s.tasks] })),
      toggleTask: (id) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      updateTaskPriority: (id, priority) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, priority } : t) })),

      addSession: (log) => set((state) => {
        const safeDuration = Number(log.durationMinutes) || 0;
        const isSuccess = log.status === 'completed';
        const earnedXP = isSuccess ? safeDuration * 10 : 0;
        const earnedEnergy = isSuccess ? safeDuration : 0;
        return { sessions: [log, ...state.sessions], xp: (Number(state.xp)||0) + earnedXP, energy: (Number(state.energy)||0) + earnedEnergy };
      }),

      addHabit: (name, icon) => set(s => ({ habits: [...s.habits, { id: Date.now().toString(), name, icon: icon || '✨', streak: 0, lastCheckIn: '', history: [] }] })),
      deleteHabit: (id) => set(s => ({ habits: s.habits.filter(h => h.id !== id) })),
      checkInHabit: (id) => set(s => ({
        habits: s.habits.map(h => {
          if (h.id !== id) return h;
          const today = new Date().toISOString().split('T')[0];
          if (h.lastCheckIn === today) return h;
          const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          return { ...h, lastCheckIn: today, streak: (h.lastCheckIn === yesterdayStr) ? h.streak + 1 : 1, history: [...h.history, today] };
        }),
        energy: (Number(s.energy) || 0) + 20, 
        xp: (Number(s.xp) || 0) + 50
      })),

      addShopItem: (name, cost, icon) => set(s => ({ shopItems: [...s.shopItems, { id: Date.now().toString(), name, cost, icon }] })),
      deleteShopItem: (id) => set(s => ({ shopItems: s.shopItems.filter(i => i.id !== id) })),
      purchaseItem: (item) => {
        const { energy, inventory } = get();
        if ((Number(energy)||0) >= item.cost) {
          set({ energy: (Number(energy)||0) - item.cost, inventory: [{ id: Date.now().toString(), name: item.name, cost: item.cost, icon: item.icon, purchasedAt: new Date().toISOString(), status: 'unused' }, ...inventory] });
          return true;
        } return false;
      },
      useInventoryItem: (id) => set(s => ({ inventory: s.inventory.map(i => i.id === id ? { ...i, status: 'used' } : i) })),

      addArtifact: (item) => set(s => ({ artifacts: [item, ...s.artifacts] })),
      
      setBgImage: (url) => set({ bgImage: url }),
      setBlurLevel: (val) => set({ blurLevel: val }),
      setStrictMode: (val) => set({ strictMode: val }),
      addTag: (name, color) => set(s => {
        if (s.customTags.some(t => t.name === name)) return s;
        return { customTags: [...s.customTags, { name, color: color || '#3b82f6' }] };
      }),
      removeTag: (name) => set(s => ({ customTags: s.customTags.filter(t => t.name !== name) })),
      
      exportData: () => JSON.stringify(get()),
      importData: (json) => { try { set(JSON.parse(json)); return true; } catch { return false; } },
      
      resetData: () => set({ 
          ...INITIAL_STATE_DEFAULTS,
          user: { ...get().user, joinedAt: new Date().toISOString() } 
      })
    }),
    { 
      name: 'study-quest-multiuser',
      storage: createJSONStorage(() => multiUserStorage) 
    }
  )
);