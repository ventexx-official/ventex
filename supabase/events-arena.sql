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
