
import React, { useState } from 'react';
import { useStore } from '../store';
import { getCoachAdvice } from '../services/geminiService';

const Coach: React.FC<{ store: ReturnType<typeof useStore> }> = ({ store }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    try {
      const result = await getCoachAdvice(store.state);
      setAdvice(result);
    } catch (e) {
      setAdvice("Execution is the only cure for anxiety. Just do the work.");
    } finally {
      setLoading(false);
    }
  };

  // Simple formatting helper to make the markdown headers pop
  const formatAdvice = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-6 mb-2 first:mt-0">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.trim().length === 0) return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm font-medium text-slate-700 leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-90 duration-700">
      <header className="text-center">
        <h2 className="text-2xl font-black text-slate-800 mb-2">The Alignment Coach</h2>
        <p className="text-slate-500 text-xs font-bold uppercase leading-relaxed max-w-[240px] mx-auto">
          AI analysis of your execution, finances, and shared alignment.
        </p>
      </header>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white border border-slate-100 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center shadow-2xl shadow-slate-200">
          {!advice && !loading && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                🧘‍♂️
              </div>
              <p className="text-slate-400 text-sm italic font-medium">Ready for your weekly alignment analysis?</p>
              <button 
                onClick={handleGetAdvice}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all hover:bg-black"
              >
                GENERATE INSIGHT
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center space-y-6">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest animate-pulse">Analyzing System Drift...</p>
            </div>
          )}

          {advice && !loading && (
            <div className="w-full">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Coach Report</span>
                 <button onClick={() => setAdvice(null)} className="text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors underline decoration-slate-200 underline-offset-4">NEW ANALYSIS</button>
              </div>
              <div className="space-y-1">
                {formatAdvice(advice)}
              </div>
              <div className="pt-8 flex justify-center border-t border-slate-50 mt-8">
                <button 
                  onClick={handleGetAdvice}
                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                >
                  RE-CALIBRATE COACH
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Alignment Guardrails</h4>
         <ul className="space-y-3">
            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
               <span className="text-blue-500">✔</span> Objective financial cross-analysis.
            </li>
            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
               <span className="text-blue-500">✔</span> Identification of "busy work" patterns.
            </li>
            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
               <span className="text-blue-500">✔</span> Forced husband/wife alignment rituals.
            </li>
         </ul>
      </div>
    </div>
  );
};

export default Coach;
