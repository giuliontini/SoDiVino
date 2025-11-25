-- Create wine_personas table
create table if not exists public.wine_personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null check (color in ('red','white','rose','orange','sparkling','any')),
  grapes text[] not null default '{}',
  body text not null default 'unknown' check (body in ('light','medium','full','unknown')),
  tannin text not null default 'unknown' check (tannin in ('low','medium','high','unknown')),
  acidity text not null default 'unknown' check (acidity in ('low','medium','high','unknown')),
  sweetness text not null default 'unknown' check (sweetness in ('dry','off_dry','sweet','unknown')),
  food_pairing_tags text[] not null default '{}',
  min_price numeric,
  max_price numeric,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wine_personas_user_id_idx on public.wine_personas(user_id);
create index if not exists wine_personas_is_default_idx on public.wine_personas(user_id, is_default);

create or replace function public.set_wine_personas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_wine_personas_updated_at
before update on public.wine_personas
for each row
execute procedure public.set_wine_personas_updated_at();

-- Create user_preferences table
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorite_grapes text[] not null default '{}',
  quality_tier text not null default 'value' check (quality_tier in ('value','everyday','special')),
  usual_budget_min numeric,
  usual_budget_max numeric,
  risk_tolerance text not null default 'safe' check (risk_tolerance in ('safe','adventurous','anything_goes')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute procedure public.set_user_preferences_updated_at();
