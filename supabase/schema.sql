-- CodeTracker schema
-- Run this in the Supabase SQL editor on a fresh project.

-- ============================================================
-- profiles: extends auth.users
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  avatar_url text,
  bio text,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles can be inserted by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- platform_accounts: linked usernames per platform
-- ============================================================
create type platform_kind as enum (
  'leetcode', 'codeforces', 'github', 'codechef', 'atcoder'
);

create table public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform platform_kind not null,
  username text not null,
  last_synced_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (user_id, platform)
);

alter table public.platform_accounts enable row level security;

create policy "owner can read platform accounts"
  on public.platform_accounts for select using (auth.uid() = user_id);
create policy "owner can write platform accounts"
  on public.platform_accounts for all using (auth.uid() = user_id);

-- ============================================================
-- daily_activity: rolled-up activity per day per platform
-- ============================================================
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  platform platform_kind,
  problems_solved int default 0,
  contests int default 0,
  submissions int default 0,
  seconds_spent int default 0,
  rating_change int default 0,
  created_at timestamptz default now(),
  unique (user_id, day, platform)
);

create index daily_activity_user_day on public.daily_activity (user_id, day desc);

alter table public.daily_activity enable row level security;
create policy "owner can read daily activity"
  on public.daily_activity for select using (auth.uid() = user_id);
create policy "owner can write daily activity"
  on public.daily_activity for all using (auth.uid() = user_id);

-- ============================================================
-- goals: weekly/daily targets
-- ============================================================
create type goal_kind as enum ('daily_problems', 'weekly_problems', 'weekly_minutes');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind goal_kind not null,
  target int not null check (target > 0),
  active boolean default true,
  created_at timestamptz default now(),
  unique (user_id, kind)
);

alter table public.goals enable row level security;
create policy "owner can manage goals"
  on public.goals for all using (auth.uid() = user_id);

-- ============================================================
-- journal_entries: notes per problem
-- ============================================================
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  problem_url text,
  platform platform_kind,
  difficulty text,
  tags text[] default '{}',
  body_md text default '',
  solved_at timestamptz,
  time_spent_seconds int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index journal_entries_user_created on public.journal_entries (user_id, created_at desc);
create index journal_entries_tags on public.journal_entries using gin (tags);

alter table public.journal_entries enable row level security;
create policy "owner can manage journal entries"
  on public.journal_entries for all using (auth.uid() = user_id);

-- ============================================================
-- focus_sessions: pomodoro / time tracking from extension
-- ============================================================
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform platform_kind,
  url text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int generated always as (
    case when ended_at is null then 0
         else extract(epoch from (ended_at - started_at))::int end
  ) stored,
  source text default 'extension',
  created_at timestamptz default now()
);

create index focus_sessions_user_started on public.focus_sessions (user_id, started_at desc);

alter table public.focus_sessions enable row level security;
create policy "owner can manage focus sessions"
  on public.focus_sessions for all using (auth.uid() = user_id);

-- ============================================================
-- helpful views
-- ============================================================
create or replace view public.streak_summary
with (security_invoker = on)
as
with days as (
  select distinct day
  from public.daily_activity
  where user_id = auth.uid() and problems_solved > 0
  order by day desc
),
gapped as (
  select day, day - (row_number() over (order by day desc) - 1)::int as bucket
  from days
),
grouped as (
  select min(day) as start_day, max(day) as end_day, count(*) as length
  from gapped group by bucket
)
select
  (select length from grouped order by end_day desc limit 1) as current_streak,
  (select max(length) from grouped) as longest_streak;
