
export type UserRole = 'HUSBAND' | 'WIFE';

export interface DailyAdventure {
  id: string;
  userId: UserRole;
  date: string;
  task: string;
  completed: boolean;
  focusMinutes: number;
  type?: 'DAILY' | 'WEEKLY';
}

export interface WeeklyPriority {
  id: string;
  userId: UserRole;
  week: string; // YYYY-WW
  priority1: string;
  priority2: string;
  priority3: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

export interface QuarterlyQuest {
  quarter: string; // Q1-2026
  businessOutcome: string;
  revenueTarget: number;
  personalOutcomes: string[];
  status: 'ON_TRACK' | 'OFF_TRACK';
}

export interface FinancialRecord {
  id: string;
  userId: UserRole;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  notes: string;
}

export interface AppState {
  user: UserRole;
  dailyAdventures: DailyAdventure[];
  weeklyPriorities: WeeklyPriority[];
  quarterlyQuest: QuarterlyQuest;
  financials: FinancialRecord[];
  coachPrompt?: string;
  lastUpdated: number; // Timestamp for sync resolution
}
