
-- 1) Table: coaches
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  voice_name text,
  voice_id text,
  category text,
  rating numeric(2,1) not null default 4.8,
  available boolean not null default true,
  -- ElevenLabs ConvAI agent identifier for embedding the widget
  agent_id text,
  -- Optional: if you want to open an external coach URL instead of/embed fallback
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) RLS
alter table public.coaches enable row level security;

-- Clean up any existing policies with same names to avoid conflicts
drop policy if exists "Users can view their own coaches" on public.coaches;
drop policy if exists "Users can create their own coaches" on public.coaches;
drop policy if exists "Users can update their own coaches" on public.coaches;
drop policy if exists "Users can delete their own coaches" on public.coaches;

create policy "Users can view their own coaches"
on public.coaches
for select
using (auth.uid() = user_id);

create policy "Users can create their own coaches"
on public.coaches
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own coaches"
on public.coaches
for update
using (auth.uid() = user_id);

create policy "Users can delete their own coaches"
on public.coaches
for delete
using (auth.uid() = user_id);

-- 3) Trigger to keep updated_at fresh
drop trigger if exists set_timestamp_on_coaches on public.coaches;

create trigger set_timestamp_on_coaches
before update on public.coaches
for each row
execute function public.update_updated_at_column();

-- 4) Helpful indexes
create index if not exists coaches_user_id_idx on public.coaches(user_id);
create index if not exists coaches_updated_at_desc_idx on public.coaches(updated_at desc);
