
import React, { useState } from 'react';
import { useStore } from './store';
import Today from './components/Today';
import Finance from './components/Finance';
import Review from './components/Review';
import Coach from './components/Coach';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'finance' | 'review' | 'coach' | 'settings'>('today');
  const store = useStore();

  const tabs = [
    { id: 'today', icon: '⚡', label: 'Today' },
    { id: 'finance', icon: '💰', label: 'Finance' },
    { id: 'review', icon: '📋', label: 'Review' },
    { id: 'coach', icon: '🧠', label: 'Coach' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 bg-white shadow-xl relative">
      {/* Top Bar */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">ALIGNMENT<span className="text-blue-600">OS</span></h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Quarter: {store.state.quarterlyQuest.quarter}</p>
              
              <div className="flex items-center gap-1">
                {store.isOffline ? (
                  <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Offline
                  </span>
                ) : store.hasPendingSync ? (
                  <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${store.isSyncing ? 'animate-pulse' : ''}`}></span>
                    Synced
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
          >
            ⚙️
          </button>
          <button 
            onClick={() => store.setUser(store.state.user === 'HUSBAND' ? 'WIFE' : 'HUSBAND')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              store.state.user === 'HUSBAND' 
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20' 
                : 'bg-rose-100 text-rose-700 ring-2 ring-rose-500/20'
            }`}
          >
            {store.state.user === 'HUSBAND' ? '👤 HE' : '👤 SHE'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'today' && <Today store={store} />}
        {activeTab === 'finance' && <Finance store={store} />}
        {activeTab === 'review' && <Review store={store} />}
        {activeTab === 'coach' && <Coach store={store} />}
        {activeTab === 'settings' && <Settings store={store} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
