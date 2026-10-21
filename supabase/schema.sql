-- ============================================================================
-- VENTEX v3 CLEAN SCHEMA. Run once on a NEW, EMPTY Supabase project.
-- (Record of what was applied. Do not run again on the live project.)
-- ============================================================================
begin;

-- ---------- generic helper: keep updated_at fresh ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;

-- ============================================================================
-- 1. PROFILES (one row per signed-up person; role lives here)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'visitor'
    check (role in ('visitor','founder','investor','buyer','admin')),
  display_name text check (char_length(display_name) <= 100),
  avatar_url text,
  headline text check (char_length(headline) <= 200),
  bio text check (char_length(bio) <= 2000),
  company text check (char_length(company) <= 150),
  country text,
  city text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- who is the caller? (SECURITY DEFINER avoids policy recursion)
create or replace function public.my_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

revoke execute on function public.my_role() from public;
revoke execute on function public.is_admin() from public;
grant execute on function public.my_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- block self-promotion: a normal user may only move visitor -> founder/investor/buyer
create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.id := old.id;
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    if not (old.role = 'visitor' and new.role in ('founder','investor','buyer')) then
      raise exception 'Role change not allowed';
    end if;
  end if;
  return new;
end; $$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a profile when someone signs up (email or Google)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name',
                  new.raw_user_meta_data->>'name',
                  split_part(coalesce(new.email, ''), '@', 1)), 100),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select
  to authenticated using (id = (select auth.uid()));
create policy "profiles_select_admin" on public.profiles for select
  to authenticated using (public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert
  to authenticated with check (id = (select auth.uid()) and role = 'visitor');
create policy "profiles_update_own" on public.profiles for update
  to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles_update_admin" on public.profiles for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Safe public face of a profile (no email, no role, no internal fields).
-- Intentionally runs with owner rights so other people's names can be shown.
create view public.public_profiles as
  select id, display_name, avatar_url, headline, company, bio, country, city
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ============================================================================
-- 2. PITCHES (private draft -> live; every content save = a version)
-- ============================================================================
create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','live','removed')),
  removed_reason text,
  title text not null check (char_length(title) between 1 and 150),
  tagline text check (char_length(tagline) <= 200),
  industry text,
  stage text check (stage in ('idea','prototype','mvp','early_revenue','growth')),
  problem text check (char_length(problem) <= 5000),
  solution text check (char_length(solution) <= 5000),
  target_customer text check (char_length(target_customer) <= 3000),
  market_size text check (char_length(market_size) <= 3000),
  business_model text check (char_length(business_model) <= 3000),
  traction text check (char_length(traction) <= 3000),
  competitors text check (char_length(competitors) <= 3000),
  team text check (char_length(team) <= 3000),
  use_of_funds text check (char_length(use_of_funds) <= 3000),
  is_raising boolean not null default false,
  amount_seeking numeric(14,2) check (amount_seeking is null or amount_seeking >= 0),
  currency text not null default 'USD',
  logo_url text,
  website_url text,
  pitch_deck_path text,          -- path inside the private pitch-decks bucket
  demo_video_url text,
  country text,
  city text,
  current_version integer not null default 1,
  last_saved_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text tsvector generated always as (
    to_tsvector('english',
      coalesce(title,'') || ' ' || coalesce(tagline,'') || ' ' ||
      coalesce(industry,'') || ' ' || coalesce(problem,'') || ' ' || coalesce(solution,''))
  ) stored
);

create index pitches_status_published_idx on public.pitches (status, published_at desc);
create index pitches_founder_idx on public.pitches (founder_id);
create index pitches_search_idx on public.pitches using gin (search_text);

create table public.pitch_versions (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (pitch_id, version_number)
);
create index pitch_versions_pitch_idx on public.pitch_versions (pitch_id);

create or replace function public.pitch_before_insert()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.current_version := 1;
  new.last_saved_at := now();
  if new.status = 'live' then new.published_at := now(); end if;
  return new;
end; $$;

create or replace function public.pitch_before_update()
returns trigger language plpgsql set search_path = '' as $$
declare
  housekeeping text[] := array['status','removed_reason','published_at','updated_at',
                               'last_saved_at','current_version','search_text'];
begin
  new.founder_id := old.founder_id;           -- ownership can never change
  new.updated_at := now();
  if (to_jsonb(new) - housekeeping) is distinct from (to_jsonb(old) - housekeeping) then
    new.current_version := old.current_version + 1;   -- real content change = new version
    new.last_saved_at := now();
  else
    new.current_version := old.current_version;
    new.last_saved_at := old.last_saved_at;
  end if;
  if new.status = 'live' and old.status is distinct from 'live' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end; $$;

create or replace function public.pitch_after_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.pitch_versions (pitch_id, version_number, snapshot, created_by)
    values (new.id, new.current_version, to_jsonb(new) - 'search_text', auth.uid());
  elsif new.current_version is distinct from old.current_version then
    insert into public.pitch_versions (pitch_id, version_number, snapshot, created_by)
    values (new.id, new.current_version, to_jsonb(new) - 'search_text', auth.uid());
  end if;
  return new;
end; $$;
revoke execute on function public.pitch_after_write() from public, anon, authenticated;

create trigger pitches_before_insert before insert on public.pitches
  for each row execute function public.pitch_before_insert();
create trigger pitches_before_update before update on public.pitches
  for each row execute function public.pitch_before_update();
create trigger pitches_after_write after insert or update on public.pitches
  for each row execute function public.pitch_after_write();

alter table public.pitches enable row level security;

create policy "pitches_select_live" on public.pitches for select
  using (status = 'live');
create policy "pitches_select_own" on public.pitches for select
  to authenticated using (founder_id = (select auth.uid()));
create policy "pitches_insert_own" on public.pitches for insert
  to authenticated
  with check (founder_id = (select auth.uid())
              and status in ('draft','live')
              and public.my_role() in ('founder','admin'));
create policy "pitches_update_own" on public.pitches for update
  to authenticated
  using (founder_id = (select auth.uid()) and status <> 'removed')
  with check (founder_id = (select auth.uid()) and status in ('draft','live'));
create policy "pitches_delete_own_draft" on public.pitches for delete
  to authenticated using (founder_id = (select auth.uid()) and status = 'draft');
create policy "pitches_admin_all" on public.pitches for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.pitch_versions enable row level security;
create policy "versions_select_owner" on public.pitch_versions for select
  to authenticated using (
    exists (select 1 from public.pitches p
            where p.id = pitch_versions.pitch_id
              and p.founder_id = (select auth.uid())));
create policy "versions_select_admin" on public.pitch_versions for select
  to authenticated using (public.is_admin());
-- no insert/update/delete policies: only the database trigger writes versions
revoke insert, update, delete on public.pitch_versions from anon, authenticated;

-- ============================================================================
-- 3. AI SCORE (written only by your server, never by the browser)
-- ============================================================================
create table public.pitch_scores (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null unique references public.pitches(id) on delete cascade,
  overall smallint not null check (overall between 0 and 100),
  pitch_quality smallint check (pitch_quality between 0 and 100),
  longevity smallint check (longevity between 0 and 100),
  sustainability smallint check (sustainability between 0 and 100),
  market_potential smallint check (market_potential between 0 and 100),
  feasibility smallint check (feasibility between 0 and 100),
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  scored_version integer,
  model text,
  computed_at timestamptz not null default now()
);

alter table public.pitch_scores enable row level security;
create policy "scores_select" on public.pitch_scores for select using (
  exists (select 1 from public.pitches p
          where p.id = pitch_scores.pitch_id
            and (p.status = 'live' or p.founder_id = (select auth.uid())))
  or public.is_admin());
revoke insert, update, delete on public.pitch_scores from anon, authenticated;

-- ============================================================================
-- 4. STAR RATINGS + COMMENTS (separate sections on the pitch page)
-- ============================================================================
create table public.pitch_ratings (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pitch_id, user_id)
);
create index pitch_ratings_pitch_idx on public.pitch_ratings (pitch_id);
create trigger pitch_ratings_updated_at before update on public.pitch_ratings
  for each row execute function public.set_updated_at();

alter table public.pitch_ratings enable row level security;
create policy "ratings_select" on public.pitch_ratings for select using (
  exists (select 1 from public.pitches p where p.id = pitch_ratings.pitch_id));
create policy "ratings_insert" on public.pitch_ratings for insert
  to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.pitches p
                where p.id = pitch_ratings.pitch_id
                  and p.status = 'live'
                  and p.founder_id <> (select auth.uid())));
create policy "ratings_update_own" on public.pitch_ratings for update
  to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "ratings_delete_own" on public.pitch_ratings for delete
  to authenticated using (user_id = (select auth.uid()));
create policy "ratings_delete_admin" on public.pitch_ratings for delete
  to authenticated using (public.is_admin());

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index comments_pitch_idx on public.comments (pitch_id, created_at);

alter table public.comments enable row level security;
create policy "comments_select" on public.comments for select using (
  exists (select 1 from public.pitches p where p.id = comments.pitch_id));
create policy "comments_insert" on public.comments for insert
  to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.pitches p
                where p.id = comments.pitch_id and p.status = 'live'));
create policy "comments_delete_own" on public.comments for delete
  to authenticated using (user_id = (select auth.uid()));
create policy "comments_delete_admin" on public.comments for delete
  to authenticated using (public.is_admin());

-- ============================================================================
-- 5. FUNDING INTEREST (investor says "I'm interested in funding this")
-- ============================================================================
create table public.funding_interests (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.pitches(id) on delete cascade,
  investor_id uuid not null references public.profiles(id) on delete cascade,
  message text check (char_length(message) <= 2000),
  created_at timestamptz not null default now(),
  unique (pitch_id, investor_id)
);

alter table public.funding_interests enable row level security;
create policy "interest_insert" on public.funding_interests for insert
  to authenticated with check (
    investor_id = (select auth.uid())
    and public.my_role() = 'investor'
    and exists (select 1 from public.pitches p
                where p.id = funding_interests.pitch_id and p.status = 'live'));
create policy "interest_select_investor" on public.funding_interests for select
  to authenticated using (investor_id = (select auth.uid()));
create policy "interest_select_founder" on public.funding_interests for select
  to authenticated using (
    exists (select 1 from public.pitches p
            where p.id = funding_interests.pitch_id
              and p.founder_id = (select auth.uid())));
create policy "interest_select_admin" on public.funding_interests for select
  to authenticated using (public.is_admin());
create policy "interest_delete_own" on public.funding_interests for delete
  to authenticated using (investor_id = (select auth.uid()));

-- ============================================================================
-- 6. MARKETPLACE (no payments: buyers send an "I'm interested" request)
-- ============================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  pitch_id uuid references public.pitches(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','live','removed')),
  removed_reason text,
  name text not null check (char_length(name) between 1 and 150),
  description text check (char_length(description) <= 5000),
  product_type text not null check (product_type in ('software','hardware')),
  category text,
  price numeric(12,2) check (price is null or price >= 0),   -- display only
  currency text not null default 'USD',
  image_urls text[] not null default '{}',
  product_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products (status, created_at desc);
create index products_seller_idx on public.products (seller_id);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;
create policy "products_select_live" on public.products for select
  using (status = 'live');
create policy "products_select_own" on public.products for select
  to authenticated using (seller_id = (select auth.uid()));
create policy "products_insert_own" on public.products for insert
  to authenticated with check (
    seller_id = (select auth.uid())
    and status in ('draft','live')
    and public.my_role() in ('founder','admin'));
create policy "products_update_own" on public.products for update
  to authenticated
  using (seller_id = (select auth.uid()) and status <> 'removed')
  with check (seller_id = (select auth.uid()) and status in ('draft','live'));
create policy "products_delete_own_draft" on public.products for delete
  to authenticated using (seller_id = (select auth.uid()) and status = 'draft');
create policy "products_admin_all" on public.products for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.product_inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  contact_email text check (char_length(contact_email) <= 254),
  contact_phone text check (char_length(contact_phone) <= 30),
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_seller_idx on public.product_inquiries (seller_id, created_at desc);
create index inquiries_buyer_idx on public.product_inquiries (buyer_id, created_at desc);

-- seller is always taken from the product itself (cannot be forged)
create or replace function public.inquiry_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select seller_id into new.seller_id from public.products where id = new.product_id;
  if new.seller_id is null then raise exception 'Product not found'; end if;
  new.status := 'new';
  return new;
end; $$;
revoke execute on function public.inquiry_before_insert() from public, anon, authenticated;

-- after creation only the status can change
create or replace function public.inquiry_before_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.product_id := old.product_id;
  new.buyer_id := old.buyer_id;
  new.seller_id := old.seller_id;
  new.message := old.message;
  new.contact_email := old.contact_email;
  new.contact_phone := old.contact_phone;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end; $$;

create trigger inquiry_before_insert before insert on public.product_inquiries
  for each row execute function public.inquiry_before_insert();
create trigger inquiry_before_update before update on public.product_inquiries
  for each row execute function public.inquiry_before_update();

alter table public.product_inquiries enable row level security;
create policy "inquiries_insert" on public.product_inquiries for insert
  to authenticated with check (
    buyer_id = (select auth.uid())
    and seller_id <> (select auth.uid())
    and exists (select 1 from public.products p
                where p.id = product_inquiries.product_id and p.status = 'live'));
create policy "inquiries_select_parties" on public.product_inquiries for select
  to authenticated using (
    buyer_id = (select auth.uid()) or seller_id = (select auth.uid()));
create policy "inquiries_select_admin" on public.product_inquiries for select
  to authenticated using (public.is_admin());
create policy "inquiries_update_seller" on public.product_inquiries for update
  to authenticated using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));

create table public.buyer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null check (char_length(full_name) <= 150),
  line1 text not null check (char_length(line1) <= 200),
  line2 text check (char_length(line2) <= 200),
  city text not null,
  state text,
  postal_code text,
  country text not null,
  phone text check (char_length(phone) <= 30),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index buyer_addresses_user_idx on public.buyer_addresses (user_id);

alter table public.buyer_addresses enable row level security;
create policy "addresses_own" on public.buyer_addresses for all
  to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "addresses_admin_select" on public.buyer_addresses for select
  to authenticated using (public.is_admin());

-- ============================================================================
-- 7. CONTACT FORM
-- ============================================================================
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 150),
  email text not null check (char_length(email) <= 254),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;
create policy "contact_insert_anyone" on public.contact_submissions for insert
  to anon, authenticated with check (true);
create policy "contact_select_admin" on public.contact_submissions for select
  to authenticated using (public.is_admin());

-- ============================================================================
-- 8. DISCOVER RANKING VIEW (60% AI score + 40% community stars)
--    Edit the weights in the "cfg" line below to tune ranking.
-- ============================================================================
create view public.discover_pitches
with (security_invoker = true) as
with cfg as (
  select 0.60::numeric as w_ai,
         0.40::numeric as w_comm,
         50::numeric   as default_ai,     -- AI score used until a pitch is scored
         3.0::numeric  as prior_rating,   -- neutral starting rating
         5.0::numeric  as prior_weight    -- how many "virtual votes" the prior counts for
),
ratings as (
  select pitch_id, avg(stars)::numeric as rating_avg, count(*) as rating_count
  from public.pitch_ratings group by pitch_id
)
select
  p.id, p.founder_id, p.title, p.tagline, p.industry, p.stage,
  p.is_raising, p.amount_seeking, p.currency, p.country, p.city,
  p.logo_url, p.published_at, p.created_at, p.search_text,
  pr.display_name as founder_name,
  pr.avatar_url   as founder_avatar,
  s.overall       as ai_score,
  s.pitch_quality, s.longevity, s.sustainability, s.market_potential, s.feasibility,
  round(coalesce(r.rating_avg, 0), 2)   as rating_avg,
  coalesce(r.rating_count, 0)           as rating_count,
  round(c.community_score, 2)           as community_score,
  round(cfg.w_ai * coalesce(s.overall, cfg.default_ai)
        + cfg.w_comm * c.community_score, 2) as combined_score
from public.pitches p
cross join cfg
left join public.pitch_scores s on s.pitch_id = p.id
left join ratings r on r.pitch_id = p.id
left join public.public_profiles pr on pr.id = p.founder_id
cross join lateral (
  select ((coalesce(r.rating_avg, cfg.prior_rating) * coalesce(r.rating_count, 0)
           + cfg.prior_rating * cfg.prior_weight)
          / (coalesce(r.rating_count, 0) + cfg.prior_weight)) * 20 as community_score
) c
where p.status = 'live';

grant select on public.discover_pitches to anon, authenticated;

-- ============================================================================
-- 9. STORAGE (file buckets with size/type limits; users only touch own folder)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',     'avatars',     true,  2097152,
     array['image/jpeg','image/png','image/webp']),
  ('assets',      'assets',      true,  5242880,
     array['image/jpeg','image/png','image/webp','image/gif']),
  ('pitch-decks', 'pitch-decks', false, 20971520,
     array['application/pdf',
           'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects for select
  using (bucket_id in ('avatars','assets'));
create policy "storage_deck_read" on storage.objects for select
  to authenticated using (
    bucket_id = 'pitch-decks'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()));
create policy "storage_own_insert" on storage.objects for insert
  to authenticated with check (
    bucket_id in ('avatars','assets','pitch-decks')
    and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "storage_own_update" on storage.objects for update
  to authenticated using (
    bucket_id in ('avatars','assets','pitch-decks')
    and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (
    bucket_id in ('avatars','assets','pitch-decks')
    and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "storage_own_delete" on storage.objects for delete
  to authenticated using (
    bucket_id in ('avatars','assets','pitch-decks')
    and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
