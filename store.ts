
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, UserRole, DailyAdventure, WeeklyPriority, FinancialRecord, QuarterlyQuest } from './types';

const STORAGE_KEY = 'alignment_os_data';
const SYNC_URL_KEY = 'alignment_os_sync_url';
const PENDING_SYNC_KEY = 'alignment_os_pending_sync';
const DEFAULT_SYNC_URL = 'https://script.google.com/macros/s/AKfycbyYC4BpzmNFs0pqJwWxZLn1PYzhssu8FqoK4ycV9fRcaVknotUhErgXtotP_pX1REjQmg/exec';

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
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });

  const [syncUrl, setSyncUrl] = useState<string>(() => {
    return localStorage.getItem(SYNC_URL_KEY) || DEFAULT_SYNC_URL;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(() => {
    return localStorage.getItem(PENDING_SYNC_KEY) === 'true';
  });

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

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Save pending sync status
  useEffect(() => {
    localStorage.setItem(PENDING_SYNC_KEY, String(hasPendingSync));
  }, [hasPendingSync]);

  const pushToCloud = useCallback(async (dataToPush: AppState) => {
    if (!syncUrl || isOffline) return;
    setIsSyncing(true);
    try {
      await fetch(syncUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(dataToPush),
      });
      setHasPendingSync(false);
    } catch (error) {
      console.error("Push failed, will retry later:", error);
      setHasPendingSync(true);
    } finally {
      setIsSyncing(false);
    }
  }, [syncUrl, isOffline]);

  const pullFromCloud = useCallback(async () => {
    if (!syncUrl || isOffline || hasPendingSync) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(syncUrl, { cache: 'no-store' });
      const cloudData = await response.json();
      
      if (cloudData && typeof cloudData === 'object' && cloudData.lastUpdated) {
        if (cloudData.lastUpdated > state.lastUpdated) {
          setState(prev => ({
            ...cloudData,
            user: prev.user,
          }));
        }
      }
    } catch (error) {
      console.error("Pull failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [syncUrl, isOffline, hasPendingSync, state.lastUpdated]);

  // Sync Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasPendingSync) {
        pushToCloud(state);
      } else {
        pullFromCloud();
      }
    }, 15000); 
    return () => clearInterval(interval);
  }, [hasPendingSync, pushToCloud, pullFromCloud, state]);

  const updateStateAndSync = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const newState = {
        ...updater(prev),
        lastUpdated: Date.now()
      };
      setHasPendingSync(true);
      pushToCloud(newState);
      return newState;
    });
  };

  const setUser = (user: UserRole) => setState(prev => ({ ...prev, user }));

  const addDailyAdventure = (task: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newAdventure: DailyAdventure = {
      id: crypto.randomUUID(),
      userId: state.user,
      date: today,
      task,
      completed: false,
      focusMinutes: 0
    };
    updateStateAndSync(prev => ({
      ...prev,
      dailyAdventures: [...prev.dailyAdventures.filter(a => a.date !== today || a.userId !== state.user), newAdventure]
    }));
  };

  const toggleAdventure = (id: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      dailyAdventures: prev.dailyAdventures.map(a => 
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    }));
  };

  const addFocusMinutes = (id: string, minutes: number) => {
    updateStateAndSync(prev => ({
      ...prev,
      dailyAdventures: prev.dailyAdventures.map(a => 
        a.id === id ? { ...a, focusMinutes: a.focusMinutes + minutes } : a
      )
    }));
  };

  const setWeeklyPriorities = (p1: string, p2: string, p3: string) => {
    const week = getWeekString(new Date());
    const newPriority: WeeklyPriority = {
      id: crypto.randomUUID(),
      userId: state.user,
      week,
      priority1: p1,
      priority2: p2,
      priority3: p3,
      status: 'PENDING'
    };
    updateStateAndSync(prev => ({
      ...prev,
      weeklyPriorities: [...prev.weeklyPriorities.filter(p => p.week !== week || p.userId !== state.user), newPriority]
    }));
  };

  const addFinancial = (amount: number, type: 'INCOME' | 'EXPENSE', category: string, notes: string) => {
    const newRecord: FinancialRecord = {
      id: crypto.randomUUID(),
      userId: state.user,
      date: new Date().toISOString(),
      amount,
      type,
      category,
      notes
    };
    updateStateAndSync(prev => ({
      ...prev,
      financials: [...prev.financials, newRecord]
    }));
  };

  const updateQuest = (updates: Partial<QuarterlyQuest>) => {
    updateStateAndSync(prev => ({
      ...prev,
      quarterlyQuest: { ...prev.quarterlyQuest, ...updates }
    }));
  };

  const updateCoachPrompt = (newPrompt: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      coachPrompt: newPrompt
    }));
  };

  return {
    state,
    syncUrl,
    setSyncUrl,
    isSyncing,
    isOffline,
    hasPendingSync,
    pullFromCloud,
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
