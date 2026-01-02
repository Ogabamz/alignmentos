
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

  // Find all tasks for today
  const todaysTasks = state.dailyAdventures.filter(a => a.date === todayStr && a.userId === state.user);

  // Active adventure is the first incomplete one
  const activeAdventure = todaysTasks.find(a => !a.completed);

  // If we have tasks but none are incomplete, they are all done
  const allMissionsDone = todaysTasks.length > 0 && !activeAdventure;

  const handleSetAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      store.addDailyAdventure(taskInput);
      setTaskInput('');
      setSeconds(25 * 60); // Reset timer on new task
      setIsTimerRunning(false);
    }
  };

  const handleCompleteCurrent = () => {
    if (activeAdventure) {
      store.toggleAdventure(activeAdventure.id);
      setIsTimerRunning(false);
    }
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);

  useEffect(() => {
    if (isTimerRunning && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && activeAdventure) {
      store.addFocusMinutes(activeAdventure.id, 25);
      setSeconds(25 * 60);
      setIsTimerRunning(false);
      alert('Focus session complete! 25 minutes logged.');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, seconds, activeAdventure, store]);

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
          {allMissionsDone
            ? "Victory! Ready for one more adventure?"
            : activeAdventure
              ? "Crush this ONE task to win the day."
              : "What ONE task makes today a win?"}
        </p>

        {(!activeAdventure) ? (
          <form onSubmit={handleSetAdventure} className="relative group">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={allMissionsDone ? "Next adventure..." : "Enter today's mission..."}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-bold shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all active:scale-95"
            >
              DEPLOY
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border-b-4 border-blue-600">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase block mb-1">Active Mission</span>
                  <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                </div>
                <button
                  onClick={handleCompleteCurrent}
                  className="group flex items-center gap-2 bg-white/10 hover:bg-green-500 px-4 py-2 rounded-xl transition-all border border-white/10"
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">Complete Mission</span>
                  <span className="text-lg">✓</span>
                </button>
              </div>

              <h3 className="text-2xl font-bold mb-8 leading-tight">
                {activeAdventure.task}
              </h3>

              <div className="flex items-end justify-between pt-4 border-t border-white/5">
                <div className="flex gap-6">
                  <div>
                    <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider mb-1">Focus Time</p>
                    <p className="text-xl font-mono text-blue-400 font-bold">{activeAdventure.focusMinutes} <span className="text-[10px]">min</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider mb-1">Intensity</p>
                  <p className="text-[10px] font-black uppercase text-white bg-blue-500/20 px-2 py-1 rounded">High Impact</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {activeAdventure && (
        <section className="bg-blue-50 rounded-3xl p-8 text-center border-2 border-blue-100 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-600 text-[10px] font-bold px-4 py-1 rounded-full border border-blue-200 uppercase tracking-widest">
            Deep Work Chamber
          </div>
          <div className="text-7xl font-mono font-black text-slate-900 tracking-tighter mb-8 tabular-nums">
            {formatTime(seconds)}
          </div>
          <div className="flex justify-center gap-4">
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="group flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/40 active:scale-95 transition-all hover:bg-blue-700"
              >
                Start Flow <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Hold Focus
              </button>
            )}
          </div>
        </section>
      )}

      {allMissionsDone && (
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-emerald-900 font-black text-sm uppercase">Daily Quota Met</p>
            <p className="text-emerald-600 text-xs font-bold">You've crushed {todaysTasks.length} {todaysTasks.length === 1 ? 'mission' : 'missions'} today.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Today;
