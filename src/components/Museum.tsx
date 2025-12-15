'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
// 引入配置，用来显示稀有度颜色
import { RARITY_CONFIG, Artifact } from '@/data/artifactSystem'; 
import { Search, X, Box, Sparkles, Clock, MapPin } from 'lucide-react';

export default function Museum() {
  // 🟢 注意：这里取的是 artifacts (考古背包)，不是 inventory (商城背包)
  const { artifacts } = useStore();
  const [selectedItem, setSelectedItem] = useState<Artifact | null>(null);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2 text-shadow">
          <Box className="text-purple-400"/> 赛博博物馆
        </h2>
        <p className="text-text/60 text-sm text-shadow">
          收藏来自旧世界的数据碎片 (已收集: {artifacts.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        {artifacts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-text/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
            <Search size={48} className="mb-4 opacity-50"/>
            <p>展厅空空如也...</p>
            <p className="text-xs mt-2 opacity-60">
              去完成一次 {'>'}20 分钟的专注来挖掘文物吧
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artifacts.map((item) => {
              const config = RARITY_CONFIG[item.rarity];
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="relative group p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg overflow-hidden"
                >
                  {/* 背景光效 (Hover时显示) */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500 pointer-events-none"
                    style={{ backgroundColor: config.color }}
                  ></div>
                  
                  {/* 图标容器 */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner relative overflow-hidden bg-black/30 border border-white/5 group-hover:scale-110 transition-transform duration-300 ${config.shadow}`}>
                    📦
                    {/* 故障物品特效 */}
                    {item.rarity === 'Glitched' && (
                      <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <div className="text-sm font-bold truncate" style={{ color: config.color }}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-text/40 mt-1 uppercase tracking-wider font-bold">
                      {config.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- 物品详情弹窗 --- */}
      {selectedItem && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗背景光 */}
            <div className="absolute top-0 left-0 w-full h-1/2 opacity-20 pointer-events-none blur-3xl" style={{ backgroundColor: RARITY_CONFIG[selectedItem.rarity].color }}></div>

            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-text/50 hover:text-text z-20">
              <X size={20}/>
            </button>
            
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className={`w-28 h-28 rounded-3xl bg-black/50 flex items-center justify-center text-6xl shadow-2xl border border-white/10 ${RARITY_CONFIG[selectedItem.rarity].shadow} animate-bounce-subtle`}>
                📦
              </div>
              
              <div>
                <h3 className="text-2xl font-black mb-1 drop-shadow-md" style={{ color: RARITY_CONFIG[selectedItem.rarity].color }}>
                  {selectedItem.name}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold bg-white/10 px-2 py-1 rounded-full text-text/70 border border-white/5">
                  {RARITY_CONFIG[selectedItem.rarity].label} Artifact
                </span>
              </div>

              <div className="bg-white/5 p-4 rounded-xl w-full text-sm text-text/80 italic border-l-2 relative" style={{ borderColor: RARITY_CONFIG[selectedItem.rarity].color }}>
                <span className="absolute top-2 left-2 text-2xl opacity-10">“</span>
                {selectedItem.description}
                <span className="absolute bottom-[-10px] right-2 text-2xl opacity-10">”</span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                 <div className="bg-black/30 p-2 rounded flex items-center justify-center gap-2 text-[10px] text-text/50">
                    <Clock size={10} />
                    {new Date(selectedItem.timestamp).toLocaleDateString()}
                 </div>
                 <div className="bg-black/30 p-2 rounded flex items-center justify-center gap-2 text-[10px] text-text/50">
                    <MapPin size={10} />
                    深度: {selectedItem.sourceDepth}m
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}