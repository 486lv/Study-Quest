'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { STORY_FRAGMENTS, Fragment } from '@/data/storyData';
import { Lock, FileText, Image as ImageIcon, Music, Terminal, AlertTriangle, Code } from 'lucide-react';

export default function StoryMode() {
  const { xp } = useStore();
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null);
  const [typingContent, setTypingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 计算当前解锁进度
  const nextFragment = STORY_FRAGMENTS.find(f => xp < f.minXP);
  const currentLevelXP = xp;
  const nextLevelXP = nextFragment ? nextFragment.minXP : xp;

  // 自动选择第一个已解锁的，或者保持当前选择
  useEffect(() => {
    if (!selectedFragment && STORY_FRAGMENTS.length > 0) {
      setSelectedFragment(STORY_FRAGMENTS[0]);
    }
  }, []);

  // 打字机效果逻辑
  useEffect(() => {
    if (!selectedFragment) return;
    
    // 如果未解锁，显示加密文本
    if (xp < selectedFragment.minXP) {
      setTypingContent(">>> ACCESS DENIED. \n>>> DATA ENCRYPTED. \n>>> REQUIRED COMPUTING POWER NOT MET.");
      return;
    }

    setTypingContent('');
    let index = 0;
    const content = selectedFragment.content.trim();
    const speed = 10; // 打字速度

    const timer = setInterval(() => {
      if (index < content.length) {
        setTypingContent((prev) => prev + content.charAt(index));
        index++;
        // 自动滚动到底部
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [selectedFragment, xp]);

  // 图标映射
  const getIcon = (type: string) => {
    switch (type) {
      case 'image_desc': return <ImageIcon size={14} />;
      case 'audio_log': return <Music size={14} />;
      case 'code': return <Code size={14} />;
      case 'secret': return <AlertTriangle size={14} className="text-red-500" />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-2 overflow-hidden animate-in fade-in duration-500 font-mono text-sm">
      
      {/* --- 左侧：文件系统列表 --- */}
      <div className="lg:w-1/3 w-full bg-black/80 backdrop-blur-md rounded-xl border border-green-500/30 flex flex-col overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.05)]">
        <div className="p-3 border-b border-green-500/30 bg-green-900/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-400">
            <Terminal size={16} />
            <span className="font-bold tracking-wider">ROOT_DIR/MEMORY</span>
          </div>
          <span className="text-xs text-green-600">XP: {xp}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {STORY_FRAGMENTS.map((fragment) => {
            const isUnlocked = xp >= fragment.minXP;
            const isSelected = selectedFragment?.id === fragment.id;

            return (
              <button
                key={fragment.id}
                onClick={() => setSelectedFragment(fragment)}
                className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-200 group
                  ${isSelected 
                    ? 'bg-green-500/20 border-green-500 text-green-300 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]' 
                    : 'bg-transparent border-transparent text-green-700 hover:bg-green-500/5 hover:text-green-500'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`opacity-70 ${!isUnlocked && 'text-red-500'}`}>
                    {isUnlocked ? getIcon(fragment.type) : <Lock size={14} />}
                  </div>
                  <div>
                    <div className="font-bold text-xs tracking-wider">
                      {isUnlocked ? fragment.title : 'ENCRYPTED_DATA'}
                    </div>
                    <div className="text-[10px] opacity-50 mt-0.5">
                      ID: {fragment.id} | {isUnlocked ? 'READABLE' : `REQ: ${fragment.minXP} XP`}
                    </div>
                  </div>
                </div>
                {/* 状态灯 */}
                <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-900'}`}></div>
              </button>
            );
          })}
        </div>
        
        {/* 底部进度条 */}
        {nextFragment && (
          <div className="p-3 border-t border-green-500/30 bg-black/50">
            <div className="flex justify-between text-[10px] text-green-600 mb-1">
              <span>DECRYPTING NEXT FILE...</span>
              <span>{(nextFragment.minXP - xp).toFixed(0)} XP REMAINING</span>
            </div>
            <div className="w-full h-1 bg-green-900/30 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-green-500 animate-pulse" 
                 style={{ width: `${Math.min(100, (xp / nextFragment.minXP) * 100)}%` }}
               ></div>
            </div>
          </div>
        )}
      </div>

      {/* --- 右侧：终端阅读器 --- */}
      <div className="flex-1 bg-black rounded-xl border border-green-500/30 p-6 relative overflow-hidden shadow-2xl flex flex-col">
        {/* CRT 扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
        <div className="absolute inset-0 pointer-events-none z-10 animate-[flicker_0.15s_infinite] bg-green-500/5 opacity-10"></div>

        {selectedFragment ? (
          <>
            <div className="flex justify-between items-end border-b border-green-800/50 pb-4 mb-4 z-0">
               <div>
                 <h2 className="text-xl font-bold text-green-400 mb-1 tracking-widest">
                   {xp >= selectedFragment.minXP ? selectedFragment.title : 'UNKNOWN_FILE'}
                 </h2>
                 <div className="flex gap-4 text-[10px] text-green-700">
                    <span>TYPE: {selectedFragment.type.toUpperCase()}</span>
                    <span>SIZE: {selectedFragment.content.length} BYTES</span>
                 </div>
               </div>
               <div className="text-green-900 text-4xl opacity-20 select-none">
                 {selectedFragment.id}
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar z-0 pr-2 pb-10"
            >
              <div className="whitespace-pre-wrap leading-relaxed text-green-300/90 text-sm font-light">
                {typingContent}
                <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle"></span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-green-900/50">
            AWAITING INPUT...
          </div>
        )}
      </div>
    </div>
  );
}