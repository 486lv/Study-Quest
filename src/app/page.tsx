'use client';
import { useState, useEffect } from 'react';
import { useStore, calculateRank } from '@/store/useStore';
import Auth from '@/components/Auth';
import Timer from '@/components/Timer'; 
import StatsChart from '@/components/StatsChart';
import Shop from '@/components/Shop';
import Tasks from '@/components/Tasks';
import Habits from '@/components/Habits';
import Rank from '@/components/Rank';
import Settings from '@/components/Settings';
import { LayoutDashboard, Timer as TimerIcon, ShoppingBag, Settings as SettingsIcon, Trophy, ListTodo, Zap, CalendarCheck } from 'lucide-react';

export default function Home() {
  const { user, energy, xp, bgImage, blurLevel, activeTab, setActiveTab } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!user.isLoggedIn) return <Auth />;

  const currentRank = calculateRank(xp);

  const NavButton = ({ tab, icon: Icon, label }: any) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-all duration-300 group ${
          isActive 
            ? 'bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/20' 
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
        <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] text-white overflow-hidden relative font-sans items-center justify-center">
      
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none', filter: `blur(${blurLevel}px) brightness(0.8)` }}
        />
        {!bgImage && <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#1e1b4b_0%,_#000000_100%)]"></div>}
      </div>

      {/* 主窗口 */}
      <div className="w-[95%] h-[92%] max-w-[1400px] bg-black/20 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 flex overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/10">
        
        {/* 侧边栏 */}
        <aside className="w-64 border-r border-white/10 flex flex-col py-8 px-4 shrink-0 bg-black/10 relative">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div onClick={() => setActiveTab('settings')} className="w-12 h-12 rounded-full border-2 border-white/40 cursor-pointer hover:border-white transition shadow-lg overflow-hidden group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition" alt="avatar" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold text-white text-lg drop-shadow-md truncate">{user.username}</h2>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium text-shadow">
                <span className={`${currentRank.color}`}>{currentRank.icon}</span>
                <span>{currentRank.name}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavButton tab="timer" icon={TimerIcon} label="Focus 专注" />
            <NavButton tab="tasks" icon={ListTodo} label="Tasks 待办" />
            <NavButton tab="habits" icon={CalendarCheck} label="Habits 打卡" />
            <NavButton tab="stats" icon={LayoutDashboard} label="Stats 统计" />
            <div className="h-4"></div>
            <NavButton tab="rank" icon={Trophy} label="Rank 段位" />
            <NavButton tab="shop" icon={ShoppingBag} label="Shop 商城" />
          </nav>

          <div className="mt-auto space-y-3 pb-8"> 
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 p-3 rounded-xl border border-yellow-400/30 flex items-center justify-between backdrop-blur-md">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-yellow-400 rounded-lg text-black shadow-lg"><Zap size={14} fill="currentColor"/></div>
                 <span className="text-xs font-bold text-yellow-100 text-shadow">能量值</span>
               </div>
               <span className="font-mono font-bold text-yellow-300 drop-shadow-md">{energy}</span>
            </div>
            <button onClick={() => setActiveTab('settings')} className="w-full py-3 px-4 rounded-xl flex items-center gap-3 text-white/70 hover:bg-white/10 hover:text-white transition group">
              <SettingsIcon size={20} className="group-hover:rotate-90 transition duration-500" />
              <span className="text-sm font-medium text-shadow">系统设置</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-0 w-full text-center text-[10px] text-white/20 font-bold tracking-widest uppercase pointer-events-none">
            Create by ice
          </div>
        </aside>

        {/* 🟢 内容区关键修改：使用 display (hidden) 切换，而不是销毁组件 */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 shrink-0 bg-white/[0.01]">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">
              {activeTab === 'timer' && '专注时刻'}
              {activeTab === 'tasks' && '待办清单'}
              {activeTab === 'habits' && '习惯打卡'}
              {activeTab === 'stats' && '数据看板'}
              {activeTab === 'rank' && '段位中心'}
              {activeTab === 'shop' && '奖励商城'}
              {activeTab === 'settings' && '偏好设置'}
            </h1>
            <div className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded border border-white/5">
              V15.1 Stable
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-8 relative">
            <div className="h-full w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 🟢 Timer 必须一直存在，只是看不见 */}
              <div className={activeTab === 'timer' ? 'h-full block' : 'hidden'}>
                <Timer />
              </div>

              {/* 其他组件可以懒加载，或者也用 hidden 保持状态 */}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'habits' && <Habits />}
              {activeTab === 'stats' && <StatsChart />}
              {activeTab === 'shop' && <Shop />}
              {activeTab === 'rank' && <Rank />}
              {activeTab === 'settings' && <Settings />}
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}