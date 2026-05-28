create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid references public.users(id),
  investor_id uuid references public.users(id),
  pitch_id uuid references public.pitches(id),
  created_at timestamptz default now(),
  last_message_at timestamptz,
  unique (founder_id, investor_id, pitch_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id),
  sender_id uuid references public.users(id),
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id),
  message_id uuid,
  flag_type text,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references public.users(id),
  pitch_id uuid references public.pitches(id),
  startup_name text,
  invested_amount numeric,
  investment_date date,
  current_valuation numeric,
  equity_percentage numeric,
  stage_at_investment text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.portfolio_updates (
  id uuid primary key default gen_random_uuid(),
  portfolio_entry_id uuid references public.portfolio_entries(id),
  updated_valuation numeric,
  update_note text,
  update_date date default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid references public.pitches(id),
  founder_id uuid references public.users(id),
  investor_id uuid references public.users(id),
  conversation_id uuid references public.conversations(id) unique,
  agreed_amount numeric,
  fee_amount numeric generated always as (agreed_amount * 0.02) stored,
  status text default 'interested',
  invoice_sent_at timestamptz,
  paid_at timestamptz,
  due_date timestamptz,
  partial_unlock_until timestamptz,
  investor_credit_until timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.blacklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  email text,
  pan_number text,
  reason text,
  banned_at timestamptz default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.portfolio_entries enable row level security;
alter table public.portfolio_updates enable row level security;
alter table public.deals enable row level security;
alter table public.blacklist enable row level security;

drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations
  for select using (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "participants create conversations" on public.conversations;
create policy "participants create conversations" on public.conversations
  for insert with check (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "participants update conversations" on public.conversations;
create policy "participants update conversations" on public.conversations
  for update using (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.founder_id = auth.uid() or c.investor_id = auth.uid())
    )
  );

drop policy if exists "participants create messages" on public.messages;
create policy "participants create messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.founder_id = auth.uid() or c.investor_id = auth.uid())
    )
  );

drop policy if exists "participants update own visible messages" on public.messages;
create policy "participants update own visible messages" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.founder_id = auth.uid() or c.investor_id = auth.uid())
    )
  );

drop policy if exists "participants create moderation flags" on public.moderation_flags;
create policy "participants create moderation flags" on public.moderation_flags
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.founder_id = auth.uid() or c.investor_id = auth.uid())
    )
  );

drop policy if exists "investors manage own portfolio" on public.portfolio_entries;
create policy "investors manage own portfolio" on public.portfolio_entries
  for all using (auth.uid() = investor_id) with check (auth.uid() = investor_id);

drop policy if exists "investors manage own portfolio updates" on public.portfolio_updates;
create policy "investors manage own portfolio updates" on public.portfolio_updates
  for all using (
    exists (select 1 from public.portfolio_entries p where p.id = portfolio_entry_id and p.investor_id = auth.uid())
  ) with check (
    exists (select 1 from public.portfolio_entries p where p.id = portfolio_entry_id and p.investor_id = auth.uid())
  );

drop policy if exists "deal parties read deals" on public.deals;
create policy "deal parties read deals" on public.deals
  for select using (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "deal parties create deals" on public.deals;
create policy "deal parties create deals" on public.deals
  for insert with check (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "deal parties update deals" on public.deals;
create policy "deal parties update deals" on public.deals
  for update using (auth.uid() = founder_id or auth.uid() = investor_id);

drop policy if exists "users read own blacklist rows" on public.blacklist;
create policy "users read own blacklist rows" on public.blacklist
  for select using (auth.uid() = user_id);

drop policy if exists "admins read moderation flags" on public.moderation_flags;
create policy "admins read moderation flags" on public.moderation_flags
  for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "admins manage deals" on public.deals;
create policy "admins manage deals" on public.deals
  for all using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "admins manage blacklist" on public.blacklist;
create policy "admins manage blacklist" on public.blacklist
  for all using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
