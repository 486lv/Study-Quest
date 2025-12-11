'use client';
import { useStore, RANK_SYSTEM } from '@/store/useStore';

export default function Rank() {
  const { xp } = useStore();

  // 找到当前段位
  const currentRankIndex = RANK_SYSTEM.findIndex((r, i) => {
    const nextRank = RANK_SYSTEM[i + 1];
    return xp >= r.minXP && (!nextRank || xp < nextRank.minXP);
  });
  const currentRank = RANK_SYSTEM[currentRankIndex] || RANK_SYSTEM[0];
  const nextRank = RANK_SYSTEM[currentRankIndex + 1];
  
  // 计算本级进度
  const prevLimit = currentRank.minXP;
  const nextLimit = nextRank ? nextRank.minXP : prevLimit * 2; // 满级处理
  const percent = Math.min(100, ((xp - prevLimit) / (nextLimit - prevLimit)) * 100);

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      
      {/* 左侧：段位阶梯列表 */}
      <div className="w-1/3 bg-slate-800/30 rounded-2xl border border-slate-700 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {RANK_SYSTEM.map((rank, idx) => {
          const isUnlocked = idx <= currentRankIndex;
          const isCurrent = idx === currentRankIndex;
          
          return (
             <div key={rank.name} className={`flex items-center gap-3 p-3 rounded-xl transition ${isCurrent ? 'bg-slate-700 border border-slate-500 shadow-lg' : 'hover:bg-slate-800/50 border border-transparent'} ${!isUnlocked && 'opacity-30 grayscale'}`}>
               <div className="text-2xl">{rank.icon}</div>
               <div>
                 <div className={`text-sm font-bold ${rank.color}`}>{rank.name}</div>
                 <div className="text-[10px] text-slate-500">{rank.minXP} XP</div>
               </div>
               {isCurrent && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
             </div>
          );
        })}
      </div>

      {/* 右侧：当前进度详情 */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/30 rounded-2xl border border-slate-700 p-8 relative overflow-hidden">
        {/* 背景光效 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-4 drop-shadow-2xl">{currentRank.icon}</div>
          <h2 className={`text-4xl font-bold mb-2 ${currentRank.color}`}>{currentRank.name}</h2>
          <p className="text-slate-400 font-mono mb-8">Current Rank</p>
          
          <div className="w-64">
            <div className="flex justify-between text-xs text-slate-500 mb-1 font-bold">
               <span>XP {xp}</span>
               <span>{nextRank ? nextRank.minXP : 'MAX'}</span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {nextRank ? `距离 [${nextRank.name}] 还差 ${nextRank.minXP - xp} XP` : '你已登峰造极！'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}