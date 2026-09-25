-- Habit Tracker Supabase Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  frequency text not null default 'daily',
  target_days_per_week int default 7,
  color text default '#6366f1',
  icon text default 'check',
  archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create habit_logs table (for tracking daily completion)
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (habit_id, completed_date)
);

-- 3. Enable Row Level Security (RLS)
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- 4. Policies for habits table
create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id or user_id is null);

create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id or user_id is null);

-- 5. Policies for habit_logs table
create policy "Users can view logs of their habits"
  on public.habit_logs for select
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and (habits.user_id = auth.uid() or habits.user_id is null)
    )
  );

create policy "Users can insert logs for their habits"
  on public.habit_logs for insert
  with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and (habits.user_id = auth.uid() or habits.user_id is null)
    )
  );

create policy "Users can delete logs for their habits"
  on public.habit_logs for delete
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and (habits.user_id = auth.uid() or habits.user_id is null)
    )
  );
