'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { User, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Auth() {
  const login = useStore((state) => state.login);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return alert('请输入有效邮箱');
    if (isRegister && !username) return alert('请输入昵称');

    setLoading(true);
    setTimeout(() => {
      // 只传一个参数：如果有昵称就用昵称，没有就截取邮箱前缀
      login(username || email.split('@')[0]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
      <div className="w-full max-w-sm bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <Sparkles className="text-white" size={24}/>
          </div>
          <h1 className="text-xl font-bold text-white">Study Quest</h1>
          <p className="text-slate-500 text-sm mt-1">{isRegister ? '创建新账号' : '欢迎回来'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white outline-none focus:border-blue-500" placeholder="昵称" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white outline-none focus:border-blue-500" placeholder="邮箱" />
          </div>
          
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            {loading ? '加载中...' : (isRegister ? '注册' : '登录')} <ArrowRight size={16}/>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <button onClick={() => setIsRegister(!isRegister)} className="hover:text-white underline">
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
    </div>
  );
}