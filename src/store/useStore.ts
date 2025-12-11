import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- 常量 ---
export const RANK_SYSTEM = [
  { name: '青铜', minXP: 0, icon: '🥉', color: 'text-orange-700' },
  { name: '白银', minXP: 500, icon: '🥈', color: 'text-slate-400' },
  { name: '黄金', minXP: 1500, icon: '🥇', color: 'text-yellow-400' },
  { name: '铂金', minXP: 3000, icon: '💠', color: 'text-cyan-400' },
  { name: '钻石', minXP: 6000, icon: '💎', color: 'text-blue-400' },
  { name: '星耀', minXP: 10000, icon: '🌟', color: 'text-purple-400' },
  { name: '王者', minXP: 20000, icon: '👑', color: 'text-red-500' },
  { name: '传奇', minXP: 50000, icon: '🐲', color: 'text-orange-500' },
  { name: '不朽', minXP: 100000, icon: '👹', color: 'text-red-700' },
  { name: '神话', minXP: 200000, icon: '🔮', color: 'text-fuchsia-500' },
  { name: '永恒', minXP: 500000, icon: '🌌', color: 'text-indigo-400' },
];

export const calculateRank = (xp: number) => {
  const index = RANK_SYSTEM.findIndex((r, i) => {
    const next = RANK_SYSTEM[i + 1];
    return xp >= r.minXP && (!next || xp < next.minXP);
  });
  return RANK_SYSTEM[index] || RANK_SYSTEM[0];
};

// --- 类型 ---
export type UserProfile = { username: string; avatar: string; isLoggedIn: boolean; joinedAt: string; };
export type Task = { id: string; title: string; isCompleted: boolean; priority: 'high' | 'normal' | 'low'; dueDate?: string; createdAt: string; };
export type SessionLog = { id: string; startTime: string; endTime: string; durationMinutes: number; tag: string; note?: string; status: 'completed'|'abandoned'; mode: string; };
export type ShopItem = { id: string; name: string; cost: number; icon: string; };
export type InventoryItem = { id: string; name: string; cost: number; icon: string; purchasedAt: string; status: 'unused'|'used'; };

export type Habit = {
  id: string;
  name: string;
  icon: string;
  streak: number;
  lastCheckIn: string; // YYYY-MM-DD
  history: string[];   // 历史记录数组
};

interface AppState {
  user: UserProfile;
  energy: number;
  xp: number;
  bgImage: string;
  blurLevel: number;
  
  activeTab: 'timer' | 'tasks' | 'habits' | 'stats' | 'shop' | 'rank' | 'settings';
  strictMode: boolean;

  tasks: Task[];
  sessions: SessionLog[];
  inventory: InventoryItem[];
  shopItems: ShopItem[];
  habits: Habit[]; 
  customTags: { name: string; color: string }[];

  login: (username: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  setActiveTab: (tab: any) => void;

  addTask: (title: string, priority: 'high' | 'normal' | 'low', dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskPriority: (id: string, priority: 'high' | 'normal' | 'low') => void;
  
  addSession: (data: SessionLog) => void;
  
  // 🟢 习惯管理
  addHabit: (name: string, icon: string) => void;
  deleteHabit: (id: string) => void;
  checkInHabit: (id: string) => void;
  
  addShopItem: (name: string, cost: number, icon: string) => void;
  deleteShopItem: (id: string) => void;
  purchaseItem: (item: any) => boolean;
  useInventoryItem: (id: string) => void;
  
  setBgImage: (url: string) => void;
  setBlurLevel: (val: number) => void;
  setStrictMode: (val: boolean) => void;
  addTag: (name: string, color: string) => void;
  removeTag: (name: string) => void;
  
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { username: '', avatar: '', isLoggedIn: false, joinedAt: '' },
      energy: 0, xp: 0, bgImage: '', blurLevel: 10, activeTab: 'timer',
      strictMode: false,
      
      tasks: [], sessions: [], inventory: [], shopItems: [],
      customTags: [{ name: '工作', color: '#3b82f6' }, { name: '学习', color: '#10b981' }],
      
      habits: [
        { id: '1', name: '早起打卡', icon: '🌅', streak: 0, lastCheckIn: '', history: [] },
        { id: '2', name: '早睡打卡', icon: '🌙', streak: 0, lastCheckIn: '', history: [] },
        { id: '3', name: '锻炼打卡', icon: '💪', streak: 0, lastCheckIn: '', history: [] },
      ],

      login: (username) => set({ user: { username, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`, isLoggedIn: true, joinedAt: new Date().toISOString() } }),
      logout: () => set(s => ({ user: { ...s.user, isLoggedIn: false } })),
      updateUser: (data) => set(s => ({ user: { ...s.user, ...data } })),
      setActiveTab: (tab) => set({ activeTab: tab }),

      addTask: (title, priority, dueDate) => set(s => ({
        tasks: [{ id: Date.now().toString(), title, isCompleted: false, priority, dueDate, createdAt: new Date().toISOString() }, ...s.tasks]
      })),
      toggleTask: (id) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      updateTaskPriority: (id, priority) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, priority } : t) })),

      addSession: (log) => set(s => {
        // 积分计算逻辑移到了组件内部处理好传进来，这里只负责存储
        const earnedXP = log.status === 'completed' ? log.durationMinutes * 10 : 0;
        const earnedEnergy = log.status === 'completed' ? log.durationMinutes : 0;
        return { sessions: [log, ...s.sessions], xp: s.xp + earnedXP, energy: s.energy + earnedEnergy };
      }),

      // 🟢 习惯实现
      addHabit: (name, icon) => set(s => ({
        habits: [...s.habits, {
          id: Date.now().toString(),
          name,
          icon: icon || '✨',
          streak: 0,
          lastCheckIn: '',
          history: []
        }]
      })),
      
      deleteHabit: (id) => set(s => ({
        habits: s.habits.filter(h => h.id !== id)
      })),

      checkInHabit: (id) => set(s => ({
        habits: s.habits.map(h => {
          if (h.id !== id) return h;
          const today = new Date().toISOString().split('T')[0];
          if (h.lastCheckIn === today) return h;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const newStreak = (h.lastCheckIn === yesterdayStr) ? h.streak + 1 : 1;

          return {
            ...h,
            lastCheckIn: today,
            streak: newStreak,
            history: [...h.history, today]
          };
        }),
        energy: s.energy + 20,
        xp: s.xp + 50
      })),

      addShopItem: (name, cost, icon) => set(s => ({ shopItems: [...s.shopItems, { id: Date.now().toString(), name, cost, icon }] })),
      deleteShopItem: (id) => set(s => ({ shopItems: s.shopItems.filter(i => i.id !== id) })),
      purchaseItem: (item) => {
        const { energy, inventory } = get();
        if (energy >= item.cost) {
          set({ energy: energy - item.cost, inventory: [{ id: Date.now().toString(), name: item.name, cost: item.cost, icon: item.icon, purchasedAt: new Date().toISOString(), status: 'unused' }, ...inventory] });
          return true;
        } return false;
      },
      useInventoryItem: (id) => set(s => ({ inventory: s.inventory.map(i => i.id === id ? { ...i, status: 'used' } : i) })),
      
      setBgImage: (url) => set({ bgImage: url }),
      setBlurLevel: (val) => set({ blurLevel: val }),
      setStrictMode: (val) => set({ strictMode: val }),
      
      addTag: (name, color) => set(s => ({ customTags: [...s.customTags, { name, color }] })),
      removeTag: (name) => set(s => ({ customTags: s.customTags.filter(t => t.name !== name) })),
      
      exportData: () => JSON.stringify(get()),
      importData: (json) => { try { set(JSON.parse(json)); return true; } catch { return false; } },
      resetData: () => set({ energy: 0, xp: 0, tasks: [], sessions: [], inventory: [], habits: get().habits.map(h => ({...h, streak:0, lastCheckIn:'', history:[]})), user: { ...get().user, joinedAt: new Date().toISOString() } })
    }),
    { name: 'study-quest-v15-habits', storage: createJSONStorage(() => localStorage) }
  )
);