'use client';
import { useState, useMemo, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Check, Trash2, Plus, Flag, Calendar, AlertCircle } from 'lucide-react';

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask, updateTaskPriority } = useStore();
  const dateInputRef = useRef<HTMLInputElement>(null); // 🟢 关键：引用 Input
  
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) { 
      addTask(input.trim(), priority, dueDate || undefined); 
      setInput(''); 
      setPriority('normal');
      setDueDate('');
    }
  };

  // 🟢 强制唤起日历
  const openDatePicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (e) {
        // 兼容性回退
        dateInputRef.current.focus();
      }
    }
  };

  const sortedPendingTasks = useMemo(() => {
    return tasks.filter(t => !t.isCompleted).sort((a, b) => {
      const pWeight = { high: 3, normal: 2, low: 1 };
      if (pWeight[a.priority] !== pWeight[b.priority]) return pWeight[b.priority] - pWeight[a.priority];
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks]);

  const doneTasks = tasks.filter(t => t.isCompleted);

  const cyclePriority = (id: string, current: string) => {
    const next = current === 'high' ? 'normal' : current === 'normal' ? 'low' : 'high';
    updateTaskPriority(id, next as any);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text tracking-tight text-shadow">待办清单</h2>
        <p className="text-text/60 text-sm text-shadow">按重要程度自动排序</p>
      </div>

      <form onSubmit={handleAdd} className="relative mb-8 group z-10">
        <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-border p-3 shadow-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="添加一个任务..." 
            className="w-full bg-transparent px-2 py-1 text-text outline-none placeholder-white/40 text-shadow text-lg"
            autoFocus
          />
          
          <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setPriority(priority === 'high' ? 'normal' : priority === 'normal' ? 'low' : 'high')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  priority === 'high' ? 'bg-red-500/20 text-red-300' : 
                  priority === 'low' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-slate-300'
                }`}
              >
                <Flag size={12} fill={priority === 'high' ? 'currentColor' : 'none'}/>
                {priority === 'high' ? '重要' : priority === 'normal' ? '普通' : '不急'}
              </button>

              {/* 🟢 修复：点击按钮调用 openDatePicker */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={openDatePicker}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dueDate ? 'bg-primary/30 text-blue-200' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                >
                  <Calendar size={12} />
                  <span>{dueDate || '截止日期'}</span>
                </button>
                {/* 隐藏的 Input，只负责接收值 */}
                <input 
                  ref={dateInputRef}
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2 bg-primary hover:bg-blue-500 text-text rounded-xl disabled:opacity-50 disabled:bg-slate-700 transition shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        <div className="space-y-3">
          {sortedPendingTasks.map(t => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
            return (
              <div key={t.id} className="group flex items-start gap-3 p-4 rounded-2xl bg-surface border border-white/5 hover:bg-black/40 hover:border-white/20 transition-all duration-200 backdrop-blur-sm shadow-sm">
                <button onClick={() => toggleTask(t.id)} className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.priority === 'high' ? 'border-red-400/50 hover:bg-red-400/20' : 'border-white/30 hover:border-blue-400 hover:bg-blue-400/10'}`}></button>
                <div className="flex-1 min-w-0">
                  <div className={`text-base truncate text-shadow ${t.priority === 'high' ? 'text-red-100 font-bold' : 'text-text'}`}>{t.title}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <button onClick={() => cyclePriority(t.id, t.priority)} className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded hover:bg-white/20 transition cursor-pointer">
                      <Flag size={10} className={t.priority === 'high' ? 'text-red-400 fill-current' : t.priority === 'low' ? 'text-green-400' : 'text-text-muted'}/>
                      <span className="text-text/70">{t.priority === 'high' ? 'High' : t.priority === 'normal' ? 'Normal' : 'Low'}</span>
                    </button>
                    {t.dueDate && <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/10 text-blue-200'}`}>{isOverdue ? <AlertCircle size={10}/> : <Calendar size={10}/>}{t.dueDate} {isOverdue && '(过期)'}</span>}
                  </div>
                </div>
                <button onClick={() => deleteTask(t.id)} className="p-2 text-text/40 hover:text-red-400 hover:bg-surface rounded-lg opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>
        {doneTasks.length > 0 && (
          <div className="pt-8 border-t border-border mt-4">
            <h3 className="text-xs font-bold text-text/50 uppercase mb-4 ml-1 flex items-center gap-2 text-shadow"><Check size={14}/> 已完成 ({doneTasks.length})</h3>
            <div className="space-y-2">
              {doneTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/10 border border-white/5 opacity-50 hover:opacity-100 transition">
                  <button onClick={() => toggleTask(t.id)} className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500 text-blue-500 flex items-center justify-center"><Check size={12} strokeWidth={4} /></button>
                  <span className="text-sm text-text/60 line-through flex-1">{t.title}</span>
                  <button onClick={() => deleteTask(t.id)} className="text-text/40 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}