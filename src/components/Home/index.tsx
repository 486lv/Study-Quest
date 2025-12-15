'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

// 引入组件
import Auth from '@/components/Auth';
import Timer from '@/components/Timer'; 
import Settings from '@/components/Settings';
import Tasks from '@/components/Tasks';
import Habits from '@/components/Habits';
import StatsChart from '@/components/StatsChart';
import Shop from '@/components/Shop';
import StoryMode from '@/components/StoryMode'; 
// 🟢 1. 确保引入了博物馆组件
import Museum from '@/components/Museum';

import { 
  LayoutDashboard, 
  Timer as TimerIcon, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Trophy, 
  ListTodo, 
  Zap, 
  CalendarCheck,
  Box, // 🟢 2. 引入图标
  Lock // 可选：如果你想显示一个上锁图标
} from 'lucide-react';

// 🔥🔥🔥 定义解锁阈值 (必须和 Timer.tsx 里的保持一致) 🔥🔥🔥
const MUSEUM_UNLOCK_XP = 20000;

export default function Home() {
  // 🟢 3. 取出 xp 用于判断
  const { user, energy, xp, activeTab, setActiveTab, theme } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  
  if (!mounted) return null;
  if (!user.isLoggedIn) return <Auth />;

  const NavButton = ({ tab, icon: Icon, label, hidden }: any) => {
    // 如果 hidden 为 true，直接不渲染
    if (hidden) return null;

    const isActive = activeTab === tab;
    return (
      <button onClick={() => setActiveTab(tab)} className={`w-full py-3 px-4 rounded-theme flex items-center gap-3 mb-2 transition-all group ${isActive ? 'bg-primary text-primary-fg font-bold' : 'text-text-muted hover:text-text hover:bg-white/5'}`}>
        <Icon size={20} className={isActive ? 'animate-bounce' : ''} />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div data-theme={theme} className="flex h-screen w-screen bg-background text-text overflow-hidden relative font-sans items-center justify-center transition-colors duration-700">
      
      {/* ... (省略背景层代码，保持不变) ... */}

      <div className="w-[95%] h-[92%] max-w-[1400px] bg-surface backdrop-blur-md rounded-theme border border-border flex overflow-hidden relative z-10 shadow-theme ring-1 ring-white/5">
        
        {/* 左侧侧边栏 */}
        <aside className="w-64 border-r border-border flex flex-col py-8 px-4 shrink-0 bg-black/5 relative transition-colors duration-300">
          {/* ... (省略用户信息部分，保持不变) ... */}

          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            <NavButton tab="timer" icon={TimerIcon} label="Focus 专注" />
            <NavButton tab="tasks" icon={ListTodo} label="Tasks 待办" />
            <NavButton tab="habits" icon={CalendarCheck} label="Habits 打卡" />
            <NavButton tab="stats" icon={LayoutDashboard} label="Stats 统计" />
            <div className="my-4 border-t border-border/50"></div>
            
            <NavButton tab="rank" icon={Trophy} label="Story 剧情" />
            <NavButton tab="shop" icon={ShoppingBag} label="Shop 商城" />

            {/* 放在 NavButton 列表里 */}
            {xp >= MUSEUM_UNLOCK_XP ? (
              <NavButton tab="museum" icon={Box} label="Museum 收藏" />
            ) : (
              <button disabled className="w-full py-3 px-4 rounded-theme flex items-center gap-3 mb-2 text-text-muted/30 cursor-not-allowed">
                  <Lock size={20} />
                  <span className="text-sm">??? (Locked)</span>
              </button>
            )}
          </nav>

           <div className="mt-auto pt-4 border-t border-border"> 

            <div className="bg-white/5 p-3 rounded-theme border border-border flex items-center justify-between mb-2">

               <div className="flex items-center gap-2">

                 <Zap size={14} className="text-yellow-400" fill="currentColor"/>

                 <span className="text-xs font-bold text-text-muted">能量</span>

               </div>

               <span className="font-mono font-bold text-yellow-500">{energy}</span>

            </div>

            <button onClick={() => setActiveTab('settings')} className="w-full py-3 px-4 rounded-theme flex items-center gap-3 text-text-muted hover:bg-white/5 hover:text-text transition group border border-transparent hover:border-border">

              <SettingsIcon size={20} className="group-hover:rotate-90 transition duration-500" />

              <span className="text-sm font-medium">设置</span>

            </button>

          </div>
        </aside>

        {/* 右侧内容区 */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 overflow-hidden p-8 relative overflow-y-auto custom-scrollbar">
            <div className="h-full w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`h-full ${activeTab === 'timer' ? 'block' : 'hidden'}`}><Timer /></div>
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'habits' && <Habits />}
              {activeTab === 'stats' && <StatsChart />}
              {activeTab === 'shop' && <Shop />}
              {activeTab === 'rank' && <StoryMode />}
              
              {/* 🔥🔥🔥 5. 渲染博物馆组件 (双重保险：如果没有解锁，强制不渲染) 🔥🔥🔥 */}
              {activeTab === 'museum' && xp >= MUSEUM_UNLOCK_XP && <Museum />}
              
              {activeTab === 'settings' && <Settings />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}