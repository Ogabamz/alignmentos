-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tasks Table (Adventures & Priorities)
create table daily_adventures (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  text text not null,
  completed boolean default false,
  user_id text not null check (user_id in ('HUSBAND', 'WIFE')),
  type text not null check (type in ('DAILY', 'WEEKLY')), -- Distinguish daily vs weekly
  date text not null -- ISO date string YYYY-MM-DD
);

-- 2. Financials Table
create table financials (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  category text,
  user_id text not null check (user_id in ('HUSBAND', 'WIFE')),
  date text not null
);

-- 3. Quarterly Quest (Stored as a single row that gets updated)
create table quarterly_quests (
  id uuid default uuid_generate_v4() primary key,
  quarter text not null,
  business_outcome text,
  revenue_target numeric,
  personal_outcomes text[],
  status text check (status in ('ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert initial empty quest if none exists
insert into quarterly_quests (quarter, business_outcome, revenue_target, status)
select 'Q1-2025', 'Scale content distribution', 3000000, 'ON_TRACK'
where not exists (select 1 from quarterly_quests);

-- 4. Settings/Coach Prompt
create table app_settings (
  key text primary key,
  value text
);

insert into app_settings (key, value)
values ('coach_prompt', 'You are the Alignment Coach.')
on conflict do nothing;

-- Enable Row Level Security (RLS) but allow public access for this specific open app
-- (Since there is no "Login" screen in the current app, we allow public anon access for now)
alter table daily_adventures enable row level security;
alter table financials enable row level security;
alter table quarterly_quests enable row level security;
alter table app_settings enable row level security;

-- Policies to allow full access to anyone with the Anon Key (Public App style)
create policy "Allow generic access" on daily_adventures for all using (true) with check (true);
create policy "Allow generic access" on financials for all using (true) with check (true);
create policy "Allow generic access" on quarterly_quests for all using (true) with check (true);
create policy "Allow generic access" on app_settings for all using (true) with check (true);
