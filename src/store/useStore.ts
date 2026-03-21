import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Artifact } from '@/data/artifactSystem';

export type ThemeType = 'default' | 'cyberpunk' | 'pixel' | 'film' | 'bw' | 'forest';
export type StoryRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type UserProfile = { username: string; avatar: string; isLoggedIn: boolean; joinedAt: string };
export type Task = { id: string; title: string; isCompleted: boolean; priority: 'high' | 'normal' | 'low'; dueDate?: string; createdAt: string };
export type SessionLog = { id: string; startTime: string; endTime: string; durationMinutes: number; tag: string; note?: string; status: 'completed' | 'abandoned'; mode: string };
export type ShopItem = { id: string; name: string; cost: number; icon: string; stock: number };
export type PurchaseRecord = { id: string; itemId: string; itemName: string; cost: number; purchasedAt: string; status: 'unused' | 'used' };
export type InventoryItem = { id: string; purchaseId: string; name: string; cost: number; icon: string; purchasedAt: string; status: 'unused' | 'used' };
export type Habit = { id: string; name: string; icon: string; streak: number; lastCheckIn: string; history: string[] };

export type StoryProgress = {
  storyRank: StoryRank;
  rankStars: number;
  rankProgress: number;
  rankNeed: number;
  currentChapter: number;
};

export type DailyProgress = {
  date: string;
  focusSessions: number;
  deepFocusSessions: number;
  streakDays: number;
  lastCompletedDate: string;
};

export type OnboardingState = { completed: boolean; step: 1 | 2 | 3; dismissedAt?: string };

export type ReminderConfig = {
  focusEnd: boolean;
  restEnd: boolean;
  volume: number;
  whiteNoiseEnabled: boolean;
  whiteNoiseType: 'rain' | 'cafe' | 'forest' | 'pink';
};

export type BackupConfig = {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly';
  lastBackupAt: string;
  verifyOnImport: boolean;
};

export type ShortcutMapping = {
  startPause: string;
  stop: string;
  toggleMode: string;
};

export type FocusTemplate = {
  id: string;
  name: string;
  focusMinutes: number;
  restMinutes: number;
};

export type SettingsProfile = {
  motionIntensity: number;
  fontScale: number;
  compactMode: boolean;
  minimizeToTray: boolean;
  launchAtStartup: boolean;
  hotkeysEnabled: boolean;
};

interface AppState {
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
  hiddenStoryIds: string[];
  shopItems: ShopItem[];
  purchases: PurchaseRecord[];
  habits: Habit[];
  customTags: { name: string; color: string }[];
  tagAliases: { from: string; to: string; at: string }[];
  focusCombo: number;
  storyProgress: StoryProgress;
  dailyProgress: DailyProgress;
  onboarding: OnboardingState;
  reminders: ReminderConfig;
  backupConfig: BackupConfig;
  settingsProfile: SettingsProfile;
  shortcuts: ShortcutMapping;
  focusTemplates: FocusTemplate[];

  login: (username: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setTheme: (theme: ThemeType) => void;
  addTask: (title: string, priority: 'high' | 'normal' | 'low', dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskPriority: (id: string, priority: 'high' | 'normal' | 'low') => void;
  addSession: (data: SessionLog) => void;
  addHabit: (name: string, icon: string) => void;
  deleteHabit: (id: string) => void;
  checkInHabit: (id: string) => void;
  addShopItem: (name: string, cost: number, icon: string, stock?: number) => void;
  deleteShopItem: (id: string) => void;
  purchaseItem: (item: ShopItem) => boolean;
  markPurchaseUsed: (id: string) => void;
  useInventoryItem: (id: string) => void;
  addArtifact: (item: Artifact) => void;
  addHiddenStoryId: (id: string) => void;
  setBgImage: (url: string) => void;
  setBlurLevel: (val: number) => void;
  setStrictMode: (val: boolean) => void;
  addTag: (name: string, color?: string) => void;
  renameTag: (from: string, to: string) => void;
  removeTag: (name: string) => void;
  setOnboardingStep: (step: 1 | 2 | 3) => void;
  completeOnboarding: () => void;
  setReminderConfig: (data: Partial<ReminderConfig>) => void;
  setBackupConfig: (data: Partial<BackupConfig>) => void;
  setSettingsProfile: (data: Partial<SettingsProfile>) => void;
  setShortcuts: (data: Partial<ShortcutMapping>) => void;
  addFocusTemplate: (name: string, focusMinutes: number, restMinutes: number) => void;
  deleteFocusTemplate: (id: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const STORAGE_FILE = 'StudyQuest_local.json';
const todayStr = () => new Date().toISOString().split('T')[0];

const RANKS: Array<{ rank: StoryRank; start: number; end: number; stars: number; curve: number }> = [
  { rank: 'Bronze', start: 0, end: 3000, stars: 3, curve: 1.12 },
  { rank: 'Silver', start: 3000, end: 9000, stars: 4, curve: 1.2 },
  { rank: 'Gold', start: 9000, end: 18000, stars: 5, curve: 1.3 },
  { rank: 'Platinum', start: 18000, end: 32000, stars: 5, curve: 1.38 },
  { rank: 'Diamond', start: 32000, end: 999999, stars: 5, curve: 1.48 },
];

const getMilestones = (start: number, end: number, stars: number, curve: number) => {
  const weights = Array.from({ length: stars }, (_, i) => Math.pow(curve, i));
  const sum = weights.reduce((a, b) => a + b, 0);
  const steps: number[] = [start];
  let acc = start;
  for (const w of weights) {
    acc += ((end - start) * w) / sum;
    steps.push(Math.round(acc));
  }
  return steps;
};

const calcStoryProgress = (xp: number): StoryProgress => {
  const tier = RANKS.find((r) => xp >= r.start && xp < r.end) || RANKS[RANKS.length - 1];
  const milestones = getMilestones(tier.start, tier.end, tier.stars, tier.curve);

  let starIndex = 0;
  for (let i = 1; i < milestones.length; i++) if (xp >= milestones[i]) starIndex = i;

  const safeStarIndex = Math.min(starIndex, tier.stars - 1);
  const currentStart = milestones[safeStarIndex];
  const currentEnd = milestones[safeStarIndex + 1] ?? milestones[milestones.length - 1];
  const span = Math.max(1, currentEnd - currentStart);

  return {
    storyRank: tier.rank,
    rankStars: safeStarIndex,
    rankProgress: Math.min(1, Math.max(0, (xp - currentStart) / span)),
    rankNeed: Math.max(0, currentEnd - xp),
    currentChapter: Math.max(1, Math.floor(xp / 4000) + 1),
  };
};

const defaultUserName = 'Operator';

const INITIAL_DEFAULTS: Omit<AppState,
  'login'|'logout'|'updateUser'|'setActiveTab'|'setTheme'|'addTask'|'toggleTask'|'deleteTask'|'updateTaskPriority'|'addSession'|'addHabit'|'deleteHabit'|'checkInHabit'|'addShopItem'|'deleteShopItem'|'purchaseItem'|'markPurchaseUsed'|'useInventoryItem'|'addArtifact'|'addHiddenStoryId'|'setBgImage'|'setBlurLevel'|'setStrictMode'|'addTag'|'renameTag'|'removeTag'|'setOnboardingStep'|'completeOnboarding'|'setReminderConfig'|'setBackupConfig'|'setSettingsProfile'|'setShortcuts'|'addFocusTemplate'|'deleteFocusTemplate'|'exportData'|'importData'|'resetData'
> = {
  user: { username: defaultUserName, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${defaultUserName}`, isLoggedIn: true, joinedAt: new Date().toISOString() },
  energy: 0,
  xp: 0,
  theme: 'default',
  bgImage: '',
  blurLevel: 10,
  activeTab: 'timer',
  strictMode: false,
  tasks: [],
  sessions: [],
  inventory: [],
  artifacts: [],
  hiddenStoryIds: [],
  shopItems: [
    { id: 'default-1', name: '奶茶奖励', cost: 120, icon: '🥤', stock: -1 },
    { id: 'default-2', name: '游戏30分钟', cost: 180, icon: '🎮', stock: -1 },
  ],
  purchases: [],
  habits: [
    { id: '1', name: '早起打卡', icon: '🌅', streak: 0, lastCheckIn: '', history: [] },
    { id: '2', name: '早睡打卡', icon: '🌙', streak: 0, lastCheckIn: '', history: [] },
    { id: '3', name: '锻炼打卡', icon: '💪', streak: 0, lastCheckIn: '', history: [] },
  ],
  customTags: [
    { name: '工作', color: '#3b82f6' },
    { name: '学习', color: '#10b981' },
    { name: '阅读', color: '#f59e0b' },
    { name: '运动', color: '#ef4444' },
  ],
  tagAliases: [],
  focusCombo: 0,
  storyProgress: calcStoryProgress(0),
  dailyProgress: { date: todayStr(), focusSessions: 0, deepFocusSessions: 0, streakDays: 0, lastCompletedDate: '' },
  onboarding: { completed: false, step: 1 },
  reminders: { focusEnd: true, restEnd: true, volume: 70, whiteNoiseEnabled: false, whiteNoiseType: 'rain' },
  backupConfig: { autoBackup: true, frequency: 'daily', lastBackupAt: '', verifyOnImport: true },
  settingsProfile: { motionIntensity: 70, fontScale: 100, compactMode: false, minimizeToTray: true, launchAtStartup: false, hotkeysEnabled: true },
  shortcuts: { startPause: 'Space', stop: 'Escape', toggleMode: 'Tab' },
  focusTemplates: [
    { id: 'tpl-1', name: '标准番茄', focusMinutes: 25, restMinutes: 5 },
    { id: 'tpl-2', name: '深度沉浸', focusMinutes: 50, restMinutes: 10 },
  ],
};

const singleFileStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    if ((window as any).electronAPI?.loadData) {
      try {
        const data = await (window as any).electronAPI.loadData(STORAGE_FILE);
        return data || null;
      } catch {
        return null;
      }
    }
    return window.localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    if ((window as any).electronAPI?.saveData) {
      try { await (window as any).electronAPI.saveData(STORAGE_FILE, value); } catch {}
    }
    window.localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL_DEFAULTS,

      login: async (username) => {
        const safe = (username || '').trim() || defaultUserName;
        set((s) => ({ user: { ...s.user, username: safe, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${safe}`, isLoggedIn: true } }));
      },
      logout: () => set((s) => ({ ...INITIAL_DEFAULTS, user: { ...s.user, isLoggedIn: true, joinedAt: s.user.joinedAt || new Date().toISOString() } })),
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data, isLoggedIn: true } })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTheme: (theme) => set({ theme }),

      addTask: (title, priority, dueDate) => set((s) => ({ tasks: [{ id: Date.now().toString(), title, isCompleted: false, priority, dueDate, createdAt: new Date().toISOString() }, ...s.tasks] })),
      toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      updateTaskPriority: (id, priority) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, priority } : t)) })),

      addSession: (log) => set((state) => {
        const safeDuration = Number(log.durationMinutes) || 0;
        const isSuccess = log.status === 'completed';
        const earnedXP = isSuccess ? safeDuration * 10 : 0;
        const earnedEnergy = isSuccess ? safeDuration : 0;
        const nextXP = (Number(state.xp) || 0) + earnedXP;

        const today = todayStr();
        const prevDaily = state.dailyProgress;
        const isNewDay = prevDaily.date !== today;
        const prevLast = prevDaily.lastCompletedDate;
        let streakDays = prevDaily.streakDays;

        if (isSuccess && safeDuration >= 1) {
          if (prevLast === today) streakDays = prevDaily.streakDays;
          else {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            streakDays = prevLast === y.toISOString().split('T')[0] ? prevDaily.streakDays + 1 : 1;
          }
        }

        const focusSessions = isNewDay ? 0 : prevDaily.focusSessions;
        const deepFocusSessions = isNewDay ? 0 : prevDaily.deepFocusSessions;

        return {
          sessions: [log, ...state.sessions],
          xp: nextXP,
          energy: (Number(state.energy) || 0) + earnedEnergy,
          storyProgress: calcStoryProgress(nextXP),
          focusCombo: isSuccess && safeDuration >= 25 ? state.focusCombo + 1 : 0,
          dailyProgress: {
            date: today,
            focusSessions: focusSessions + (isSuccess ? 1 : 0),
            deepFocusSessions: deepFocusSessions + (isSuccess && safeDuration >= 25 ? 1 : 0),
            streakDays,
            lastCompletedDate: isSuccess ? today : prevLast,
          },
        };
      }),

      addHabit: (name, icon) => set((s) => ({ habits: [...s.habits, { id: Date.now().toString(), name, icon: icon || '✨', streak: 0, lastCheckIn: '', history: [] }] })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      checkInHabit: (id) => set((s) => ({
        habits: s.habits.map((h) => {
          if (h.id !== id) return h;
          const today = todayStr();
          if (h.lastCheckIn === today) return h;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return { ...h, lastCheckIn: today, streak: h.lastCheckIn === yesterday.toISOString().split('T')[0] ? h.streak + 1 : 1, history: [...h.history, today] };
        }),
        energy: (Number(s.energy) || 0) + 20,
        xp: (Number(s.xp) || 0) + 50,
        storyProgress: calcStoryProgress((Number(s.xp) || 0) + 50),
      })),

      addShopItem: (name, cost, icon, stock) => set((s) => ({ shopItems: [...s.shopItems, { id: Date.now().toString(), name, cost, icon, stock: typeof stock === 'number' && !Number.isNaN(stock) ? stock : -1 }] })),
      deleteShopItem: (id) => set((s) => ({ shopItems: s.shopItems.filter((i) => i.id !== id) })),
      purchaseItem: (item) => {
        const { energy } = get();
        if ((Number(energy) || 0) < item.cost || item.stock === 0) return false;
        const purchaseId = `P-${Date.now()}`;
        set((s) => {
          const nextItems = s.shopItems.map((shop) => {
            if (shop.id !== item.id || shop.stock === -1) return shop;
            return { ...shop, stock: Math.max(0, shop.stock - 1) };
          }).filter((shop) => shop.stock !== 0);

          return {
            energy: (Number(s.energy) || 0) - item.cost,
            shopItems: nextItems,
            purchases: [{ id: purchaseId, itemId: item.id, itemName: item.name, cost: item.cost, purchasedAt: new Date().toISOString(), status: 'unused' }, ...s.purchases],
            inventory: [{ id: `I-${Date.now()}`, purchaseId, name: item.name, cost: item.cost, icon: item.icon, purchasedAt: new Date().toISOString(), status: 'unused' }, ...s.inventory],
          };
        });
        return true;
      },
      markPurchaseUsed: (id) => set((s) => ({ purchases: s.purchases.map((p) => p.id === id ? { ...p, status: 'used' } : p), inventory: s.inventory.map((i) => i.purchaseId === id ? { ...i, status: 'used' } : i) })),
      useInventoryItem: (id) => set((s) => {
        const target = s.inventory.find((i) => i.id === id);
        return {
          inventory: s.inventory.map((i) => i.id === id ? { ...i, status: 'used' } : i),
          purchases: target ? s.purchases.map((p) => p.id === target.purchaseId ? { ...p, status: 'used' } : p) : s.purchases,
        };
      }),

      addArtifact: (item) => set((s) => ({ artifacts: [item, ...s.artifacts] })),
      addHiddenStoryId: (id) => set((s) => (s.hiddenStoryIds.includes(id) ? s : { hiddenStoryIds: [id, ...s.hiddenStoryIds] })),
      setBgImage: (url) => set({ bgImage: url }),
      setBlurLevel: (val) => set({ blurLevel: val }),
      setStrictMode: (val) => set({ strictMode: val }),

      addTag: (name, color) => set((s) => {
        const safeName = name.trim();
        if (!safeName || s.customTags.some((t) => t.name.toLowerCase() === safeName.toLowerCase())) return s;
        return { customTags: [...s.customTags, { name: safeName, color: color || '#3b82f6' }] };
      }),
      renameTag: (from, to) => set((s) => {
        const safeFrom = from.trim();
        const safeTo = to.trim();
        if (!safeFrom || !safeTo || safeFrom === safeTo || s.customTags.some((t) => t.name.toLowerCase() === safeTo.toLowerCase())) return s;
        return {
          customTags: s.customTags.map((t) => t.name === safeFrom ? { ...t, name: safeTo } : t),
          sessions: s.sessions.map((session) => session.tag === safeFrom ? { ...session, tag: safeTo } : session),
          tagAliases: [{ from: safeFrom, to: safeTo, at: new Date().toISOString() }, ...s.tagAliases],
        };
      }),
      removeTag: (name) => set((s) => s.customTags.length <= 1 ? s : ({ customTags: s.customTags.filter((t) => t.name !== name) })),

      setOnboardingStep: (step) => set((s) => ({ onboarding: { ...s.onboarding, step } })),
      completeOnboarding: () => set((s) => ({ onboarding: { ...s.onboarding, completed: true, dismissedAt: new Date().toISOString() } })),
      setReminderConfig: (data) => set((s) => ({ reminders: { ...s.reminders, ...data } })),
      setBackupConfig: (data) => set((s) => ({ backupConfig: { ...s.backupConfig, ...data } })),
      setSettingsProfile: (data) => set((s) => ({ settingsProfile: { ...s.settingsProfile, ...data } })),
      setShortcuts: (data) => set((s) => ({ shortcuts: { ...s.shortcuts, ...data } })),
      addFocusTemplate: (name, focusMinutes, restMinutes) => set((s) => ({ focusTemplates: [...s.focusTemplates, { id: `tpl-${Date.now()}`, name, focusMinutes, restMinutes }] })),
      deleteFocusTemplate: (id) => set((s) => ({ focusTemplates: s.focusTemplates.filter((t) => t.id !== id) })),

      exportData: () => JSON.stringify(get()),
      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          set({ ...INITIAL_DEFAULTS, ...parsed, storyProgress: calcStoryProgress(Number(parsed.xp) || 0) });
          return true;
        } catch {
          return false;
        }
      },
      resetData: () => set((s) => ({ ...INITIAL_DEFAULTS, user: { ...s.user, isLoggedIn: true, joinedAt: s.user.joinedAt || new Date().toISOString() } })),
    }),
    {
      name: 'study-quest-v3',
      storage: createJSONStorage(() => singleFileStorage),
      version: 4,
      partialize: (state) => ({
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
        hiddenStoryIds: state.hiddenStoryIds,
        shopItems: state.shopItems,
        purchases: state.purchases,
        habits: state.habits,
        customTags: state.customTags,
        tagAliases: state.tagAliases,
        focusCombo: state.focusCombo,
        storyProgress: state.storyProgress,
        dailyProgress: state.dailyProgress,
        onboarding: state.onboarding,
        reminders: state.reminders,
        backupConfig: state.backupConfig,
        settingsProfile: state.settingsProfile,
        shortcuts: state.shortcuts,
        focusTemplates: state.focusTemplates,
      }),
      migrate: (persisted: any) => {
        const base = persisted?.state ? persisted.state : persisted;
        const nextXP = Number(base?.xp) || 0;
        return {
          ...INITIAL_DEFAULTS,
          ...base,
          user: { ...INITIAL_DEFAULTS.user, ...(base?.user || {}), isLoggedIn: true },
          shopItems: (base?.shopItems || []).map((s: any) => ({ ...s, stock: typeof s.stock === 'number' ? s.stock : -1 })),
          purchases: base?.purchases || [],
          tagAliases: base?.tagAliases || [],
          hiddenStoryIds: base?.hiddenStoryIds || [],
          focusCombo: typeof base?.focusCombo === 'number' ? base.focusCombo : 0,
          storyProgress: calcStoryProgress(nextXP),
          dailyProgress: base?.dailyProgress || INITIAL_DEFAULTS.dailyProgress,
          onboarding: base?.onboarding || INITIAL_DEFAULTS.onboarding,
          reminders: { ...INITIAL_DEFAULTS.reminders, ...(base?.reminders || {}) },
          backupConfig: { ...INITIAL_DEFAULTS.backupConfig, ...(base?.backupConfig || {}) },
          settingsProfile: { ...INITIAL_DEFAULTS.settingsProfile, ...(base?.settingsProfile || {}) },
          shortcuts: { ...INITIAL_DEFAULTS.shortcuts, ...(base?.shortcuts || {}) },
          focusTemplates: base?.focusTemplates || INITIAL_DEFAULTS.focusTemplates,
        };
      },
    }
  )
);
