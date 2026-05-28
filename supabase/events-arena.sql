create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text default 'arena',
  theme text,
  status text default 'upcoming',
  scheduled_date timestamptz,
  description text,
  format text,
  investor_panel text[],
  stream_url text,
  replay_url text,
  apply_url text,
  created_at timestamptz default now()
);

create table if not exists public.arena_applications (
  id uuid primary key default gen_random_uuid(),
  founder_name text,
  startup_name text,
  one_liner text,
  sector text,
  stage text,
  why_ready text,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.arena_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.data_room_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pitch_id uuid not null,
  agreed_at timestamptz default now()
);

alter table public.events enable row level security;
alter table public.arena_applications enable row level security;
alter table public.arena_waitlist enable row level security;
alter table public.data_room_agreements enable row level security;

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (true);

drop policy if exists "public submit arena applications" on public.arena_applications;
create policy "public submit arena applications" on public.arena_applications
  for insert with check (true);

drop policy if exists "public join arena waitlist" on public.arena_waitlist;
create policy "public join arena waitlist" on public.arena_waitlist
  for insert with check (true);

drop policy if exists "users manage own data room agreements" on public.data_room_agreements;
create policy "users manage own data room agreements" on public.data_room_agreements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "admins read arena applications" on public.arena_applications;
create policy "admins read arena applications" on public.arena_applications
  for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "admins read arena waitlist" on public.arena_waitlist;
create policy "admins read arena waitlist" on public.arena_waitlist
  for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
