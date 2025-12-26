'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { User, ArrowRight, Sparkles } from 'lucide-react';

export default function Auth() {
  const login = useStore((state: any) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return alert('请输入用户名');

    setLoading(true);
    setTimeout(() => {
      login(username.trim());
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
      <div className="w-full max-w-sm bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center mb-4">
            <Sparkles className="text-text" size={24}/>
          </div>
          <h1 className="text-xl font-bold text-text">Study Quest</h1>
          <p className="text-slate-500 text-sm mt-1">开始你的专注之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-text outline-none focus:border-blue-500" 
              placeholder="请输入你的用户名" 
              autoFocus
            />
          </div>
          
          <button disabled={loading} className="w-full bg-primary hover:bg-blue-500 text-text font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            {loading ? '加载中...' : '登录'} <ArrowRight size={16}/>
          </button>
        </form>
      </div>
    </div>
  );
}