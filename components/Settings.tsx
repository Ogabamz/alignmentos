
import React, { useState } from 'react';
import { useStore } from '../store';

const Settings: React.FC<{ store: ReturnType<typeof useStore> }> = ({ store }) => {
  const [urlInput, setUrlInput] = useState(store.syncUrl);

  // Quest Edit State
  const [questOutcome, setQuestOutcome] = useState(store.state.quarterlyQuest.businessOutcome);
  const [questRevenue, setQuestRevenue] = useState(store.state.quarterlyQuest.revenueTarget.toString());
  const [questQuarter, setQuestQuarter] = useState(store.state.quarterlyQuest.quarter);
  const [personalGoals, setPersonalGoals] = useState<string[]>(store.state.quarterlyQuest.personalOutcomes || []);
  const [newGoalInput, setNewGoalInput] = useState('');

  // Coach Prompt State
  const [coachPrompt, setCoachPrompt] = useState(store.state.coachPrompt || '');

  const handleSaveSyncUrl = () => {
    store.setSyncUrl(urlInput);
    alert("Sync URL updated. The app will now try to fetch shared data.");
    store.pullFromCloud();
  };

  const handleSaveQuest = () => {
    store.updateQuest({
      businessOutcome: questOutcome,
      revenueTarget: Number(questRevenue),
      quarter: questQuarter,
      personalOutcomes: personalGoals
    });
    alert("Quarterly Quest updated and synced for both parties.");
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim()) {
      setPersonalGoals([...personalGoals, newGoalInput.trim()]);
      setNewGoalInput('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setPersonalGoals(personalGoals.filter((_, i) => i !== index));
  };

  const handleSavePrompt = () => {
    store.updateCoachPrompt(coachPrompt);
    alert("AI Coach Master Prompt updated and synced.");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 pb-12">
      <header>
        <h2 className="text-2xl font-black text-slate-800 mb-2">System Config</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          The mastermind engine of Alignment OS. All changes here sync to your shared database.
        </p>
      </header>

      {/* Supabase Connectivity Section */}
      <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest">1. Cloud Sync (Supabase)</h3>
          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${import.meta.env.VITE_SUPABASE_URL ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {import.meta.env.VITE_SUPABASE_URL ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400">ENDPOINT:</span>
              <span className="text-slate-600 font-mono truncate ml-4">
                {import.meta.env.VITE_SUPABASE_URL || 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400">ANON KEY:</span>
              <span className="text-slate-600 font-mono">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••' : 'Missing'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic pb-2">
            To secure your connection, ensure these keys are added to your environment or GitHub Secrets.
          </p>

          <button
            onClick={() => store.pullFromCloud()}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            FORCE SYNC NOW
          </button>
        </div>
      </section>

      {/* Quarterly Quest Section */}
      <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-4">2. Quarterly Quest</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Current Quarter</label>
            <input
              type="text"
              value={questQuarter}
              onChange={(e) => setQuestQuarter(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Business Outcome</label>
            <textarea
              value={questOutcome}
              onChange={(e) => setQuestOutcome(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-medium mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Revenue Target (₦)</label>
            <input
              type="number"
              value={questRevenue}
              onChange={(e) => setQuestRevenue(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-black text-emerald-600 mt-1"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Personal Goals</label>
            <div className="space-y-2 mt-2">
              {personalGoals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="flex-1 text-xs font-medium text-slate-700">{goal}</span>
                  <button onClick={() => handleRemoveGoal(idx)} className="text-rose-500 font-bold px-2 hover:scale-110 transition-transform">×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  placeholder="Add a personal goal..."
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <button
                  onClick={handleAddGoal}
                  className="bg-slate-200 text-slate-700 px-4 rounded-xl font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveQuest}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            SET QUEST & SYNC
          </button>
        </div>
      </section>

      {/* AI Coach Master Prompt Section */}
      <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
        <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-4">3. AI Master Prompt</h3>
        <div className="space-y-4">
          <p className="text-[10px] font-medium text-slate-400 leading-normal">
            Direct your coach. Use <code className="bg-slate-100 px-1 rounded">{"{{quest}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{husbandTasks}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{wifeTasks}}"}</code>, and <code className="bg-slate-100 px-1 rounded">{"{{finances}}"}</code> to inject dynamic data.
          </p>
          <textarea
            value={coachPrompt}
            onChange={(e) => setCoachPrompt(e.target.value)}
            placeholder="System instructions for your AI coach..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-mono min-h-[250px] focus:outline-none focus:border-indigo-500 transition-all leading-relaxed"
          />
          <button
            onClick={handleSavePrompt}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            TRAIN COACH & SYNC
          </button>
        </div>
      </section>

      <footer className="text-center py-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Alignment OS v1.1.0 • Built for Shared Success
        </p>
      </footer>
    </div>
  );
};

export default Settings;
