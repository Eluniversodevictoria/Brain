-- ============================================================
-- CONTENT BRAIN — Schema additions
-- Run in Supabase SQL editor AFTER schema.sql
-- ============================================================

-- saved_entries: replaces victoria_saved_entries localStorage key
-- Stores every piece the user explicitly saves from any tool.

create table if not exists saved_entries (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade default auth.uid() not null,
  saved_at             timestamptz default now() not null,
  source               text not null,           -- 'plan-hoy' | 'inspirar' | 'generador' | 'dame-una-idea'
  is_favorite          boolean default false not null,

  -- Taxonomy
  theme                text not null,
  format               text not null,
  objective            text not null,

  -- Content
  hook                 text not null,
  main_text            text not null,
  cta                  text not null,
  caption              text not null,
  hashtags             text[] default array[]::text[],
  visual_style         text,
  visual_style_label   text,

  -- Kind + reference
  kind                 text,                    -- 'reel' | 'post' | 'carousel' (legacy: 'image' → migrado a 'post' en migration 002)
  reference_link       text,

  -- Inspiration metadata (from Crear desde link)
  inspiration_platform text,
  inspiration_url      text,
  inspiration_tema     text,
  inspiration_mecanismo text,

  -- Variation lineage
  related_to           uuid references saved_entries(id) on delete set null
);

alter table saved_entries enable row level security;

create policy "Users manage their own saved entries"
  on saved_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_saved_entries_user     on saved_entries(user_id);
create index idx_saved_entries_saved_at on saved_entries(user_id, saved_at desc);
create index idx_saved_entries_favs     on saved_entries(user_id, is_favorite) where is_favorite = true;

-- ============================================================
-- user_strategy: replaces victoria_strategy localStorage key
-- ============================================================

create table if not exists user_strategy (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade unique default auth.uid() not null,
  reels_per_week      integer default 3,
  carrusels_per_week  integer default 1,
  stories_per_week    integer default 1,
  primary_objective   text default 'grow',
  active_pillars      text[] default array[]::text[],
  launch_start_date   text default '',
  updated_at          timestamptz default now()
);

alter table user_strategy enable row level security;

create policy "Users manage their own strategy"
  on user_strategy for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
