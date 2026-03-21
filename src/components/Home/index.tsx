'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';

import Timer from '@/components/Timer';
import Settings from '@/components/Settings';
import Tasks from '@/components/Tasks';
import Habits from '@/components/Habits';
import StatsChart from '@/components/StatsChart';
import Shop from '@/components/Shop';
import StoryMode from '@/components/StoryMode';
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
  Box,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { user, energy, xp, activeTab, setActiveTab, theme, onboarding, dailyProgress, sessions, storyProgress, completeOnboarding } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabMeta: Record<string, { title: string; desc: string }> = {
    timer: { title: '专注模式', desc: '开始一段可追踪、可成长的专注循环。' },
    tasks: { title: '待办清单', desc: '先把最重要的一件事做完。' },
    habits: { title: '习惯打卡', desc: '用连续小胜稳定长期输出。' },
    stats: { title: '数据统计', desc: '用数据看清你的节奏与峰值。' },
    rank: { title: '剧情中心', desc: '专注推进段位，解锁主线和隐藏片段。' },
    shop: { title: '奖励商城', desc: '把专注收益兑换成现实奖励。' },
    museum: { title: '彩蛋收藏', desc: '回看你已触发的隐藏内容与线索。' },
    settings: { title: '应用设置', desc: '调整主题与数据配置。' },
  };

  const totalFocusedMinutes = useMemo(
    () =>
      sessions
        .filter((s) => s.status === 'completed')
        .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0),
    [sessions]
  );
  const totalFocusText = `${Math.floor(totalFocusedMinutes / 60)}h ${totalFocusedMinutes % 60}m`;

  if (!mounted) return null;

  const NavButton = ({ tab, icon: Icon, label }: any) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`w-full py-3 px-4 rounded-theme flex items-center gap-3 mb-2 transition-all group ${
          isActive ? 'bg-primary text-primary-fg font-bold' : 'text-text-muted hover:text-text hover:bg-white/5'
        }`}
      >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  const onboardingText = {
    1: '欢迎来到 Study Quest。第一步：开始一次专注。',
    2: '很好，第二步：完成一次专注并领取奖励。',
    3: '最后一步：去剧情或收藏查看你的解锁内容。',
  } as const;

  return (
    <div data-theme={theme} className="flex h-screen w-screen bg-background text-text overflow-hidden relative font-sans items-center justify-center transition-colors duration-700">
      {!onboarding.completed && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] bg-black/80 border border-primary/50 rounded-xl px-4 py-3 text-sm shadow-xl max-w-xl w-[92%]">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-bold mb-1">新手引导 {onboarding.step}/3</div>
              <div className="text-text/80 text-xs">{onboardingText[onboarding.step]}</div>
            </div>
            <button onClick={completeOnboarding} className="text-xs px-2 py-1 rounded border border-slate-500 hover:bg-white/10">跳过</button>
          </div>
          {onboarding.step === 3 && (
            <div className="mt-2 flex gap-2">
              <button onClick={() => setActiveTab('rank')} className="text-xs px-2.5 py-1 rounded bg-primary text-white">去剧情</button>
              <button onClick={() => setActiveTab('museum')} className="text-xs px-2.5 py-1 rounded border border-slate-500">去收藏</button>
              <button onClick={completeOnboarding} className="text-xs px-2.5 py-1 rounded border border-emerald-500 text-emerald-300">完成引导</button>
            </div>
          )}
        </div>
      )}

      <div className="w-[95%] h-[92%] max-w-[1400px] bg-surface backdrop-blur-md rounded-theme border border-border flex overflow-hidden relative z-10 shadow-theme ring-1 ring-white/5">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <aside className="w-64 border-r border-border flex flex-col py-8 px-4 shrink-0 bg-black/5 relative transition-colors duration-300">
          <div className="mb-6 px-2">
            <div className="text-xs text-text-muted">Windows Local App</div>
            <div className="text-lg font-black text-text truncate">{user.username || 'Operator'}</div>
            <div className="text-xs text-text-muted mt-1">XP: {xp}</div>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            <NavButton tab="timer" icon={TimerIcon} label="Focus 专注" />
            <NavButton tab="tasks" icon={ListTodo} label="Tasks 待办" />
            <NavButton tab="habits" icon={CalendarCheck} label="Habits 打卡" />
            <NavButton tab="stats" icon={LayoutDashboard} label="Stats 统计" />
            <div className="my-4 border-t border-border/50"></div>
            <NavButton tab="rank" icon={Trophy} label="Story 剧情" />
            <NavButton tab="shop" icon={ShoppingBag} label="Shop 商城" />
            <NavButton tab="museum" icon={Box} label="Museum 彩蛋" />
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <div className="bg-white/5 p-3 rounded-theme border border-border flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Zap size={14} className="text-yellow-400" fill="currentColor" /><span className="text-xs font-bold text-text-muted">能量</span></div>
              <span className="font-mono font-bold text-yellow-500">{energy}</span>
            </div>

            <button onClick={() => setActiveTab('settings')} className="w-full py-3 px-4 rounded-theme flex items-center gap-3 text-text-muted hover:bg-white/5 hover:text-text transition group border border-transparent hover:border-border">
              <SettingsIcon size={20} />
              <span className="text-sm font-medium">设置</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          <div className="px-8 pt-6 pb-4 border-b border-border/70 bg-black/5">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <div>
                <div className="text-2xl font-black tracking-tight text-text">{tabMeta[activeTab]?.title || 'Study Quest'}</div>
                <div className="text-xs text-text-muted mt-1">{tabMeta[activeTab]?.desc || ''}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="px-3 py-2 rounded-lg border border-border bg-black/10">
                  连续天数: <span className="font-bold text-text">{dailyProgress.streakDays}</span>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border bg-black/10">
                  累计专注: <span className="font-bold text-text">{totalFocusText}</span>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border bg-black/10">
                  段位: <span className="font-bold text-text">{storyProgress.storyRank}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-8 relative overflow-y-auto custom-scrollbar">
            <div className="h-full w-full max-w-6xl mx-auto">
              <div className={`h-full ${activeTab === 'timer' ? 'block' : 'hidden'}`}><Timer /></div>
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'habits' && <Habits />}
              {activeTab === 'stats' && <StatsChart />}
              {activeTab === 'shop' && <Shop />}
              {activeTab === 'rank' && <StoryMode />}
              {activeTab === 'museum' && <Museum />}
              {activeTab === 'settings' && <Settings />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
