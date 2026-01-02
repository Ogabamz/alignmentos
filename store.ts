
import { useState, useEffect, useCallback } from 'react';
import { AppState, UserRole, DailyAdventure, WeeklyPriority, FinancialRecord, QuarterlyQuest } from './types';
import { supabaseService } from './services/supabaseService';

const DEFAULT_COACH_PROMPT = `You are the Alignment Coach for a married founder couple. Your goal is visibility and focus.

SHARED DATA:
Quarterly Quest: {{quest}}
Husband's Recent Tasks: {{husbandTasks}}
Wife's Recent Tasks: {{wifeTasks}}
Latest Shared Finances: {{finances}}

INSTRUCTIONS:
1. Compare Husband and Wife's priorities. Are they actually pulling in the same direction?
2. Analyze the cash flow in Naira. Are expenses threatening the Quarterly Quest revenue target?
3. Be brutally honest but supportive.

OUTPUT FORMAT (Use Markdown):
### 💰 FINANCIAL STATUS
### ⚖️ ALIGNMENT SCORE: [X/10]
### 🔍 PATTERN DETECTED
### 🕯️ TONIGHT'S RITUAL`;

const DEFAULT_STATE: AppState = {
  user: 'HUSBAND',
  dailyAdventures: [],
  weeklyPriorities: [],
  quarterlyQuest: {
    quarter: 'Q1-2025',
    businessOutcome: 'Scale content distribution and systemize ops',
    revenueTarget: 3000000,
    personalOutcomes: ['Consistent energy through health rituals'],
    status: 'ON_TRACK'
  },
  financials: [],
  coachPrompt: DEFAULT_COACH_PROMPT,
  lastUpdated: Date.now()
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hasPendingSync] = useState(false); // Legacy field, simplified for Supabase

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial Load from Supabase
  const loadAllData = useCallback(async () => {
    console.log("Supabase: Starting initial data load...");
    setIsSyncing(true);
    try {
      const [tasks, financials, quest, coachPrompt] = await Promise.all([
        supabaseService.loadTasks(),
        supabaseService.loadFinancials(),
        supabaseService.loadQuest(),
        supabaseService.loadCoachPrompt()
      ]);

      console.log(`Supabase: Loaded ${tasks.length} tasks and ${financials.length} financial records.`);

      setState(prev => ({
        ...prev,
        dailyAdventures: tasks.filter(t => t.type === 'DAILY' || !t.type),
        weeklyPriorities: tasks.filter(t => t.type === 'WEEKLY') as any, // Temporary mapping
        financials: financials as any,
        quarterlyQuest: quest || prev.quarterlyQuest,
        coachPrompt: coachPrompt || prev.coachPrompt,
        lastUpdated: Date.now()
      }));
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Supabase: Failed to load data:", error);
      // If we fall through here, we might want to try again or show an error
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const setUser = (user: UserRole) => setState(prev => ({ ...prev, user }));

  const addDailyAdventure = async (task: string) => {
    try {
      const newTask = await supabaseService.addTask(task, state.user, 'DAILY');
      setState(prev => ({
        ...prev,
        dailyAdventures: [
          ...prev.dailyAdventures,
          {
            id: newTask.id,
            userId: newTask.user_id,
            date: newTask.date,
            task: newTask.text,
            completed: newTask.completed,
            focusMinutes: 0
          }
        ]
      }));
    } catch (error) {
      console.error("Add task failed:", error);
    }
  };

  const toggleAdventure = async (id: string) => {
    try {
      const task = state.dailyAdventures.find(a => a.id === id);
      if (!task) return;
      await supabaseService.toggleTask(id, !task.completed);
      setState(prev => ({
        ...prev,
        dailyAdventures: prev.dailyAdventures.map(a =>
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      }));
    } catch (error) {
      console.error("Toggle task failed:", error);
    }
  };

  const addFocusMinutes = (id: string, minutes: number) => {
    // Current Supabase schema doesn't have focusMinutes specifically, 
    // we could add it, but for now we'll update state locally
    setState(prev => ({
      ...prev,
      dailyAdventures: prev.dailyAdventures.map(a =>
        a.id === id ? { ...a, focusMinutes: a.focusMinutes + minutes } : a
      )
    }));
  };

  const setWeeklyPriorities = async (p1: string, p2: string, p3: string) => {
    try {
      const combinedText = `${p1} | ${p2} | ${p3}`;
      const newTask = await supabaseService.addTask(combinedText, state.user, 'WEEKLY');
      const week = getWeekString(new Date());

      const newPriority: WeeklyPriority = {
        id: newTask.id,
        userId: state.user,
        week,
        priority1: p1,
        priority2: p2,
        priority3: p3,
        status: 'PENDING'
      };

      setState(prev => ({
        ...prev,
        weeklyPriorities: [...prev.weeklyPriorities.filter(p => p.week !== week || p.userId !== state.user), newPriority]
      }));
    } catch (error) {
      console.error("Add weekly priority failed:", error);
    }
  };

  const addFinancial = async (amount: number, type: 'INCOME' | 'EXPENSE', category: string, notes: string) => {
    try {
      const newRecord = await supabaseService.addFinancial({
        userId: state.user,
        date: new Date().toISOString().split('T')[0],
        amount,
        type,
        category,
        notes
      });

      setState(prev => ({
        ...prev,
        financials: [...prev.financials, {
          id: newRecord.id,
          userId: state.user,
          date: newRecord.date,
          amount,
          type,
          category,
          notes
        }]
      }));
    } catch (error) {
      console.error("Add financial record failed:", error);
    }
  };

  const updateQuest = async (updates: Partial<QuarterlyQuest>) => {
    const newQuest = { ...state.quarterlyQuest, ...updates };
    try {
      await supabaseService.updateQuest(newQuest);
      setState(prev => ({
        ...prev,
        quarterlyQuest: newQuest
      }));
    } catch (error) {
      console.error("Update quest failed:", error);
    }
  };

  const updateCoachPrompt = async (newPrompt: string) => {
    try {
      await supabaseService.saveCoachPrompt(newPrompt);
      setState(prev => ({
        ...prev,
        coachPrompt: newPrompt
      }));
    } catch (error) {
      console.error("Save coach prompt failed:", error);
    }
  };

  return {
    state,
    syncUrl: "", // Legacy
    setSyncUrl: () => { }, // Legacy
    isSyncing,
    isOffline,
    hasPendingSync,
    pullFromCloud: loadAllData,
    setUser,
    addDailyAdventure,
    toggleAdventure,
    addFocusMinutes,
    setWeeklyPriorities,
    addFinancial,
    updateQuest,
    updateCoachPrompt
  };
};

function getWeekString(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}
