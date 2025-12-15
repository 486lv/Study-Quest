'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Gift, ShoppingBag } from 'lucide-react';

export default function Shop() {
  const { shopItems, addShopItem, deleteShopItem, purchaseItem, energy } = useStore();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');

  const handleAdd = () => {
    if (name && cost) {
      addShopItem(name, Number(cost), '🎁');
      setName('');
      setCost('');
    }
  };

  const handleBuy = (item: any) => {
    if (confirm(`花费 ${item.cost} 能量兑换 "${item.name}"?`)) {
      if (purchaseItem(item)) alert('✅ 兑换成功！快去背包使用吧');
      else alert('❌ 能量不足');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <h3 className="text-sm font-bold text-text mb-4 flex gap-2"><Plus size={16}/> 添加自定义奖励</h3>
        <div className="flex gap-2">
           <input value={name} onChange={e => setName(e.target.value)} placeholder="奖励名称 (如: 看电影)" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-text outline-none"/>
           <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="价格" className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-text outline-none"/>
           <button onClick={handleAdd} className="bg-primary hover:bg-blue-500 px-4 rounded-lg text-text font-bold text-sm">添加</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {shopItems.length === 0 ? (
          <div className="text-center text-slate-500 py-20 flex flex-col items-center">
            <ShoppingBag size={48} className="mb-4 opacity-20"/>
            <p>还没有商品，给自己定个奖励吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {shopItems.map(item => (
               <div key={item.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition group flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="text-2xl bg-slate-900 w-10 h-10 flex items-center justify-center rounded-lg">{item.icon}</div>
                   <div>
                     <div className="text-sm font-bold text-text">{item.name}</div>
                     <div className="text-xs text-yellow-500 font-bold">{item.cost} 能量</div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => handleBuy(item)} className="px-3 py-1.5 bg-slate-700 hover:bg-primary text-xs text-text rounded-lg transition">兑换</button>
                   <button onClick={() => deleteShopItem(item.id)} className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}