-- Taste profiles capture simplified onboarding inputs
create table if not exists public.taste_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_name text not null default 'Primary profile',
  preferred_styles text[] not null default '{}',
  sweetness_preference text not null default 'dry' check (sweetness_preference in ('dry','off_dry','sweet','flexible')),
  adventurousness text not null default 'balanced' check (adventurousness in ('classic','balanced','bold')),
  budget_focus text not null default 'balanced' check (budget_focus in ('value','balanced','premium')),
  occasion_tags text[] not null default '{}',
  favorite_regions text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists taste_profiles_user_id_idx on public.taste_profiles(user_id, updated_at desc);

create or replace function public.set_taste_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_taste_profiles_updated_at
before update on public.taste_profiles
for each row
execute procedure public.set_taste_profiles_updated_at();

-- Menu sessions connect uploads to restaurants
create table if not exists public.menu_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_name text,
  parsed_list_id text,
  upload_reference text,
  status text not null default 'parsed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_sessions_user_id_idx on public.menu_sessions(user_id, created_at desc);

create or replace function public.set_menu_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_menu_sessions_updated_at
before update on public.menu_sessions
for each row
execute procedure public.set_menu_sessions_updated_at();

-- Recommendation results capture generated scores for a session and taste profile
create table if not exists public.recommendation_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid references public.menu_sessions (id) on delete set null,
  taste_profile_id uuid references public.taste_profiles (id) on delete set null,
  wine_id text not null,
  score numeric,
  reason text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists recommendation_results_user_idx on public.recommendation_results(user_id);
create index if not exists recommendation_results_session_idx on public.recommendation_results(session_id);
