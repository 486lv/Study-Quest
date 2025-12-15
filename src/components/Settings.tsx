'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore, ThemeType } from '@/store/useStore';
import { 
  User, Palette, LogOut, Trash2, Check,
  Film, Trees, Gamepad2, Sparkles, Monitor, Pencil,
  Save, RefreshCw, Loader2, X, Crop as CropIcon
} from 'lucide-react';
import Cropper, { type Point, type Area } from 'react-easy-crop';

export default function Settings() {
  const { user, updateUser, resetData, logout, theme, setTheme } = useStore();
  const [username, setUsername] = useState(user.username);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  
  // 裁剪状态
  const [imageSrc, setImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 }); 
  const [zoom, setZoom] = useState(1); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null); 
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false); 
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUsername(user.username); }, [user]);

  // 读取文件
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  // 裁剪逻辑
  const getCroppedImg = useCallback(async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = new Image(); image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  // 压缩逻辑
  const compressImageStr = (base64Str: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 500; let w = img.width; let h = img.height;
        if (w > MAX) { h *= MAX / w; w = MAX; }
        if (h > MAX) { w *= MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl); setCrop({ x: 0, y: 0 }); setZoom(1); setIsCroppingModalOpen(true);
      e.target.value = ''; 
    }
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsCroppingModalOpen(false); setIsAvatarUploading(true); 
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      const compressed = await compressImageStr(cropped);
      try { updateUser({ avatar: compressed }); } catch (e) { alert('❌ 存储空间已满'); }
    } catch (e) { alert('❌ 处理失败'); } 
    finally { setIsAvatarUploading(false); setImageSrc(null); }
  };

  const handleSaveName = () => {
    if (!username.trim()) return alert('用户名不能为空');
    updateUser({ username }); alert('✅ 昵称已更新');
  };

  // 定义主题列表
  const themes: {id: ThemeType, name: string, desc: string, color: string, icon: any}[] = [
    { id: 'default', name: '星际流体', desc: 'Default', color: '#3b82f6', icon: Sparkles },
    // 🟢 修改：像素勇者不再强制黑色，使用明亮的红色，配合CSS实现多彩
    { id: 'pixel', name: '像素勇者', desc: '8-bit Retro', color: '#ef4444', icon: Gamepad2 },
    { id: 'cyberpunk', name: '赛博朋克', desc: 'Night City', color: '#00ff41', icon: Monitor },
    { id: 'film', name: '胶片印象', desc: 'Nolan Style', color: '#ca8a04', icon: Film },
    { id: 'bw', name: '手绘印象', desc: 'Sketchbook', color: '#1a1a1a', icon: Pencil },
    { id: 'forest', name: '清新森系', desc: 'Fresh Air', color: '#15803d', icon: Trees },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 p-2 space-y-6 relative">
      {/* 裁剪弹窗 */}
      {isCroppingModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border rounded-theme w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
            <div className="flex justify-between items-center p-4 border-b border-border bg-background/50">
              <h3 className="font-bold flex items-center gap-2"><CropIcon size={18}/> 截取头像区域</h3>
              <button onClick={() => setIsCroppingModalOpen(false)}><X size={20} className="text-text-muted hover:text-text"/></button>
            </div>
            <div className="relative flex-1 bg-black/50 w-full">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} onZoomChange={setZoom} cropShape="round" showGrid={false}/>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex flex-col gap-4">
              <div className="flex items-center gap-4 px-2">
                <span className="text-xs font-bold text-text-muted">缩放</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"/>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsCroppingModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-theme text-sm font-bold transition hover:bg-surface text-text-muted hover:text-text">取消</button>
                <button onClick={handleCropConfirm} className="flex-1 py-2.5 bg-primary text-primary-fg rounded-theme text-sm font-bold transition hover:opacity-90 flex items-center justify-center gap-2"><Check size={16}/> 确认使用</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 个人资料 */}
      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <User className="text-primary" />
          <div><h2 className="text-lg font-bold">个人资料 (Profile)</h2><p className="text-xs text-text-muted">设置你的专属形象</p></div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3 shrink-0">
             <div className="w-28 h-28 rounded-full border-4 border-surface shadow-md overflow-hidden bg-background relative group">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={user.avatar} alt="avatar" className={`w-full h-full object-cover transition duration-500 ${isAvatarUploading ? 'opacity-50 blur-sm' : ''}`} />
               {isAvatarUploading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>}
               {!isAvatarUploading && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40"><button onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm flex items-center gap-1"><CropIcon size={10} /> 更换</button></div>}
             </div>
             <div className="flex gap-2">
                <button onClick={() => { const s = Math.random().toString(36).substring(7); updateUser({ avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${s}` }); }} className="text-[10px] bg-surface border border-border px-2 py-1 rounded hover:bg-primary hover:text-primary-fg transition flex items-center gap-1"><RefreshCw size={10}/> 随机</button>
                <button onClick={() => avatarInputRef.current?.click()} disabled={isAvatarUploading} className="text-[10px] bg-surface border border-border px-2 py-1 rounded hover:bg-primary hover:text-primary-fg transition flex items-center gap-1 disabled:opacity-50"><CropIcon size={10}/> 上传</button>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
             </div>
          </div>
          <div className="flex-1 w-full space-y-4">
             <div className="space-y-1">
               <label className="text-xs font-bold text-text-muted">用户昵称</label>
               <div className="flex gap-2"><input value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition" /><button onClick={handleSaveName} className="bg-surface border border-border text-text px-4 rounded-lg text-sm hover:bg-primary hover:text-primary-fg transition"><Save size={16}/></button></div>
             </div>
          </div>
        </div>
      </section>

      {/* 主题风格 */}
      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <Palette className="text-primary" />
          <div><h2 className="text-lg font-bold">界面风格 (Theme)</h2><p className="text-xs text-text-muted">点击即刻切换</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((t) => {
             const isActive = theme === t.id;
             // 🟢 特殊逻辑：如果是手绘风且被选中，强制加粗边框
             const isSketchActive = isActive && t.id === 'bw';

             return (
              <button 
                key={t.id} 
                onClick={() => setTheme(t.id)} 
                className={`relative group flex flex-col items-center gap-3 p-4 rounded-theme border transition-all duration-300
                  ${isActive 
                    ? `bg-primary/10 border-primary ring-1 ring-primary/50 shadow-md ${isSketchActive ? '!border-[3px] !font-black transform scale-[1.02]' : ''}` 
                    : 'bg-background/50 border-border hover:bg-background hover:border-text-muted'
                  }
                `}
              >
                {isActive && (
                  <div className={`absolute top-2 right-2 p-0.5 rounded-full z-10 ${t.id === 'bw' ? 'bg-black text-white' : 'bg-primary text-primary-fg'}`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`} 
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : t.color, 
                    // 🟢 修改：像素风(pixel)不再强制黑色文字，保持其丰富性。只有手绘(bw)在非选中时保持黑。
                    color: isActive ? 'var(--primary-fg)' : (t.id === 'bw' ? '#000' : '#fff')
                  }}
                >
                  <t.icon size={24} />
                </div>
                
                <div className="text-center">
                  <div className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-text'}`}>{t.name}</div>
                  <div className="text-[10px] text-text-muted opacity-70">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 账号操作 */}
      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm opacity-80 hover:opacity-100 transition">
        <div className="flex items-center gap-3 mb-4"><Trash2 className="text-red-500" /><h2 className="text-sm font-bold text-red-500">账号操作</h2></div>
        <div className="flex gap-4">
           <button onClick={logout} className="flex-1 py-2.5 border border-border text-text-muted hover:bg-text hover:text-background rounded-theme text-sm font-bold transition flex items-center justify-center gap-2"><LogOut size={14}/> 退出登录</button>
           <button onClick={() => { if(confirm('⚠️ 确定要清除所有数据？等级和记录都将消失！')) resetData(); }} className="flex-1 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-theme text-sm font-bold transition flex items-center justify-center gap-2"><Trash2 size={14}/> 重置数据</button>
        </div>
      </section>
    </div>
  );
}