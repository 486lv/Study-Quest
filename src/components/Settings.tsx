'use client';
import { useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Image as ImageIcon, Upload, LogOut, Save, Download, User, RefreshCw, Trash2, Droplets } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, bgImage, setBgImage, blurLevel, setBlurLevel, logout, exportData, importData, resetData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.username);

  // 核心修复：更健壮的图片读取逻辑
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ 图片太大了！为了保证运行流畅，请上传 2MB 以内的图片。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'avatar') updateUser({ avatar: reader.result });
        else setBgImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 animate-in fade-in space-y-8 pb-10">
      
      {/* 1. 账户资料 */}
      <section className="bg-white/5 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10 relative">
          <div className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
            {/* 🔴 使用原生 img 确保可见性 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user.avatar || 'https://via.placeholder.com/150'} 
              className="w-24 h-24 rounded-full bg-slate-800 object-cover border-4 border-white/10 group-hover:border-blue-500 transition" 
              alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
              <Upload size={20} className="text-white"/>
            </div>
            <input type="file" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} accept="image/*" className="hidden" />
          </div>
          
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input value={tempName} onChange={e => setTempName(e.target.value)} className="bg-black/40 border border-white/20 rounded px-2 py-1 text-xl font-bold text-white outline-none w-full max-w-[200px]"/>
                <button onClick={() => { updateUser({ username: tempName }); setEditingName(false); }} className="text-xs bg-blue-600 px-3 py-1.5 rounded text-white">确认</button>
              </div>
            ) : (
              <h2 onClick={() => setEditingName(true)} className="text-3xl font-bold text-white hover:text-blue-400 cursor-pointer transition">{user.username}</h2>
            )}
            <p className="text-slate-400 text-sm">Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
            <button onClick={() => updateUser({ avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${Math.random()}` })} className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1"><RefreshCw size={12}/> 生成随机头像</button>
          </div>
        </div>
      </section>

      {/* 2. 背景设置 */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><ImageIcon size={16}/> 界面外观</h3>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
             {/* 上传按钮 */}
             <div onClick={() => fileInputRef.current?.click()} className="w-40 h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-white cursor-pointer shrink-0 transition bg-white/5">
               <Upload size={20} className="mb-2"/><span className="text-xs">上传图片 (Max 2MB)</span>
               <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'bg')} accept="image/*" className="hidden" />
             </div>
             {/* 默认背景 */}
             {['https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&q=80', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80'].map(url => (
               <div key={url} onClick={() => setBgImage(url)} className={`w-40 h-24 rounded-xl bg-cover bg-center cursor-pointer shrink-0 border-2 transition ${bgImage===url ? 'border-blue-500':'border-transparent hover:border-white/30'}`} style={{backgroundImage:`url(${url})`}}></div>
             ))}
          </div>
          
          {bgImage && (
            <button onClick={() => setBgImage('')} className="mb-6 text-xs text-red-400 flex items-center gap-1 hover:underline"><Trash2 size={12}/> 清除背景图</button>
          )}

          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1"><Droplets size={12}/> 模糊度</span>
             <input type="range" min="0" max="50" value={blurLevel} onChange={e => setBlurLevel(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
             <span className="text-xs text-slate-500 w-8 text-right">{blurLevel}</span>
          </div>
        </div>
      </section>

      {/* 3. 数据与退出 */}
      <section className="grid grid-cols-2 gap-4">
        <button onClick={() => { const blob = new Blob([exportData()], {type:'application/json'}); const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='study-quest.json'; a.click(); }} className="bg-white/5 p-4 rounded-2xl hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2 transition">
          <Save size={16} className="text-blue-400"/> <span className="text-sm font-bold text-slate-200">备份数据</span>
        </button>
        <button onClick={() => { if(confirm('登出?')) logout(); }} className="bg-white/5 p-4 rounded-2xl hover:bg-red-500/20 border border-white/5 flex items-center justify-center gap-2 transition group">
          <LogOut size={16} className="text-slate-400 group-hover:text-red-400"/> <span className="text-sm font-bold text-slate-200 group-hover:text-red-200">退出登录</span>
        </button>
      </section>
    </div>
  );
}