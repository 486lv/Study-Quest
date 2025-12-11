'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, PieChart as PieIcon, Activity, List, Clock } from 'lucide-react';

export default function StatsChart() {
  const { sessions, customTags } = useStore();
  // 🟢 新增 'year' 和 'all'
  const [range, setRange] = useState<'day'|'week'|'month'|'year'|'all'>('week');

  // --- 数据处理 ---
  const chartData = useMemo(() => {
    const now = new Date();
    let data: any[] = [];
    
    if (range === 'day') {
      // 过去7天 (按天)
      for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        const k = d.toISOString().split('T')[0];
        const mins = sessions.filter(s => s.startTime.startsWith(k) && s.status === 'completed').reduce((a,b)=>a+b.durationMinutes,0);
        data.push({ name: k.slice(5), mins });
      }
    } else if (range === 'week' || range === 'month') {
      // 过去4周 (按周 - 简化处理，实际还是按天聚合好看点)
      for(let i=29; i>=0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        const k = d.toISOString().split('T')[0];
        const mins = sessions.filter(s => s.startTime.startsWith(k) && s.status === 'completed').reduce((a,b)=>a+b.durationMinutes,0);
        data.push({ name: k.slice(8), mins }); // 只显示日期
      }
    } else if (range === 'year') {
      // 1-12月
      for(let i=0; i<12; i++) {
        const k = `${now.getFullYear()}-${(i+1).toString().padStart(2, '0')}`;
        const mins = sessions.filter(s => s.startTime.startsWith(k) && s.status === 'completed').reduce((a,b)=>a+b.durationMinutes,0);
        data.push({ name: `${i+1}月`, mins });
      }
    } else {
      // All (按年)
      const years = Array.from(new Set(sessions.map(s => s.startTime.slice(0,4)))).sort();
      if (years.length === 0) years.push(now.getFullYear().toString());
      years.forEach(y => {
        const mins = sessions.filter(s => s.startTime.startsWith(y) && s.status === 'completed').reduce((a,b)=>a+b.durationMinutes,0);
        data.push({ name: y, mins });
      });
    }
    return data;
  }, [sessions, range]);

  // 饼图
  const pieData = useMemo(() => {
    const map: any = {};
    // 简单起见，饼图始终显示总数据，或者你可以根据 range 过滤
    sessions.filter(s => s.status === 'completed').forEach(s => {
      map[s.tag] = (map[s.tag] || 0) + s.durationMinutes;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [sessions]);

  const totalMinutes = sessions.filter(s => s.status === 'completed').reduce((a,b)=>a+b.durationMinutes,0);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      
      {/* 顶部筛选 */}
      <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
        {['day', 'week', 'month', 'year', 'all'].map((r) => (
          <button 
            key={r}
            onClick={() => setRange(r as any)}
            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition ${range === r ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
           <div className="text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-2"><Clock size={12}/> Total Time</div>
           <div className="text-2xl font-bold text-white text-shadow">{(totalMinutes/60).toFixed(1)} <span className="text-sm font-normal text-slate-400">h</span></div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
           <div className="text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-2"><Activity size={12}/> Sessions</div>
           <div className="text-2xl font-bold text-blue-400 text-shadow">{sessions.length}</div>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-48 shrink-0">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col">
          <div className="text-xs font-bold text-slate-400 mb-2">Trend ({range})</div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill:'rgba(255,255,255,0.05)'}} contentStyle={{background:'#1e293b', border:'none', borderRadius:'8px', color:'#fff'}}/>
                <Bar dataKey="mins" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col">
          <div className="text-xs font-bold text-slate-400 mb-2">Distribution</div>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={5}>
                   {pieData.map((entry, index) => {
                     const color = customTags.find(t => t.name === entry.name)?.color || '#94a3b8';
                     return <Cell key={`cell-${index}`} fill={color} stroke="none"/>;
                   })}
                 </Pie>
                 <Tooltip contentStyle={{background:'#1e293b', border:'none', borderRadius:'8px'}}/>
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 详细记录 */}
      <div className="bg-white/5 rounded-2xl border border-white/10 flex-1 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-white/5 bg-black/20 flex items-center gap-2 text-xs font-bold text-slate-400">
           <List size={14}/> Records
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
           {sessions.slice().reverse().map(s => (
             <div key={s.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition border border-transparent hover:border-white/5">
               <div>
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-white font-medium shadow-sm">{s.tag}</span>
                   {s.note && <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 rounded truncate max-w-[120px]">{s.note}</span>}
                 </div>
                 <div className="text-[10px] text-slate-500 mt-0.5">{new Date(s.startTime).toLocaleString()}</div>
               </div>
               <div className="text-right">
                 <div className={`font-mono font-bold ${s.status==='completed'?'text-blue-400':'text-red-400'}`}>{s.durationMinutes}m</div>
                 <div className="text-[9px] text-slate-600 uppercase">{s.status}</div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}