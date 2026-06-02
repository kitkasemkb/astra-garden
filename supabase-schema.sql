-- ─────────────────────────────────────────────────────────
-- Astra Garden — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────

-- Readings history table
create table if not exists readings (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  type         text not null check (type in ('astrology','tarot')),
  category     text,
  topic        text,
  birth_date   text,
  birth_time   text,
  province     text,
  answer       text,
  chart        jsonb,
  spread       jsonb,
  created_at   timestamptz default now()
);

-- Row Level Security
alter table readings enable row level security;

create policy "Users see own readings"
  on readings for select
  using (auth.uid() = user_id);

create policy "Users insert own readings"
  on readings for insert
  with check (auth.uid() = user_id);

create policy "Users delete own readings"
  on readings for delete
  using (auth.uid() = user_id);

-- Index for faster history queries
create index if not exists readings_user_created
  on readings (user_id, created_at desc);
