'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { STORY_FRAGMENTS, Fragment } from '@/data/storyData';
import { Lock, FileText, Image as ImageIcon, Music, Terminal, AlertTriangle, Code } from 'lucide-react';

export default function StoryMode() {
  const { xp, theme } = useStore();
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null);
  const [typingContent, setTypingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 根据主题获取颜色方案
  const getThemeColors = () => {
    switch (theme) {
      case 'forest':
        return {
          bg: 'bg-[#ecfdf5]',
          bgDark: 'bg-[#d1fae5]',
          border: 'border-[#10b981]',
          borderLight: 'border-[#6ee7b7]',
          text: 'text-[#064e3b]',
          textLight: 'text-[#047857]',
          textMuted: 'text-[#059669]',
          accent: 'bg-[#10b981]',
          accentLight: 'bg-[#6ee7b7]',
          shadow: 'shadow-[0_0_20px_rgba(5,150,105,0.1)]',
        };
      case 'cyberpunk':
        return {
          bg: 'bg-black',
          bgDark: 'bg-[#050505]',
          border: 'border-[#00ff41]',
          borderLight: 'border-[#00ff41]/50',
          text: 'text-[#00ff41]',
          textLight: 'text-[#00ff41]',
          textMuted: 'text-[#008f11]',
          accent: 'bg-[#00ff41]',
          accentLight: 'bg-[#00ff41]/20',
          shadow: 'shadow-[0_0_20px_rgba(0,255,65,0.2)]',
        };
      case 'pixel':
        return {
          bg: 'bg-white',
          bgDark: 'bg-[#f3f4f6]',
          border: 'border-black',
          borderLight: 'border-black',
          text: 'text-black',
          textLight: 'text-black',
          textMuted: 'text-gray-600',
          accent: 'bg-black',
          accentLight: 'bg-gray-200',
          shadow: 'shadow-[4px_4px_0px_#000]',
        };
      case 'film':
        return {
          bg: 'bg-[#1c1917]',
          bgDark: 'bg-[#292524]',
          border: 'border-[#fbbf24]',
          borderLight: 'border-[#fbbf24]/50',
          text: 'text-[#fbbf24]',
          textLight: 'text-[#fbbf24]',
          textMuted: 'text-[#a8a29e]',
          accent: 'bg-[#fbbf24]',
          accentLight: 'bg-[#fbbf24]/20',
          shadow: 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)]',
        };
      case 'bw':
        return {
          bg: 'bg-[#fdfbf7]',
          bgDark: 'bg-white',
          border: 'border-[#1a1a1a]',
          borderLight: 'border-[#2d2d2d]',
          text: 'text-[#000000]',
          textLight: 'text-[#1a1a1a]',
          textMuted: 'text-[#2d2d2d]',
          accent: 'bg-[#1a1a1a]',
          accentLight: 'bg-[#2d2d2d]/10',
          shadow: 'shadow-[2px_2px_0px_rgba(0,0,0,0.1)]',
        };
      default: // default
        return {
          bg: 'bg-[#1e293b]',
          bgDark: 'bg-[#0f172a]',
          border: 'border-[#6366f1]',
          borderLight: 'border-[#6366f1]/50',
          text: 'text-[#f8fafc]',
          textLight: 'text-[#cbd5e1]',
          textMuted: 'text-[#94a3b8]',
          accent: 'bg-[#6366f1]',
          accentLight: 'bg-[#6366f1]/20',
          shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
        };
    }
  };
  
  const colors = getThemeColors();

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
      <div className={`lg:w-1/3 w-full ${colors.bgDark} backdrop-blur-md rounded-xl border ${colors.borderLight} flex flex-col overflow-hidden ${colors.shadow}`}>
        <div className={`p-3 border-b ${colors.borderLight} ${colors.accentLight} flex justify-between items-center`}>
          <div className={`flex items-center gap-2 ${colors.text}`}>
            <Terminal size={16} />
            <span className="font-bold tracking-wider">ROOT_DIR/MEMORY</span>
          </div>
          <span className={`text-xs ${colors.textMuted}`}>XP: {xp}</span>
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
                    ? `${colors.accentLight} ${colors.border} ${colors.text} ${colors.shadow}` 
                    : `bg-transparent border-transparent ${colors.textMuted} hover:opacity-80`
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
                <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? `${colors.accent} ${colors.shadow}` : 'bg-red-900'}`}></div>
              </button>
            );
          })}
        </div>
        
        {/* 底部进度条 */}
        {nextFragment && (
          <div className={`p-3 border-t ${colors.borderLight} ${colors.accentLight}`}>
            <div className={`flex justify-between text-[10px] ${colors.textMuted} mb-1`}>
              <span>DECRYPTING NEXT FILE...</span>
              <span>{(nextFragment.minXP - xp).toFixed(0)} XP REMAINING</span>
            </div>
            <div className={`w-full h-1 ${colors.accentLight} rounded-full overflow-hidden`}>
               <div 
                 className={`h-full ${colors.accent} animate-pulse`}
                 style={{ width: `${Math.min(100, (xp / nextFragment.minXP) * 100)}%` }}
               ></div>
            </div>
          </div>
        )}
      </div>

      {/* --- 右侧：终端阅读器 --- */}
      <div className={`flex-1 ${colors.bg} rounded-xl border ${colors.borderLight} p-6 relative overflow-hidden ${colors.shadow} flex flex-col`}>
        {/* CRT 扫描线效果 - 只在特定主题显示 */}
        {theme === 'cyberpunk' && (
          <>
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            <div className={`absolute inset-0 pointer-events-none z-10 animate-[flicker_0.15s_infinite] ${colors.accentLight} opacity-10`}></div>
          </>
        )}

        {selectedFragment ? (
          <>
            <div className={`flex justify-between items-end border-b ${colors.borderLight} pb-4 mb-4 z-0`}>
               <div>
                 <h2 className={`text-xl font-bold ${colors.text} mb-1 tracking-widest`}>
                   {xp >= selectedFragment.minXP ? selectedFragment.title : 'UNKNOWN_FILE'}
                 </h2>
                 <div className={`flex gap-4 text-[10px] ${colors.textMuted}`}>
                    <span>TYPE: {selectedFragment.type.toUpperCase()}</span>
                    <span>SIZE: {selectedFragment.content.length} BYTES</span>
                 </div>
               </div>
               <div className={`${colors.textMuted} text-4xl opacity-20 select-none`}>
                 {selectedFragment.id}
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar z-0 pr-2 pb-10"
            >
              <div className={`whitespace-pre-wrap leading-relaxed ${colors.textLight} text-sm font-light`}>
                {typingContent}
                <span className={`inline-block w-2 h-4 ${colors.accent} ml-1 animate-pulse align-middle`}></span>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${colors.textMuted} opacity-50`}>
            AWAITING INPUT...
          </div>
        )}
      </div>
    </div>
  );
}