'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { BookKey, Download, Info, Palette, Save, Shield, Trash2, Upload, User } from 'lucide-react';

export default function Settings() {
  const {
    user,
    updateUser,
    resetData,
    theme,
    setTheme,
    backupConfig,
    setBackupConfig,
    exportData,
    importData,
  } = useStore();

  const [username, setUsername] = useState(user.username);
  const [appInfo, setAppInfo] = useState<{ version: string; platform: string } | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setUsername(user.username), [user.username]);

  useEffect(() => {
    const run = async () => {
      if ((window as any).electronAPI?.getAppInfo) {
        const info = await (window as any).electronAPI.getAppInfo();
        setAppInfo(info);
      }
    };
    run();
  }, []);

  const themes = useMemo(
    () => [
      { id: 'default', name: '星际流体', color: '#3b82f6' },
      { id: 'pixel', name: '像素勇者', color: '#ef4444' },
      { id: 'cyberpunk', name: '赛博朋克', color: '#00ff41' },
      { id: 'film', name: '胶片印象', color: '#ca8a04' },
      { id: 'bw', name: '手绘黑白', color: '#111827' },
      { id: 'forest', name: '清新森林', color: '#15803d' },
    ],
    []
  );

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateUser({ avatar: String(reader.result || '') });
    reader.readAsDataURL(file);
  };

  const saveName = () => {
    if (!username.trim()) return;
    updateUser({ username: username.trim() });
  };

  const exportBackup = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyquest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupConfig({ lastBackupAt: new Date().toISOString() });
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = importData(text);
    alert(ok ? '导入成功' : '导入失败，文件格式不正确');
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 p-2 space-y-6">
      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4"><User className="text-primary" /><h2 className="text-lg font-bold">个人资料</h2></div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border border-border" />
            <button onClick={() => avatarInputRef.current?.click()} className="text-xs px-2 py-1 rounded border border-border hover:bg-white/10">上传头像</button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>
          <div className="flex-1 w-full">
            <div className="text-xs text-text-muted mb-1">用户名</div>
            <div className="flex gap-2">
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm" />
              <button onClick={saveName} className="px-3 rounded bg-primary text-white"><Save size={14} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-3"><Palette className="text-primary" /><h2 className="text-lg font-bold">主题与视觉</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {themes.map((t: any) => (
            <button key={t.id} onClick={() => setTheme(t.id)} className={`p-3 rounded border ${theme === t.id ? 'border-primary bg-primary/10' : 'border-border'}`}>
              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: t.color }}></div>
              <div className="text-xs font-bold">{t.name}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-3"><Shield className="text-primary" /><h2 className="text-lg font-bold">数据安全与备份</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={backupConfig.autoBackup} onChange={(e) => setBackupConfig({ autoBackup: e.target.checked })} />自动备份</label>
          <label className="flex items-center gap-2">备份频率
            <select value={backupConfig.frequency} onChange={(e) => setBackupConfig({ frequency: e.target.value as any })} className="bg-background border border-border rounded px-2 py-1 text-xs">
              <option value="daily">每日</option><option value="weekly">每周</option>
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={backupConfig.verifyOnImport} onChange={(e) => setBackupConfig({ verifyOnImport: e.target.checked })} />导入前校验</label>
          <div className="text-xs text-text-muted">上次备份：{backupConfig.lastBackupAt ? new Date(backupConfig.lastBackupAt).toLocaleString() : '暂无'}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportBackup} className="px-3 py-2 rounded bg-primary text-white text-xs font-bold flex items-center gap-1"><Download size={12} /> 导出备份</button>
          <button onClick={() => importInputRef.current?.click()} className="px-3 py-2 rounded border border-border text-xs font-bold flex items-center gap-1"><Upload size={12} /> 导入备份</button>
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importBackup} />
        </div>
      </section>

      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-3"><Info className="text-primary" /><h2 className="text-lg font-bold">关于与发布信息</h2></div>
        <div className="text-sm text-text/80 space-y-1">
          <div>应用：Study Quest</div>
          <div>版本：{appInfo?.version || 'v3.1.0'}</div>
          <div>平台：{appInfo?.platform || 'web'}</div>
        </div>
      </section>

      <section className="bg-surface p-6 rounded-theme border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4"><BookKey className="text-red-400" /><h2 className="text-sm font-bold text-red-400">危险操作</h2></div>
        <button onClick={() => { if (confirm('确定要重置本地存档？')) resetData(); }} className="px-3 py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-sm font-bold flex items-center gap-1">
          <Trash2 size={14} /> 重置所有数据
        </button>
      </section>
    </div>
  );
}
