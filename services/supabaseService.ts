import { createClient } from '@supabase/supabase-js';
import { AppState, DailyAdventure, FinancialRecord, QuarterlyQuest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Client Init - URL:", supabaseUrl ? "Present" : "MISSING");
console.log("Supabase Client Init - Key:", supabaseKey ? "Present" : "MISSING");

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase environment variables are missing! Data will not persist.");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export const supabaseService = {
    // --- TASKS ---
    async loadTasks(): Promise<DailyAdventure[]> {
        const { data, error } = await supabase
            .from('daily_adventures')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            task: row.text,
            completed: row.completed,
            userId: row.user_id,
            date: row.date,
            focusMinutes: row.focus_minutes || 0,
            type: row.type || 'DAILY'
        }));
    },

    async addTask(text: string, userId: 'HUSBAND' | 'WIFE', type: 'DAILY' | 'WEEKLY' = 'DAILY') {
        const { data, error } = await supabase
            .from('daily_adventures')
            .insert([{
                text,
                user_id: userId,
                completed: false,
                type,
                date: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggleTask(id: string, completed: boolean) {
        const { error } = await supabase
            .from('daily_adventures')
            .update({ completed })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTask(id: string) {
        const { error } = await supabase
            .from('daily_adventures')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    // --- FINANCES ---
    async loadFinancials(): Promise<FinancialRecord[]> {
        const { data, error } = await supabase
            .from('financials')
            .select('*')
            .is('deleted_at', null)
            .order('date', { ascending: false })
            .limit(50); // Valid limit

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            notes: row.description,
            amount: Number(row.amount),
            type: row.type,
            category: row.category || 'General',
            userId: row.user_id,
            date: row.date
        }));
    },

    async addFinancial(record: Omit<FinancialRecord, 'id'>) {
        const { data, error } = await supabase
            .from('financials')
            .insert([{
                description: record.notes,
                amount: record.amount,
                type: record.type,
                category: record.category,
                user_id: record.userId,
                date: record.date
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- QUEST ---
    async loadQuest(): Promise<QuarterlyQuest | null> {
        const { data, error } = await supabase
            .from('quarterly_quests')
            .select('*')
            .is('deleted_at', null)
            .limit(1)
            .single();

        // It's okay if no quest exists yet
        if (error && error.code !== 'PGRST116') throw error;

        if (!data) return null;

        return {
            quarter: data.quarter,
            businessOutcome: data.business_outcome,
            revenueTarget: Number(data.revenue_target),
            personalOutcomes: data.personal_outcomes || [],
            status: data.status
        };
    },

    async updateQuest(quest: QuarterlyQuest) {
        // If we are starting a new quest (onboarding), we should archive the existing one
        const { data: existing } = await supabase
            .from('quarterly_quests')
            .select('id, status')
            .is('deleted_at', null)
            .maybeSingle();

        if (existing) {
            // If the existing one is already COMPLETED and we are sending a new one, archive it
            if (existing.status === 'COMPLETED' && quest.status !== 'COMPLETED') {
                await supabase
                    .from('quarterly_quests')
                    .update({ deleted_at: new Date().toISOString() })
                    .eq('id', existing.id);

                // Now insert the new one
                const { data, error } = await supabase.from('quarterly_quests').insert([{
                    quarter: quest.quarter,
                    business_outcome: quest.businessOutcome,
                    revenue_target: quest.revenueTarget,
                    personal_outcomes: quest.personalOutcomes,
                    status: quest.status
                }]).select().single();
                if (error) throw error;
                return data;
            }

            // Normal update (e.g. marking as completed or just editing)
            const { error } = await supabase
                .from('quarterly_quests')
                .update({
                    quarter: quest.quarter,
                    business_outcome: quest.businessOutcome,
                    revenue_target: quest.revenueTarget,
                    personal_outcomes: quest.personalOutcomes,
                    status: quest.status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { data, error } = await supabase.from('quarterly_quests').insert([{
                quarter: quest.quarter,
                business_outcome: quest.businessOutcome,
                revenue_target: quest.revenueTarget,
                personal_outcomes: quest.personalOutcomes,
                status: quest.status
            }]).select().single();
            if (error) throw error;
            return data;
        }
    },

    // --- SETTINGS ---
    async loadCoachPrompt(): Promise<string> {
        const { data } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'coach_prompt')
            .single();

        return data?.value || "";
    },

    async saveCoachPrompt(prompt: string) {
        await supabase
            .from('app_settings')
            .upsert([{ key: 'coach_prompt', value: prompt }]);
    }
};
