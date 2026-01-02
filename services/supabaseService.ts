import { createClient } from '@supabase/supabase-js';
import { AppState, Adventure, FinancialRecord, QuarterlyQuest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
    // --- TASKS ---
    async loadTasks(): Promise<Adventure[]> {
        const { data, error } = await supabase
            .from('daily_adventures')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            text: row.text,
            completed: row.completed,
            userId: row.user_id,
            type: row.type || 'DAILY' // Handle migration defaults
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
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- FINANCES ---
    async loadFinancials(): Promise<FinancialRecord[]> {
        const { data, error } = await supabase
            .from('financials')
            .select('*')
            .order('date', { ascending: false })
            .limit(50); // Valid limit

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            description: row.description,
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
                description: record.description,
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
        // Upsert logic: Update if exists, insert if not (based on a fixed logic or ID)
        // For simplicity, we assume one row. We'll delete and re-insert or update generic.
        // Easier: Update the single row found, or insert.

        const { data: existing } = await supabase.from('quarterly_quests').select('id').single();

        if (existing) {
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
            await supabase.from('quarterly_quests').insert([{
                quarter: quest.quarter,
                business_outcome: quest.businessOutcome,
                revenue_target: quest.revenueTarget,
                personal_outcomes: quest.personalOutcomes,
                status: quest.status
            }]);
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
