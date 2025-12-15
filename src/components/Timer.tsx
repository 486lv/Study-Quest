'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Zap, Clock, Leaf, Gamepad2, Sparkles, Disc, Pencil, Plus, Trophy, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
// 引入考古系统逻辑和配置
import { digForArtifact, Artifact, RARITY_CONFIG } from '@/data/artifactSystem';

// 设定剧情通关的阈值 (必须与 storyData.ts 中的最后一条剧情保持一致)
const STORY_END_XP = 20000;

export default function Timer() {
  const { 
    addSession, 
    strictMode, 
    customTags, 
    theme, 
    addTag, 
    xp, // 获取当前 XP 用于判断是否通关
    addArtifact // 获取添加文物的方法
  } = useStore();
  
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTag, setCurrentTag] = useState(customTags[0]?.name || '默认');
  const [targetMinutes, setTargetMinutes] = useState(25);
  
  // 🏆 结算奖励弹窗状态
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ energy: 0, xp: 0 });
  // 📦 新增：本次挖掘到的文物
  const [newArtifact, setNewArtifact] = useState<Artifact | null>(null);

  const startTimeRef = useRef<number>(0);     
  const pausedTimeRef = useRef<number>(0);    
  const lastPauseStartRef = useRef<number>(0);
  const initialTargetRef = useRef(25);
  const intervalRef = useRef<any>(null);

  const [displayTime, setDisplayTime] = useState(25 * 60); 

  useEffect(() => {
    if (!isActive) {
      setDisplayTime(mode === 'countdown' ? targetMinutes * 60 : 0);
    }
  }, [targetMinutes, mode, isActive]);

  const handleStart = () => { 
    setIsActive(true); 
    setIsPaused(false); 
    initialTargetRef.current = targetMinutes; 
    startTimeRef.current = Date.now(); 
    pausedTimeRef.current = 0; 
  };
  
  const handlePause = () => { setIsPaused(true); lastPauseStartRef.current = Date.now(); };
  const handleResume = () => { setIsPaused(false); pausedTimeRef.current += (Date.now() - lastPauseStartRef.current); };

  // 添加新标签
  const handleAddTag = () => {
    const newTag = window.prompt("🏷️ 请输入新标签名称：");
    if (newTag && newTag.trim() !== "") {
      if (addTag) {
        addTag(newTag);
        setCurrentTag(newTag);
      } else {
        alert("⚠️ 请先更新 useStore.ts 添加 addTag 方法！");
      }
    }
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
        if (mode === 'countdown') {
           const remaining = (initialTargetRef.current * 60) - elapsed;
           if (remaining <= 0) { setDisplayTime(0); handleFinish(true); } else { setDisplayTime(remaining); }
        } else { setDisplayTime(elapsed); }
      }, 100); 
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, mode]);

  // ==========================================
  // 核心结算逻辑
  // ==========================================
  const handleFinish = (isNaturalEnd = false) => {
    clearInterval(intervalRef.current);
    const now = Date.now();
    const elapsed = isPaused ? Math.floor((lastPauseStartRef.current - startTimeRef.current - pausedTimeRef.current) / 1000) : Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
    let actualMinutes = Math.floor(elapsed / 60);
    if (mode === 'countdown' && isNaturalEnd) actualMinutes = initialTargetRef.current;
    // //测试
    // actualMinutes = 100; // 强制设为 100 分钟，确保掉落率 100% 且大概率出传说

    setIsActive(false); setIsPaused(false);
    
    // 如果时间太短
    if (actualMinutes < 1) { 
      alert(`⚠️ 时间太短，无法获得能量`); 
      resetTimerState(); 
      return; 
    }
    
    // ✅ 触发奖励弹窗
    if (isNaturalEnd || mode === 'stopwatch') {
      const baseEnergy = actualMinutes * 1;
      const baseXp = actualMinutes * 10;
      setRewardData({ energy: baseEnergy, xp: baseXp });

      // 🔥🔥🔥 核心判断：只有 XP 达到剧情通关阈值，才触发考古 🔥🔥🔥
      if (xp >= STORY_END_XP) {
        const foundItem = digForArtifact(actualMinutes);
        if (foundItem) {
          setNewArtifact(foundItem);
          addArtifact(foundItem); // 存入 Store
        } else {
          setNewArtifact(null);
        }
      } else {
        setNewArtifact(null);
      }

      setShowReward(true);
      // 4秒后自动关闭，给用户多一点时间看文物
      setTimeout(() => setShowReward(false), 4000);
    }

    addSession({ 
      id: Date.now().toString(), 
      startTime: new Date(startTimeRef.current).toISOString(), 
      endTime: new Date().toISOString(), 
      durationMinutes: actualMinutes, 
      tag: currentTag, 
      note: '', 
      status: (mode==='countdown' && !isNaturalEnd && strictMode) ? 'abandoned' : 'completed', 
      mode 
    });
    resetTimerState();
  };

  const resetTimerState = () => { setDisplayTime(mode === 'countdown' ? targetMinutes * 60 : 0); startTimeRef.current = 0; pausedTimeRef.current = 0; };
  const formatTime = (sec: number) => { const m = Math.floor(Math.max(0, sec) / 60); const s = Math.max(0, sec) % 60; return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };
  
  const totalDuration = isActive 
    ? initialTargetRef.current * 60 
    : targetMinutes * 60;
  const rawProgress = mode === 'countdown' 
    ? (totalDuration > 0 ? displayTime / totalDuration : 0)
    : 1;
  const progress = Math.min(1, Math.max(0, rawProgress));

  // ==========================================
  // 奖励弹窗组件 (Reward Overlay)
  // ==========================================
  const RewardOverlay = () => (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
      <div className="bg-black/90 backdrop-blur-md border-2 border-yellow-400 p-8 rounded-2xl shadow-[0_0_50px_rgba(250,204,21,0.5)] flex flex-col items-center gap-4 text-center animate-bounce-subtle min-w-[320px]">
        
        {/* 基础奖励 */}
        <div className="flex flex-col items-center gap-2">
          <Trophy size={48} className="text-yellow-400 animate-pulse" />
          <div>
            <h2 className="text-2xl font-black text-white mb-1">SESSION COMPLETE!</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Focus Rewards</p>
          </div>
          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-yellow-400 drop-shadow-md">+{rewardData.energy}</span>
              <span className="text-[10px] font-bold text-yellow-400/80 uppercase">Energy</span>
            </div>
            <div className="w-[1px] bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-blue-400 drop-shadow-md">+{rewardData.xp}</span>
              <span className="text-[10px] font-bold text-blue-400/80 uppercase">XP</span>
            </div>
          </div>
        </div>

        {/* 📦 考古掉落 (只有挖到才显示) */}
        {newArtifact && (
          <div className="mt-4 pt-4 border-t border-white/10 w-full animate-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Endgame Discovery</span>
              <Sparkles size={14} className="text-purple-400" />
            </div>
            
            <div className={`relative bg-white/5 p-4 rounded-xl flex items-center gap-4 border overflow-hidden group transition-transform hover:scale-105`}
                 style={{ borderColor: RARITY_CONFIG[newArtifact.rarity].color }}>
              
              {/* 背景光效 */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundColor: RARITY_CONFIG[newArtifact.rarity].color }}></div>
              
              <div className="text-3xl relative z-10 drop-shadow-md">📦</div>
              <div className="text-left relative z-10 flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: RARITY_CONFIG[newArtifact.rarity].color }}>
                  {newArtifact.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate opacity-80">
                  {newArtifact.description}
                </div>
                <div className="mt-1 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/50 uppercase tracking-wider text-white/70">
                   {RARITY_CONFIG[newArtifact.rarity].label}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 粒子特效模拟 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute text-2xl animate-[float_2s_ease-out_infinite]" style={{
            left: `${20 + Math.random() * 60}%`, 
            top: '60%', 
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 0
          }}>✨</div>
        ))}
      </div>
    </div>
  );

  const renderTimerFace = () => {
    switch (theme) {
      case 'default':
        const circumference = 1068;
        const dashOffset = circumference * (1 - progress); 
        return (
          <div className="relative w-[350px] h-[350px] flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-indigo-600 blur-[60px] opacity-40 ${isActive && !isPaused ? 'animate-pulse' : ''}`}></div>
            <div className="absolute w-[90%] h-[90%] rounded-full bg-[#1e293b] border border-indigo-400/30 flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-10">
               <Sparkles className="absolute top-10 right-14 text-white/20 w-6 h-6 animate-pulse"/>
               <span className="text-8xl font-black tracking-tighter text-white z-20 drop-shadow-lg tabular-nums select-none">{formatTime(displayTime)}</span>
            </div>
            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-x-[-1] z-30 pointer-events-none">
               <circle cx="175" cy="175" r="170" fill="none" stroke="#334155" strokeWidth="3" opacity="0.3"/>
               <circle cx="175" cy="175" r="170" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-linear"/>
            </svg>
          </div>
        );

      case 'cyberpunk':
        return (
          <div className="relative w-[350px] h-[350px] flex items-center justify-center">
             <div className={`absolute inset-0 rounded-full border border-[#00ff41]/50 ${isActive ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
             <svg className="absolute w-full h-full animate-[spin_30s_linear_infinite]" viewBox="0 0 300 300">
                <path id="circlePath" d="M 150, 150 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" fill="transparent" />
                <text fill="#00ff41" fontSize="12" letterSpacing="4" opacity="0.8" fontWeight="bold"><textPath href="#circlePath">1011010100101011101010010101001010101110101001</textPath></text>
             </svg>
             <div className="z-10 bg-black px-8 py-4 border-2 border-[#00ff41] shadow-[0_0_20px_#00ff41] hover:scale-105 transition-transform group cursor-pointer hover:shadow-[0_0_40px_#00ff41]">
                <span className="text-7xl font-mono text-[#00ff41] font-black tracking-widest drop-shadow-none select-none">{formatTime(displayTime)}</span>
             </div>
          </div>
        );

      case 'pixel':
        return (
          <div className="relative w-[340px] p-6 bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col items-center hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all cursor-pointer">
             <div className="w-full bg-[#ff3d3d] text-white text-center py-1 font-pixel text-xs mb-4 border-b-4 border-black font-bold">PLAYER 1 START</div>
             <div className="flex items-center gap-2 mb-4">
               <Gamepad2 size={32} className="text-blue-600"/> 
               <span className="text-6xl font-pixel text-black font-black tracking-widest select-none">{formatTime(displayTime)}</span>
             </div>
             <div className="w-full h-8 border-4 border-black p-1 relative bg-gray-200 box-border">
                <div className="h-full bg-yellow-400 border-r-4 border-black transition-all duration-1000 ease-linear" style={{ width: `${progress * 100}%`, maxWidth: '100%' }}></div>
                <div className="absolute inset-0 flex pointer-events-none"><div className="flex-1 border-r-2 border-black/10 last:border-0 h-full"></div><div className="flex-1 border-r-2 border-black/10 last:border-0 h-full"></div><div className="flex-1 border-r-2 border-black/10 last:border-0 h-full"></div><div className="flex-1 border-r-2 border-black/10 last:border-0 h-full"></div></div>
             </div>
          </div>
        );

      case 'film':
        return (
          <div className="relative w-[360px] h-[360px] flex items-center justify-center">
             <div className={`relative w-full h-full rounded-full bg-[#18181b] border-8 border-[#27272a] flex items-center justify-center overflow-hidden transition-transform duration-[2s] ${isActive && !isPaused ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                <div className="absolute inset-0 rounded-full" style={{background: 'repeating-radial-gradient(#18181b 0, #18181b 2px, #404040 3px, #18181b 4px)'}}></div>
                <div className="absolute w-[120px] h-[120px] bg-[#f59e0b] rounded-full border-4 border-black flex items-center justify-center shadow-lg"><Disc size={40} className="text-black opacity-80"/></div>
             </div>
             <div className="absolute bottom-6 bg-[#292524] px-6 py-2 border border-[#57534e] shadow-2xl rounded rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                <span className="text-6xl font-serif text-[#f5f5f4] tabular-nums font-black drop-shadow-md select-none">{formatTime(displayTime)}</span>
             </div>
          </div>
        );

      case 'bw':
        return (
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
             <div className="absolute inset-0 border-4 border-[#2d2d2d] opacity-60" style={{borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'}}></div>
             <div className="absolute inset-2 border-2 border-[#2d2d2d] opacity-40" style={{borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'}}></div>
             <div className="z-10 flex flex-col items-center justify-center relative">
                <Pencil size={24} className="text-black mb-4 hover:rotate-12 transition-transform" />
                <div className="border-4 border-black px-8 py-4 bg-white relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all cursor-pointer" style={{borderRadius: '2px 4px 3px 2px'}}>
                   <span className="text-7xl font-serif text-black font-black tracking-tighter select-none">{formatTime(displayTime)}</span>
                </div>
                <span className="text-xs text-gray-500 font-serif mt-3 italic">Sketching...</span>
             </div>
          </div>
        );

      case 'forest':
        return (
          <div className="relative w-[320px] h-[320px] flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
             <div className="absolute inset-0 rounded-full border-[6px] border-[#10b981] bg-[#ecfdf5] overflow-hidden shadow-2xl">
                <div 
                  className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-linear z-0"
                  style={{ height: `${progress * 100}%` }}
                >
                   <div className="absolute bottom-0 w-[600px] h-[600px] bg-[#34d399] opacity-50 rounded-[40%]" style={{ left: '-140px', animation: 'wave-rotate 8s infinite linear', marginBottom: '-5%' }}></div>
                   <div className="absolute bottom-0 w-[600px] h-[600px] bg-[#10b981] opacity-40 rounded-[35%]" style={{ left: '-140px', animation: 'wave-rotate 6s infinite linear reverse', marginBottom: '-2%' }}></div>
                </div>
             </div>
             <div className="relative z-10 flex flex-col items-center justify-center bg-[#064e3b] px-12 py-8 rounded-3xl border-[3px] border-[#34d399] shadow-[0_15px_30px_rgba(6,78,59,0.4)] hover:scale-105 transition-transform cursor-pointer">
                <Leaf size={42} className="text-[#4ade80] mb-2 drop-shadow-sm" fill="currentColor" />
                <span className="text-7xl font-sans font-black text-white tracking-tight tabular-nums leading-none select-none">{formatTime(displayTime)}</span>
                <span className="text-[10px] font-bold text-[#6ee7b7] mt-3 tracking-[0.2em] uppercase">Focusing</span>
             </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center animate-in fade-in duration-500 relative">
      {/* 🟢 结算奖励弹窗 */}
      {showReward && <RewardOverlay />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-5xl items-center relative z-10">
        <div className={`flex justify-center select-none transition-all duration-500 hover:scale-105 ${isActive && !isPaused ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`}>
            {renderTimerFace()}
        </div>
        
        {/* 控制面板 */}
        <div className="bg-surface p-8 rounded-theme border border-border shadow-theme backdrop-blur-xl flex flex-col gap-6 w-full max-w-md mx-auto relative z-50">
           <div className="flex gap-3">
              {(['countdown', 'stopwatch'] as const).map((m) => (
                <button key={m} onClick={() => !isActive && setMode(m)} className={`flex-1 py-3 rounded-theme text-sm font-bold flex items-center justify-center gap-2 btn-bounce ${mode===m ? '!bg-primary text-primary-fg' : 'bg-transparent border border-border text-text hover:bg-black/5'}`}>
                  {m==='countdown'?<Clock size={16}/>:<Zap size={16}/>} {m==='countdown'?'倒计时':'正计时'}
                </button>
              ))}
           </div>
           
           {mode === 'countdown' && !isActive && (
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-text-muted"><span>时长: {targetMinutes} 分钟</span></div>
                <input 
                  type="range" 
                  min="1" 
                  max="120" 
                  value={targetMinutes} 
                  onChange={e=>setTargetMinutes(Number(e.target.value))} 
                  className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary opacity-100 hover:opacity-100 z-50 relative"
                />
             </div>
           )}

           <div className="flex flex-wrap gap-2">
              {/* 渲染现有标签 */}
              {customTags?.map((tag, idx) => (
                <button key={`${tag.name}-${idx}`} onClick={() => setCurrentTag(tag.name)} className={`px-3 py-1 rounded-theme text-xs border transition-all btn-bounce ${currentTag===tag.name ? 'border-primary text-primary font-bold' : 'border-transparent bg-black/5 text-text-muted hover:text-text'}`}>
                  {tag.name}
                </button>
              ))}
              {/* 添加标签按钮 */}
              <button 
                onClick={handleAddTag} 
                className="px-3 py-1 rounded-theme text-xs border border-dashed border-text-muted text-text-muted hover:text-primary hover:border-primary transition-all flex items-center gap-1"
                title="添加新标签"
              >
                <Plus size={12} />
              </button>
           </div>
           
           <div className="mt-4">
              {!isActive ? (
                <button onClick={handleStart} className="w-full py-4 rounded-theme !bg-primary text-primary-fg font-bold text-lg shadow-lg flex items-center justify-center gap-2 btn-bounce">
                  <Play size={20} fill="currentColor"/> 开始专注
                </button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={isPaused ? handleResume : handlePause} className="flex-1 py-4 rounded-theme border-2 border-primary !text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/10 btn-bounce">
                    {isPaused ? <Play size={20}/> : <Pause size={20}/>} {isPaused ? '继续' : '暂停'}
                  </button>
                  <button onClick={() => handleFinish(false)} className="px-6 rounded-theme bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all btn-bounce">
                    <X size={24}/>
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}