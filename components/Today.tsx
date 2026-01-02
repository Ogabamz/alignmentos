
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';

const Today: React.FC<{ store: ReturnType<typeof useStore> }> = ({ store }) => {
  const [taskInput, setTaskInput] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  // Use any for the timer ref to avoid NodeJS namespace issues in browser-only environments
  const timerRef = useRef<any>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const state = store.state;
  // Moved state declaration before adventure to ensure state.user is accessible
  const adventure = state.dailyAdventures.find(a => a.date === todayStr && a.userId === state.user);

  const handleSetAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      store.addDailyAdventure(taskInput);
      setTaskInput('');
    }
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);

  useEffect(() => {
    if (isTimerRunning && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && adventure) {
      store.addFocusMinutes(adventure.id, 25);
      setSeconds(25 * 60);
      setIsTimerRunning(false);
      alert('Focus session complete! 25 minutes logged.');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, seconds, adventure, store]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Morning Manifesto</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          "What ONE task makes today a win?"
        </p>

        {!adventure ? (
          <form onSubmit={handleSetAdventure} className="relative">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter today's adventure..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              GO
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Current Mission</span>
                <button 
                  onClick={() => store.toggleAdventure(adventure.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    adventure.completed ? 'bg-green-500 border-green-500' : 'border-slate-700 hover:border-blue-500'
                  }`}
                >
                  {adventure.completed && <span className="text-xs">✓</span>}
                </button>
              </div>
              <h3 className={`text-xl font-bold mb-6 ${adventure.completed ? 'line-through opacity-50' : ''}`}>
                {adventure.task}
              </h3>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Focus Logged</p>
                  <p className="text-2xl font-mono text-blue-400">{adventure.focusMinutes} <span className="text-xs">mins</span></p>
                </div>
                <div className="text-right">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Status</p>
                   <p className={`text-xs font-black px-2 py-0.5 rounded-md ${adventure.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {adventure.completed ? 'MISSION COMPLETE' : 'IN PROGRESS'}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {adventure && !adventure.completed && (
        <section className="bg-blue-50 rounded-3xl p-8 text-center border-2 border-blue-100">
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Focus Timer</p>
          <div className="text-6xl font-mono font-black text-slate-800 tracking-tighter mb-8">
            {formatTime(seconds)}
          </div>
          <div className="flex justify-center gap-4">
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 active:scale-95 transition-all hover:bg-blue-700"
              >
                START FLOW
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
              >
                PAUSE
              </button>
            )}
          </div>
        </section>
      )}

      {!adventure && (
        <div className="p-12 text-center text-slate-300">
           <p className="text-xs font-bold uppercase tracking-widest">No adventure set for today yet.</p>
        </div>
      )}
    </div>
  );
};

export default Today;
