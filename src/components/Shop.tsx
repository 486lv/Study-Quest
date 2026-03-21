'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle2, Gift, Plus, ShoppingBag, Trash2 } from 'lucide-react';

type FilterType = 'all' | 'unused' | 'used';

export default function Shop() {
  const { shopItems, purchases, addShopItem, deleteShopItem, purchaseItem, markPurchaseUsed, energy } = useStore();

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('-1');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return purchases;
    return purchases.filter((p) => p.status === filter);
  }, [filter, purchases]);

  const handleAdd = () => {
    if (!name.trim() || !cost) return;
    const numCost = Number(cost);
    const numStock = Number(stock);
    if (Number.isNaN(numCost) || numCost <= 0) return;
    if (Number.isNaN(numStock) || numStock < -1) return;

    addShopItem(name.trim(), numCost, '🎁', numStock);
    setName('');
    setCost('');
    setStock('-1');
  };

  const handleBuy = (item: any) => {
    if (confirm(`花费 ${item.cost} 能量兑换 "${item.name}" ?`)) {
      if (purchaseItem(item)) alert('兑换成功，已写入兑换记录。');
      else alert('兑换失败：能量不足或库存不足。');
    }
  };

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="h-full flex flex-col gap-4 min-h-0">
        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-bold text-text mb-4 flex gap-2 items-center"><Plus size={16} /> 添加奖励</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_90px_auto] gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="奖励名称（例：看电影）"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-text outline-none"
            />
            <input
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="价格"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-text outline-none"
            />
            <input
              type="number"
              min={-1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="库存"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-text outline-none"
            />
            <button onClick={handleAdd} className="bg-primary hover:bg-blue-500 px-4 rounded-lg text-text font-bold text-sm">
              添加
            </button>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">库存填 `-1` 表示无限，填 `0+` 表示限量。</div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {shopItems.length === 0 ? (
            <div className="text-center text-slate-500 py-20 flex flex-col items-center">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>当前没有可兑换奖励</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shopItems.map((item) => (
                <div key={item.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition group flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl bg-slate-900 w-10 h-10 flex items-center justify-center rounded-lg">{item.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-text">{item.name}</div>
                      <div className="text-xs text-yellow-500 font-bold">{item.cost} 能量</div>
                      <div className="text-[11px] text-slate-400">库存: {item.stock === -1 ? '无限' : item.stock}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleBuy(item)} className="px-3 py-1.5 bg-slate-700 hover:bg-primary text-xs text-text rounded-lg transition">
                      兑换
                    </button>
                    <button onClick={() => deleteShopItem(item.id)} className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/30 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 flex items-center justify-between">
          <span>当前能量</span>
          <span className="font-black text-yellow-400">{energy}</span>
        </div>
      </div>

      <div className="h-full min-h-0 flex flex-col bg-slate-800/30 rounded-2xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text flex gap-2 items-center"><Gift size={16} /> 兑换记录</h3>
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
            {(['all', 'unused', 'used'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-xs rounded ${filter === f ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}
              >
                {f === 'all' ? '全部' : f === 'unused' ? '未使用' : '已使用'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">暂无记录</div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="border border-slate-700 rounded-lg p-3 bg-black/20 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text">{record.itemName}</div>
                  <div className="text-[11px] text-slate-400">花费 {record.cost} 能量 · {new Date(record.purchasedAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${record.status === 'used' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {record.status === 'used' ? '已使用' : '未使用'}
                  </span>
                  {record.status === 'unused' && (
                    <button
                      onClick={() => markPurchaseUsed(record.id)}
                      className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> 标记使用
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
