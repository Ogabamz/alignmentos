
import React, { useState } from 'react';
import { useStore } from '../store';

const Finance: React.FC<{ store: ReturnType<typeof useStore> }> = ({ store }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('Personal');
  const [notes, setNotes] = useState('');

  const state = store.state;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyRecords = state.financials.filter(f => f.date.startsWith(currentMonth));
  
  const totalIncome = monthlyRecords.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = monthlyRecords.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0);
  const net = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      store.addFinancial(Number(amount), type, category, notes);
      setAmount('');
      setNotes('');
      setShowAdd(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Financial Truth</h2>
          <p className="text-slate-500 text-xs font-bold uppercase">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg active:scale-95 transition-all ${
            showAdd ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {showAdd ? '×' : '+'}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Inflow</p>
          <p className="text-lg font-bold text-emerald-900 leading-none">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100">
          <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Outflow</p>
          <p className="text-lg font-bold text-rose-900 leading-none">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className={`p-6 rounded-3xl text-white shadow-xl transition-all duration-500 ${net < 0 ? 'bg-rose-900' : 'bg-slate-900'}`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Current Net Positioning</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tighter">{formatCurrency(net)}</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${net < 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'}`}>
            {net >= 0 ? '↑ ON PLAN' : '↓ DRIFTING'}
          </span>
        </div>
      </div>

      {showAdd ? (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-100 p-6 rounded-3xl space-y-4 shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              type="button" onClick={() => setType('INCOME')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'INCOME' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
            >
              INCOME
            </button>
            <button 
              type="button" onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
            >
              EXPENSE
            </button>
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 text-lg font-black placeholder:text-slate-200 focus:outline-none focus:border-slate-300"
              autoFocus
            />
          </div>

          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none appearance-none cursor-pointer"
          >
            <option>Business</option>
            <option>Family</option>
            <option>Food</option>
            <option>Ads/Marketing</option>
            <option>Tools/Software</option>
            <option>Personal</option>
            <option>Others</option>
          </select>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quick note..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm placeholder:text-slate-300 focus:outline-none"
          />

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl active:scale-95 transition-all">
            LOG RECORD
          </button>
        </form>
      ) : (
        <div className="space-y-3">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Recent Alignment Items</h3>
           <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
            {monthlyRecords.length === 0 && <p className="text-slate-300 text-xs italic py-4">No records logged this month.</p>}
            {monthlyRecords.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
              <div key={record.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">{record.category}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{record.userId === 'HUSBAND' ? '👤 HE' : '👤 SHE'} • {new Date(record.date).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-black ${record.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                </p>
              </div>
            ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
