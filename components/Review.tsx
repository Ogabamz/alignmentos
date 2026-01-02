
import React, { useState } from 'react';
import { useStore } from '../store';

const Review: React.FC<{ store: ReturnType<typeof useStore> }> = ({ store }) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [showForm, setShowForm] = useState(false);

  const getWeekString = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-W${Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)}`;
  };

  const currentWeek = getWeekString(new Date());
  const myPriorities = store.state.weeklyPriorities.find(p => p.week === currentWeek && p.userId === store.state.user);
  const spousePriorities = store.state.weeklyPriorities.find(p => p.week === currentWeek && p.userId !== store.state.user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1 && p2 && p3) {
      store.setWeeklyPriorities(p1, p2, p3);
      setShowForm(false);
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

  const [showQuestForm, setShowQuestForm] = useState(false);
  const [newQuest, setNewQuest] = useState({
    quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1}-${new Date().getFullYear()}`,
    businessOutcome: '',
    revenueTarget: 0,
    personalOutcomes: ['']
  });

  const handleCompleteMission = () => {
    if (window.confirm("Mission Accomplished? This will archive your current goals and prepare for the next mission.")) {
      store.updateQuest({ status: 'COMPLETED' });
    }
  };

  const handleStartNewMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuest.businessOutcome && newQuest.revenueTarget > 0) {
      store.startNewQuest({
        ...newQuest,
        status: 'ON_TRACK'
      });
      setShowQuestForm(false);
    }
  };

  const isQuestActive = store.state.quarterlyQuest && store.state.quarterlyQuest.status !== 'COMPLETED';

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <header>
        <h2 className="text-2xl font-black text-slate-800">Weekly Alignment</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Week {currentWeek.split('-W')[1]} Ritual</p>
      </header>

      {(!isQuestActive || showQuestForm) ? (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase text-blue-400 mb-1 tracking-widest">Deploy New Mission</h3>
              <p className="text-xs text-slate-400">Define your focus for the next season.</p>
            </div>

            <form onSubmit={handleStartNewMission} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Quarter</label>
                  <input
                    value={newQuest.quarter}
                    onChange={e => setNewQuest({ ...newQuest, quarter: e.target.value })}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Revenue Goal (₦)</label>
                  <input
                    type="number"
                    value={newQuest.revenueTarget}
                    onChange={e => setNewQuest({ ...newQuest, revenueTarget: Number(e.target.value) })}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Major Business Outcome</label>
                <textarea
                  value={newQuest.businessOutcome}
                  onChange={e => setNewQuest({ ...newQuest, businessOutcome: e.target.value })}
                  placeholder="e.g. Scale content distribution to 10k subscribers"
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Personal Outcomes (Internal Alignment)</label>
                {newQuest.personalOutcomes.map((goal, i) => (
                  <input
                    key={i}
                    value={goal}
                    onChange={e => {
                      const next = [...newQuest.personalOutcomes];
                      next[i] = e.target.value;
                      setNewQuest({ ...newQuest, personalOutcomes: next });
                    }}
                    placeholder={`Goal #${i + 1}`}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewQuest({ ...newQuest, personalOutcomes: [...newQuest.personalOutcomes, ''] })}
                  className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2"
                >
                  + Add Personal Goal
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                ACTIVATE MISSION
              </button>

              {store.state.quarterlyQuest.status === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => setShowQuestForm(false)}
                  className="w-full text-slate-500 font-bold text-xs uppercase"
                >
                  Back to Achievement
                </button>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className={`rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden transition-all duration-700 ${store.state.quarterlyQuest.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-blue-600'
          }`}>
          <div>
            <h3 className="text-xs font-black uppercase text-blue-200 mb-2 tracking-[0.2em]">Quarterly Quest Target</h3>
            <p className="text-lg font-bold leading-tight mb-2">"{store.state.quarterlyQuest.businessOutcome}"</p>
          </div>

          {store.state.quarterlyQuest.personalOutcomes && store.state.quarterlyQuest.personalOutcomes.length > 0 && (
            <div className="pt-2 border-t border-blue-500/30">
              <h4 className="text-[10px] font-black uppercase text-blue-200 mb-2 tracking-widest">Personal Goals</h4>
              <div className="space-y-1.5">
                {store.state.quarterlyQuest.personalOutcomes.map((goal, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-blue-300">★</span>
                    <p className="text-xs font-semibold text-blue-50 leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-blue-500/30">
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase">Target: {formatCurrency(store.state.quarterlyQuest.revenueTarget)}</p>
              <p className="text-[8px] font-bold text-blue-200/60 uppercase">{store.state.quarterlyQuest.quarter}</p>
            </div>

            <div className="flex gap-2">
              {store.state.quarterlyQuest.status === 'COMPLETED' ? (
                <button
                  onClick={() => setShowQuestForm(true)}
                  className="text-[10px] px-3 py-1 bg-white text-emerald-600 rounded-lg font-black uppercase shadow-lg"
                >
                  Next Mission
                </button>
              ) : (
                <button
                  onClick={handleCompleteMission}
                  className="text-[10px] px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-black uppercase transition-all"
                >
                  Complete
                </button>
              )}
              <span className={`text-[10px] px-2 py-1 rounded font-black uppercase ${store.state.quarterlyQuest.status === 'COMPLETED' ? 'bg-emerald-400 text-emerald-900' : 'bg-blue-500'
                }`}>
                {store.state.quarterlyQuest.status === 'COMPLETED' ? 'Victory' : 'Executing'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Top 3 (This Week)</h4>
            {!myPriorities && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-[10px] font-bold text-blue-600 underline"
              >
                Set Priorities
              </button>
            )}
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-blue-100">
              <input value={p1} onChange={e => setP1(e.target.value)} placeholder="Priority #1" className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500" />
              <input value={p2} onChange={e => setP2(e.target.value)} placeholder="Priority #2" className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500" />
              <input value={p3} onChange={e => setP3(e.target.value)} placeholder="Priority #3" className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30">SAVE</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-bold">CANCEL</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              {myPriorities ? [myPriorities.priority1, myPriorities.priority2, myPriorities.priority3].map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="w-6 h-6 flex-shrink-0 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                  <p className="text-sm font-semibold text-slate-800">{p}</p>
                </div>
              )) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-slate-400 text-xs font-bold uppercase italic">Priorities not set for this week.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Partner Alignment Check</h4>
          {spousePriorities ? (
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-4">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                {store.state.user === 'HUSBAND' ? "Her" : "His"} Top 3 Focus Areas
              </p>
              <div className="space-y-3">
                {[spousePriorities.priority1, spousePriorities.priority2, spousePriorities.priority3].map((p, i) => (
                  <p key={i} className="text-sm font-bold text-rose-900 flex gap-2">
                    <span className="opacity-40 tracking-tighter">→</span> {p}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-3xl text-center">
              <p className="text-slate-400 text-xs font-bold italic">Waiting for partner's input...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Review;
