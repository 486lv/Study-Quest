'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle, Flame, CalendarCheck, Plus, Trash2 } from 'lucide-react';

const EMOJIS = ['✨', '📚', '💪', '🧘', '💧', '🍎', '🎸', '💻', '💤', '🌅', '💊', '🧹', '🎨', '🎵'];

export default function Habits() {
  const { habits, checkInHabit, addHabit, deleteHabit } = useStore();
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EMOJIS[0]);
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit(newName, selectedIcon);
    setNewName('');
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* 头部固定区域 */}
      <div className="shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight text-shadow flex items-center gap-2">
            <CalendarCheck className="text-blue-400"/> 日常打卡
          </h2>
          <p className="text-white/60 text-sm text-shadow">养成好习惯，每天坚持一点点。</p>
        </div>

        {/* 添加习惯区域 */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 flex flex-wrap gap-4 items-center shadow-lg">
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar max-w-[200px] md:max-w-xs hide-scrollbar">
              {EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => setSelectedIcon(emoji)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition flex-shrink-0 ${selectedIcon === emoji ? 'bg-blue-600 shadow-lg scale-110' : 'bg-black/20 hover:bg-white/10'}`}>
                      {emoji}
                  </button>
              ))}
          </div>
          <input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="习惯名称 (如: 喝水)"
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 min-w-[120px]"
          />
          <button onClick={handleAdd} disabled={!newName} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 shrink-0">
              <Plus size={18}/> 添加
          </button>
        </div>
      </div>

      {/* 🟢 修复点：滚动区域 flex-1 + min-h-0 确保只在这里滚动 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(habit => {
            const isCheckedToday = habit.lastCheckIn === today;

            return (
              <div 
                key={habit.id} 
                className={`relative p-6 rounded-3xl border transition-all duration-300 group overflow-hidden ${
                  isCheckedToday 
                    ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* 删除按钮 */}
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm(`确定删除 "${habit.name}" 吗？`)) deleteHabit(habit.id); }}
                  className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>

                <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 pointer-events-none select-none grayscale group-hover:grayscale-0 transition duration-500">
                  {habit.icon}
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                        {habit.icon}
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isCheckedToday ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-orange-500/10 text-orange-300 border-orange-500/20'}`}>
                        <Flame size={12} fill="currentColor" />
                        {habit.streak} 天
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 truncate">{habit.name}</h3>
                    <p className="text-xs text-white/40">
                      {isCheckedToday ? '已完成' : '未打卡'}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                      {last7Days.map(date => {
                        const isDone = habit.history.includes(date);
                        const isToday = date === today;
                        return (
                          <div key={date} className="flex flex-col items-center gap-1">
                            <div 
                              className={`w-2 h-2 rounded-full transition-all ${
                                isDone ? 'bg-green-400 shadow-[0_0_5px_theme(colors.green.400)]' : 'bg-white/10'
                              } ${isToday && !isDone ? 'animate-pulse bg-blue-400' : ''}`}
                              title={date}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => checkInHabit(habit.id)}
                      disabled={isCheckedToday}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isCheckedToday
                          ? 'bg-green-500 text-white shadow-lg cursor-default'
                          : 'bg-white text-black hover:bg-blue-50 shadow-md hover:shadow-xl'
                      }`}
                    >
                      {isCheckedToday ? (
                        <> <CheckCircle size={18} /> 已完成 </>
                      ) : (
                        '立即打卡'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}