'use client';

import { useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Calendar, Check, CheckCheck, ChevronLeft, ChevronRight, Clock3, Flag, Pencil, Plus, Search, Trash2 } from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'done' | 'today' | 'overdue';

type EditState = {
  id: string;
  title: string;
  priority: 'high' | 'normal' | 'low';
  dueDate: string;
  description: string;
} | null;

const pad2 = (n: number) => String(n).padStart(2, '0');
const dateStr = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function Tasks() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskPriority,
    updateTask,
    completeTasks,
    clearCompletedTasks,
    postponeTask,
  } = useStore();

  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [dueDate, setDueDate] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all');

  const [selectedDate, setSelectedDate] = useState(dateStr(new Date()));
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [editing, setEditing] = useState<EditState>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = dateStr(new Date());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTask(input.trim(), priority, dueDate || undefined, description || undefined);
    setInput('');
    setDescription('');
    setPriority('normal');
    setDueDate('');
  };

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const isOverdue = !!t.dueDate && t.dueDate < today && !t.isCompleted;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && !t.isCompleted) ||
        (statusFilter === 'done' && t.isCompleted) ||
        (statusFilter === 'today' && t.dueDate === today) ||
        (statusFilter === 'overdue' && isOverdue);

      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchQuery = !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      return matchStatus && matchPriority && matchQuery;
    }).sort((a, b) => {
      const w = { high: 3, normal: 2, low: 1 };
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (w[a.priority] !== w[b.priority]) return w[b.priority] - w[a.priority];
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, query, statusFilter, priorityFilter, today]);

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === selectedDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [tasks, selectedDate]
  );

  const overdueTasks = useMemo(
    () => tasks.filter((t) => !!t.dueDate && t.dueDate < today && !t.isCompleted),
    [tasks, today]
  );

  const monthDays = useMemo(() => {
    const first = new Date(viewMonth.year, viewMonth.month, 1);
    const last = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startWeekDay = first.getDay() || 7;
    const total = last.getDate();

    const cells: Array<{ label: number | ''; fullDate: string }> = [];
    for (let i = 1; i < startWeekDay; i++) cells.push({ label: '', fullDate: '' });
    for (let d = 1; d <= total; d++) {
      const dt = dateStr(new Date(viewMonth.year, viewMonth.month, d));
      cells.push({ label: d, fullDate: dt });
    }
    while (cells.length % 7 !== 0) cells.push({ label: '', fullDate: '' });
    return cells;
  }, [viewMonth]);

  const mapCountByDate = useMemo(() => {
    const map: Record<string, { all: number; done: number; overdue: number }> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      if (!map[t.dueDate]) map[t.dueDate] = { all: 0, done: 0, overdue: 0 };
      map[t.dueDate].all += 1;
      if (t.isCompleted) map[t.dueDate].done += 1;
      if (!t.isCompleted && t.dueDate < today) map[t.dueDate].overdue += 1;
    }
    return map;
  }, [tasks, today]);

  const openEdit = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditing({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate || '',
      description: t.description || '',
    });
  };

  const applyEdit = () => {
    if (!editing || !editing.title.trim()) return;
    updateTask(editing.id, {
      title: editing.title.trim(),
      priority: editing.priority,
      dueDate: editing.dueDate,
      description: editing.description,
    });
    setEditing(null);
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
      <div className="h-full flex flex-col min-h-0">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-text tracking-tight">待办清单</h2>
          <p className="text-text/60 text-sm">编辑、筛选、批量操作与月历联动</p>
        </div>

        <form onSubmit={handleAdd} className="mb-4 rounded-2xl border border-border bg-black/20 p-3 space-y-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="添加一个任务..." className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="任务说明（可选）" className="w-full bg-background border border-border rounded px-3 py-2 text-xs min-h-[66px]" />
          <div className="flex flex-wrap gap-2 items-center">
            <button type="button" onClick={() => setPriority(priority === 'high' ? 'normal' : priority === 'normal' ? 'low' : 'high')} className={`px-3 py-1.5 rounded text-xs border ${priority === 'high' ? 'border-red-400 text-red-300 bg-red-500/10' : priority === 'low' ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10' : 'border-border text-text-muted'}`}>
              <Flag size={12} className="inline mr-1" />{priority === 'high' ? '重要' : priority === 'normal' ? '普通' : '不急'}
            </button>
            <button type="button" onClick={() => dateInputRef.current?.showPicker?.()} className="px-3 py-1.5 rounded text-xs border border-border text-text-muted">
              <Calendar size={12} className="inline mr-1" />{dueDate || '截止日期'}
            </button>
            <input ref={dateInputRef} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="hidden" />
            <button type="submit" className="ml-auto px-3 py-1.5 rounded bg-primary text-white text-xs font-bold"><Plus size={12} className="inline mr-1" />添加</button>
          </div>
        </form>

        <div className="mb-3 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题/说明" className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="bg-background border border-border rounded px-2 py-2 text-xs">
            <option value="all">全部状态</option>
            <option value="pending">未完成</option>
            <option value="done">已完成</option>
            <option value="today">今日截止</option>
            <option value="overdue">已逾期</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="bg-background border border-border rounded px-2 py-2 text-xs">
            <option value="all">全部优先级</option>
            <option value="high">高</option>
            <option value="normal">中</option>
            <option value="low">低</option>
          </select>
          <div className="flex gap-1">
            <button onClick={() => completeTasks(filteredTasks.filter((t) => !t.isCompleted).map((t) => t.id))} disabled={filteredTasks.filter((t) => !t.isCompleted).length === 0} className="px-2 py-2 text-[11px] rounded border border-emerald-500/40 text-emerald-300 disabled:opacity-40"><CheckCheck size={12} className="inline mr-1" />完成筛选</button>
            <button onClick={clearCompletedTasks} className="px-2 py-2 text-[11px] rounded border border-red-500/40 text-red-300"><Trash2 size={12} className="inline mr-1" />清已完</button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-2">
          {filteredTasks.map((t) => {
            const isOverdue = !!t.dueDate && t.dueDate < today && !t.isCompleted;
            return (
              <div key={t.id} className={`rounded-xl border p-3 ${t.isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border bg-black/10'}`}>
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleTask(t.id)} className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${t.isCompleted ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'border-border text-transparent hover:text-slate-300'}`}>
                    <Check size={12} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${t.isCompleted ? 'line-through text-text/50' : 'text-text'}`}>{t.title}</div>
                    {!!t.description && <div className="text-xs text-text/65 mt-1 line-clamp-2">{t.description}</div>}
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                      <button onClick={() => updateTaskPriority(t.id, t.priority === 'high' ? 'normal' : t.priority === 'normal' ? 'low' : 'high')} className={`px-2 py-0.5 rounded border ${t.priority === 'high' ? 'border-red-400/40 text-red-300' : t.priority === 'low' ? 'border-emerald-400/40 text-emerald-300' : 'border-border text-text-muted'}`}>优先级: {t.priority}</button>
                      {t.dueDate && <span className={`px-2 py-0.5 rounded border ${isOverdue ? 'border-red-400/40 text-red-300' : 'border-blue-400/40 text-blue-300'}`}>{isOverdue ? '逾期' : '截止'}: {t.dueDate}</span>}
                      {!t.isCompleted && (
                        <>
                          <button onClick={() => postponeTask(t.id, 'tomorrow')} className="px-2 py-0.5 rounded border border-border text-text-muted">延期到明天</button>
                          <button onClick={() => postponeTask(t.id, 'weekend')} className="px-2 py-0.5 rounded border border-border text-text-muted">延期到周末</button>
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={() => openEdit(t.id)} className="p-1 text-text-muted hover:text-text"><Pencil size={14} /></button>
                  <button onClick={() => deleteTask(t.id)} className="p-1 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-full min-h-0 rounded-2xl border border-border bg-black/10 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setViewMonth((m) => ({ year: m.month === 0 ? m.year - 1 : m.year, month: m.month === 0 ? 11 : m.month - 1 }))} className="p-1 rounded border border-border"><ChevronLeft size={14} /></button>
          <div className="text-center">
            <div className="font-bold text-sm">{viewMonth.year} / {viewMonth.month + 1}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">今日：{today}</div>
          </div>
          <button onClick={() => setViewMonth((m) => ({ year: m.month === 11 ? m.year + 1 : m.year, month: m.month === 11 ? 0 : m.month + 1 }))} className="p-1 rounded border border-border"><ChevronRight size={14} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] text-text-muted mb-1">
          {['一', '二', '三', '四', '五', '六', '日'].map((w) => <div key={w} className="text-center">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((cell, idx) => {
            if (!cell.label) return <div key={`empty-${idx}`} className="h-10 rounded border border-transparent" />;
            const count = mapCountByDate[cell.fullDate];
            const isSelected = cell.fullDate === selectedDate;
            const isToday = cell.fullDate === today;
            return (
              <button key={cell.fullDate} onClick={() => { setSelectedDate(cell.fullDate); setStatusFilter('all'); }} className={`h-10 rounded border text-xs relative ${isSelected ? 'border-primary bg-primary/15 text-primary' : isToday ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-border text-text hover:bg-white/5'}`}>
                {cell.label}
                {!!count?.all && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${count.overdue > 0 ? 'bg-red-400' : count.done === count.all ? 'bg-emerald-400' : 'bg-blue-400'}`} />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
          <div>
            <div className="text-xs font-bold text-text-muted mb-2">{selectedDate} 的任务 ({dayTasks.length})</div>
            <div className="space-y-1.5">
              {dayTasks.length === 0 ? <div className="text-xs text-text-muted">当天没有截止任务</div> : dayTasks.map((t) => <div key={t.id} className="text-xs border border-border rounded px-2 py-1.5">{t.title}</div>)}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-red-300 mb-2 flex items-center gap-1"><Clock3 size={12} />逾期任务 ({overdueTasks.length})</div>
            <div className="space-y-1.5">
              {overdueTasks.length === 0 ? <div className="text-xs text-text-muted">无逾期</div> : overdueTasks.map((t) => <div key={t.id} className="text-xs border border-red-500/30 bg-red-500/10 rounded px-2 py-1.5">{t.title} · {t.dueDate}</div>)}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-bold">编辑任务</div>
            <input value={editing.title} onChange={(e) => setEditing((s) => s ? { ...s, title: e.target.value } : s)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            <textarea value={editing.description} onChange={(e) => setEditing((s) => s ? { ...s, description: e.target.value } : s)} className="w-full bg-background border border-border rounded px-3 py-2 text-xs min-h-[68px]" />
            <div className="grid grid-cols-2 gap-2">
              <select value={editing.priority} onChange={(e) => setEditing((s) => s ? { ...s, priority: e.target.value as any } : s)} className="bg-background border border-border rounded px-2 py-2 text-xs">
                <option value="high">高</option>
                <option value="normal">中</option>
                <option value="low">低</option>
              </select>
              <input type="date" value={editing.dueDate} onChange={(e) => setEditing((s) => s ? { ...s, dueDate: e.target.value } : s)} className="bg-background border border-border rounded px-2 py-2 text-xs" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded border border-border text-xs">取消</button>
              <button onClick={applyEdit} className="px-3 py-1.5 rounded bg-primary text-white text-xs font-bold">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
