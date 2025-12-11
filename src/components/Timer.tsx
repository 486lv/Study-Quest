'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, CheckCircle, Tag, Settings2, X, Zap, Clock, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

const MODES = [
  { id: 'countdown', label: '倒计时', icon: Clock },
  { id: 'stopwatch', label: '正计时', icon: Zap },
];

export default function Timer() {
  // 🟢 修复：这里补上了 setStrictMode
  const { addSession, strictMode, setStrictMode, customTags, addTag, removeTag } = useStore();
  
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [currentTag, setCurrentTag] = useState(customTags[0]?.name || '默认');
  const [targetMinutes, setTargetMinutes] = useState(25);
  
  const initialTargetRef = useRef(25);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0); 

  const [isTagEditing, setIsTagEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (mode === 'countdown' && !isActive) {
      setTimeLeft(targetMinutes * 60);
    }
  }, [targetMinutes, mode, isActive]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    initialTargetRef.current = targetMinutes;
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (mode === 'countdown') {
          setTimeLeft(p => { 
            if (p <= 1) { 
              handleFinish(true); 
              return 0; 
            } 
            return p - 1; 
          });
        } else if (mode === 'stopwatch') {
          setElapsed(p => p + 1);
        }
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, mode]);

  const handleFinish = (isNaturalEnd = false) => {
    clearInterval(intervalRef.current);
    const currentMode = mode;
    let actualMinutes = 0;

    if (currentMode === 'countdown') {
      if (isNaturalEnd) {
        actualMinutes = initialTargetRef.current;
      } else {
        const totalSeconds = initialTargetRef.current * 60;
        const elapsedSeconds = totalSeconds - timeLeft;
        actualMinutes = Math.floor(elapsedSeconds / 60);
      }
    } else if (currentMode === 'stopwatch') {
        actualMinutes = Math.floor(elapsed / 60);
    }

    setIsActive(false); 
    setIsPaused(false);

    if (actualMinutes < 1) {
        alert(`⚠️ 坚持时间不足 1 分钟 (${actualMinutes} min)，本次不计入成绩！`);
        resetTimerState();
        return;
    }

    const isCompleted = currentMode === 'countdown' ? isNaturalEnd : true;
    let finalStatus: 'completed' | 'abandoned' = isCompleted ? 'completed' : 'abandoned';

    if (!isNaturalEnd && strictMode && currentMode === 'countdown') {
        finalStatus = 'abandoned';
        alert(`🥀 严厉模式：未完成目标，记为枯萎。`);
    } else {
        const xpEarned = actualMinutes * 10;
        const energyEarned = actualMinutes;
        const note = prompt(`🎉 结束！\n⏱️ 有效时长: ${actualMinutes} 分钟\n💎 获得: +${xpEarned} XP, +${energyEarned} 能量\n📝 写点心得？(可选)`);
        
        addSession({ 
            id: Date.now().toString(), 
            startTime: new Date().toISOString(), 
            endTime: new Date().toISOString(), 
            durationMinutes: actualMinutes,
            tag: currentTag, 
            note: typeof note === 'string' ? note : '', 
            status: finalStatus, 
            mode: currentMode
        });
    }

    resetTimerState();
  };

  const resetTimerState = () => {
    setTimeLeft(targetMinutes * 60);
    setElapsed(0);
  };

  const formatTime = (sec: number) => { const m = Math.floor(sec / 60); const s = sec % 60; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; };
  const handleAddTag = () => { if (newTagName) { addTag(newTagName, newTagColor); setNewTagName(''); } };

  return (
    <div className="h-full w-full flex items-center justify-center animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
        
        {/* 左侧圆环 */}
        <div className="flex flex-col items-center justify-center">
          <div className={`relative w-[400px] h-[400px] rounded-full border-8 flex flex-col items-center justify-center transition-all duration-700 ${isActive ? 'border-blue-500 bg-black/40 shadow-[0_0_80px_rgba(59,130,246,0.3)]' : 'border-white/5 bg-white/[0.02]'}`}>
            <div className="text-9xl font-mono font-bold text-white tracking-tighter drop-shadow-2xl tabular-nums leading-none">
              {mode === 'countdown' ? formatTime(timeLeft) : formatTime(elapsed)}
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-2">
               <div className="px-4 py-2 rounded-full text-base font-bold text-white border border-white/10 flex items-center gap-2 backdrop-blur-md bg-white/5">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: customTags.find(t=>t.name===currentTag)?.color}}></div>
                 {currentTag}
               </div>
               {isActive && strictMode && mode === 'countdown' && (
                 <span className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 animate-pulse">⚡ 严厉模式生效中</span>
               )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-white/40 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Info size={14} />
            <span>奖励规则: 1 分钟 = <span className="text-blue-400 font-bold">10 XP</span> + <span className="text-yellow-400 font-bold">1 能量</span></span>
          </div>
        </div>

        {/* 右侧控制台 */}
        <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl h-full max-h-[500px] flex flex-col overflow-y-auto custom-scrollbar">
          
          <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl shrink-0">
            {MODES.map(m => (
              <button key={m.id} onClick={() => { if(!isActive) setMode(m.id as any); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <m.icon size={16}/> {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 h-full">
            {!isActive && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white flex items-center gap-2"><Tag size={16}/> 标签选择</span>
                  <button onClick={() => setIsTagEditing(!isTagEditing)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition"><Settings2 size={18}/></button>
                </div>

                {!isTagEditing ? (
                  <div className="flex flex-wrap gap-3">
                    {customTags.map(tag => (
                      <button key={tag.name} onClick={() => setCurrentTag(tag.name)} className={`px-4 py-2 rounded-xl text-sm font-medium transition border flex items-center gap-2 ${currentTag === tag.name ? 'bg-white/10 border-white/30 text-white' : 'border-transparent bg-black/20 text-slate-400 hover:text-white'}`}>
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: tag.color}}></div>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {customTags.map(tag => (
                        <div key={tag.name} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: tag.color}}></div>
                            <span className="text-xs text-slate-300">{tag.name}</span>
                          </div>
                          <button onClick={() => removeTag(tag.name)} className="text-slate-500 hover:text-red-400"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
                      <div className="flex gap-2">
                        <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="新标签名" className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/10 focus:border-blue-500"/>
                        <button onClick={handleAddTag} disabled={!newTagName} className="bg-blue-600 px-4 rounded-lg text-white text-xs font-bold disabled:opacity-50">添加</button>
                      </div>
                      <div className="flex gap-2 justify-between">
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setNewTagColor(c)} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${newTagColor===c ? 'ring-2 ring-white scale-110':''}`} style={{backgroundColor:c}}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isActive && mode === 'countdown' && (
              <div className="space-y-6 mt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                      <span>专注时长</span>
                      <span className="text-white">{targetMinutes} min</span>
                    </div>
                    <input type="range" min="1" max="120" step="1" value={targetMinutes} onChange={e => setTargetMinutes(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                  </div>
                  
                  <div onClick={() => setStrictMode(!strictMode)} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${strictMode ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${strictMode ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}><Zap size={18} fill={strictMode?"currentColor":"none"}/></div>
                      <div>
                        <div className={`text-sm font-bold ${strictMode ? 'text-red-200' : 'text-slate-300'}`}>严厉模式</div>
                        <div className="text-[10px] text-slate-500">无法暂停，放弃即扣分</div>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${strictMode ? 'bg-red-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${strictMode ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              {!isActive ? (
                <button onClick={handleStart} className="w-full py-5 bg-white hover:bg-blue-50 text-black rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-transform hover:scale-[1.02] flex items-center justify-center gap-3">
                  <Play size={24} fill="black"/> 开始专注
                </button>
              ) : (
                <div className="flex gap-4">
                  {mode === 'countdown' && strictMode ? (
                      <button onClick={() => { if(confirm('⚠️ 严厉模式：放弃将直接记录失败！')) handleFinish(false); }} className="flex-1 py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-white shadow-lg animate-pulse flex items-center justify-center gap-2">
                        <X size={24}/> 放弃 (Failure)
                      </button>
                  ) : (
                      <>
                        <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-white border border-white/10 flex items-center justify-center gap-2">
                          {isPaused ? <><Play fill="currentColor"/> 继续</> : <><Pause fill="currentColor"/> 暂停</>}
                        </button>
                        {isPaused && (
                          <>
                            <button onClick={() => handleFinish(false)} className="px-6 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-2xl border border-green-500/20 transition" title="提前完成 (按当前时间结算)"><CheckCircle size={24}/></button>
                            <button onClick={() => { if(confirm('确定放弃？不计分哦。')) { resetTimerState(); setIsActive(false); setIsPaused(false); } }} className="px-6 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl border border-red-500/20 transition"><X size={24} /></button>
                          </>
                        )}
                      </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}