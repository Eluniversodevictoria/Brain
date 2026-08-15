-- ============================================================
-- CONTENT BRAIN — Supabase Schema
-- Victoria · MVP v1.0
-- Run this in the Supabase SQL editor
-- ============================================================

-- ENUMS

create type macro_theme as enum (
  'dinero', 'amor', 'relaciones', 'autoestima', 'merecimiento',
  'estancamiento', 'ansiedad', 'proposito', 'creencias', 'bloqueo',
  'comparacion', 'esperanza', 'manifestacion', 'abundancia', 'confianza', 'desapego'
);

create type content_objective as enum (
  'grow', 'comments', 'saves', 'shares', 'connection', 'authority', 'nurture', 'presell', 'sell'
);

create type content_format_type as enum (
  'reel_talking', 'reel_storytelling', 'reel_educational', 'reel_visual',
  'affirmation', 'ritual', 'pov', 'carousel', 'story', 'post', 'other'
);

create type hook_mechanism as enum (
  'curiosity', 'identification', 'error', 'contrast', 'story',
  'question', 'confession', 'revelation', 'signal', 'warning',
  'new_perspective', 'micro_story', 'result', 'demystification'
);

create type content_status as enum (
  'idea', 'in_development', 'script_ready', 'produced', 'scheduled', 'published', 'discarded'
);

create type content_performance as enum ('good', 'normal', 'poor');

create type idea_status as enum ('raw', 'developing', 'script_ready');

create type idea_source as enum ('generator', 'dame_idea', 'manual', 'analyzer', 'transformer');

create type launch_phase as enum ('launch', 'growth', 'mature');

create type voc_type as enum ('voc_real', 'dato_observado', 'insight', 'hipotesis');

-- ============================================================
-- PERSONA (Victoria)
-- ============================================================
create table persona (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Victoria',
  apparent_age text not null default '32-36',
  backstory text,
  personality jsonb default '{
    "closeness": 4,
    "humor": "subtle_dry",
    "spirituality_level": 3.5,
    "emotional_intensity": 3,
    "vulnerability": 4,
    "curiosity": 5
  }',
  speech_style text,
  recurring_phrases text[] default array[]::text[],
  would_say text[] default array[]::text[],
  would_never_say text[] default array[]::text[],
  philosophy jsonb default '{}'::jsonb,
  storytelling_rules jsonb default '{
    "permitted_facts": [],
    "forbidden_inventions": [
      "divorcios", "infidelidades", "relaciones_abusivas",
      "hijos", "embarazos", "enfermedades", "diagnosticos",
      "deudas", "cantidades_dinero", "despidos", "negocios",
      "fallecimientos", "traumas"
    ]
  }',
  visual_prompt text,
  aesthetic_notes text,
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- ============================================================
-- AVATAR (Cliente ideal)
-- ============================================================
create table avatar (
  id uuid primary key default gen_random_uuid(),
  current_situation text,
  desires text,
  fears text[] default array[]::text[],
  private_thoughts text[] default array[]::text[],
  saves_content_when text[] default array[]::text[],
  comments_when text[] default array[]::text[],
  shares_when text[] default array[]::text[],
  has_tried text[] default array[]::text[],
  language_samples text[] default array[]::text[],
  hope_triggers text[] default array[]::text[],
  anxiety_triggers text[] default array[]::text[],
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- ============================================================
-- BRAND VOICE
-- ============================================================
create table brand_voice (
  id uuid primary key default gen_random_uuid(),
  closeness integer default 4 check (closeness between 1 and 5),
  spirituality_level numeric(2,1) default 3.5 check (spirituality_level between 1 and 5),
  spanish_type text default 'neutro_latino',
  sentence_length text default 'mixed_short_medium',
  use_questions boolean default true,
  preferred_words text[] default array[]::text[],
  forbidden_words text[] default array[
    'chicas', 'amén', 'vibrar alto', 'bajar la vibración',
    'simplemente', 'solo tienes que', 'energías negativas', 'tóxico'
  ]::text[],
  recurring_phrases text[] default array[]::text[],
  video_openers text[] default array[]::text[],
  video_closers text[] default array[]::text[],
  cta_style text default 'invitation_not_command',
  emoji_policy text default 'minimal_intentional',
  updated_at timestamptz default now()
);

-- ============================================================
-- CONTENT PILLARS
-- ============================================================
create table pillars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  related_themes macro_theme[] default array[]::macro_theme[],
  primary_emotion text,
  recommended_formats content_format_type[] default array[]::content_format_type[],
  example_angles text[] default array[]::text[],
  is_active boolean default true,
  sort_order integer default 0
);

-- ============================================================
-- CONTENT FORMATS
-- ============================================================
create table formats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format_type content_format_type not null,
  description text,
  structure text,
  recommended_length_seconds integer,
  best_for_objectives content_objective[] default array[]::content_objective[],
  notes text,
  is_active boolean default true
);

-- ============================================================
-- PAINS (Dolores en capas)
-- ============================================================
create table pains (
  id uuid primary key default gen_random_uuid(),
  macro_theme macro_theme not null,
  micro_label text not null,
  surface_pain text not null,
  emotional_pain text,
  private_thought text,
  core_fear text,
  surface_desire text,
  deep_desire text,
  daily_situations text[] default array[]::text[],
  related_hook_ids uuid[] default array[]::uuid[],
  recommended_format_ids uuid[] default array[]::uuid[],
  recommended_ctas text[] default array[]::text[],
  voc_type voc_type default 'hipotesis',
  source_notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- DESIRES (Deseos en capas)
-- ============================================================
create table desires (
  id uuid primary key default gen_random_uuid(),
  macro_theme macro_theme not null,
  explicit_desire text not null,
  emotional_desire text,
  deep_desire text,
  what_it_would_mean text,
  what_would_change text,
  mental_images text[] default array[]::text[],
  audience_phrases text[] default array[]::text[],
  voc_type voc_type default 'hipotesis',
  is_active boolean default true
);

-- ============================================================
-- HOOKS (Por mecanismo psicológico)
-- ============================================================
create table hooks (
  id uuid primary key default gen_random_uuid(),
  mechanism hook_mechanism not null,
  template text not null,
  example_filled text,
  why_it_works text,
  compatible_themes macro_theme[] default array[]::macro_theme[],
  compatible_formats content_format_type[] default array[]::content_format_type[],
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- IDEA BANK (Banco de ideas)
-- ============================================================
create table idea_bank (
  id uuid primary key default gen_random_uuid(),
  title text,
  raw_idea text not null,
  macro_theme macro_theme,
  pillar_id uuid references pillars(id),
  format_hint text,
  source idea_source default 'manual',
  status idea_status default 'raw',
  content_piece_id uuid,
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CONTENT PIECES (Historial)
-- ============================================================
create table content_pieces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  objective content_objective,
  pain_id uuid references pains(id),
  pillar_id uuid references pillars(id),
  format_id uuid references formats(id),
  hook_id uuid references hooks(id),
  macro_theme macro_theme,

  -- Strategy
  psychological_mechanism text,
  angle text,
  primary_emotion text,

  -- Content
  hook_text text,
  script text,
  on_screen_text text,
  visual_direction text,
  caption text,
  cta text,
  hashtags text[] default array[]::text[],
  ai_video_prompt text,

  -- Status
  status content_status default 'idea',
  performance content_performance,
  metrics jsonb default '{
    "views": null,
    "likes": null,
    "comments": null,
    "saves": null,
    "shares": null,
    "followers_gained": null
  }',
  notes text
);

-- ============================================================
-- CALENDAR ENTRIES
-- ============================================================
create table calendar_entries (
  id uuid primary key default gen_random_uuid(),
  scheduled_date date not null,
  scheduled_time time,
  content_piece_id uuid references content_pieces(id),
  idea_bank_id uuid references idea_bank(id),
  pillar_id uuid references pillars(id),
  format_type content_format_type,
  status content_status default 'idea',
  week_number integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint has_content check (
    content_piece_id is not null or idea_bank_id is not null or notes is not null
  )
);

-- ============================================================
-- PUBLICATION STRATEGY
-- ============================================================
create table publication_strategy (
  id uuid primary key default gen_random_uuid(),
  reels_per_week integer default 3,
  carousels_per_week integer default 1,
  stories_per_day integer default 1,
  best_days text[] default array['tuesday','thursday','friday','saturday']::text[],
  best_times jsonb default '{"reel": "18:00", "carousel": "10:00", "story": "08:00"}',
  current_phase launch_phase default 'launch',
  pillar_distribution jsonb default '{
    "manifestacion": 20,
    "autoestima": 20,
    "dinero": 15,
    "relaciones": 15,
    "rituales": 10,
    "abundancia": 10,
    "creencias": 10
  }',
  updated_at timestamptz default now()
);

-- ============================================================
-- LAUNCH PLAN DAYS
-- ============================================================
create table launch_plan_days (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null check (day_number between 1 and 30),
  week_number integer not null check (week_number between 1 and 4),
  content_type content_format_type,
  is_rest_day boolean default false,
  pillar_slug text,
  objective content_objective,
  hook_mechanism hook_mechanism,
  strategic_notes text,
  source_type text,
  calendar_entry_id uuid references calendar_entries(id),
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_pains_macro_theme on pains(macro_theme);
create index idx_pains_active on pains(is_active);
create index idx_hooks_mechanism on hooks(mechanism);
create index idx_content_pieces_status on content_pieces(status);
create index idx_content_pieces_theme on content_pieces(macro_theme);
create index idx_content_pieces_created on content_pieces(created_at desc);
create index idx_calendar_date on calendar_entries(scheduled_date);
create index idx_calendar_week on calendar_entries(week_number);
create index idx_idea_bank_status on idea_bank(status);
create index idx_idea_bank_theme on idea_bank(macro_theme);

-- ============================================================
-- SEED: Victoria's persona (confirmed facts only)
-- ============================================================
insert into persona (
  name, apparent_age, backstory, speech_style,
  recurring_phrases, would_never_say, visual_prompt
) values (
  'Victoria',
  '32-36',
  'Victoria siempre fue la responsable. La que cumplía, la que trataba de hacer las cosas bien, la que intentaba tener un plan para todo. Desde afuera, su vida no necesariamente se veía mal. Pero por dentro vivía con una sensación constante de que todavía faltaba algo para poder estar tranquila. Cuando tuviera más dinero, cuando llegara cierta persona, cuando resolviera el siguiente problema. No hubo un acontecimiento que lo cambiara todo — fue un proceso gradual. Comenzó a escribir lo que pensaba, a observar cómo se hablaba a sí misma, a cuestionar algunas de sus creencias. Ahí llegaron el journaling, la gratitud, la visualización, las afirmaciones, aprender a soltar y observar patrones. Lo que cambió primero fue la manera en que empezó a vivir las cosas, no las cosas en sí mismas.',
  'Frases cortas alternadas con medias. Muchas preguntas que generan pausa interna. Comienza con situaciones u observaciones, nunca con "Hola, hoy les voy a hablar de...". Termina con invitaciones, nunca con comandos. Español neutro, conversacional, íntimo.',
  array[
    '¿Y yo qué quiero?',
    'Me pregunto si…',
    'Lo que sí sé es que…',
    'Hay algo que cambió cuando dejé de…',
    'No es que desaparecieron las cosas. Es que cambió la manera en que las vivo.',
    'Antes reaccionaba automáticamente. Ahora al menos puedo reconocer cuándo estoy entrando en ese patrón.',
    'Hay días en los que todavía…',
    'Esto es algo que todavía tengo que recordarme.',
    '¿Alguna vez has sentido que…?',
    'No sé si esto es para ti. Pero a mí me hizo pensar.',
    '¿Qué estarías haciendo si no tuvieras que demostrarte nada?',
    'Eso también es válido.'
  ],
  array[
    'Haz esto y mañana recibirás dinero.',
    'El universo está obligado a darte lo que pides.',
    'Si no manifestaste algo es porque no vibraste suficientemente alto.',
    'Esto funciona para absolutamente todo el mundo.',
    'Nunca vuelvas a tener pensamientos negativos.',
    'Yo conozco el secreto definitivo de la manifestación.',
    'Si realmente creyeras, ya lo tendrías.',
    'Ignora tus problemas y piensa positivo.',
    'No necesitas actuar; simplemente manifiéstalo.'
  ],
  'Woman named Victoria, apparent age 32-36, olive warm skin tone, long dark brunette hair with natural waves and subtle warm highlights, minimal natural makeup, delicate gold chain necklace. Dressed in elevated basics: neutral tones (charcoal, cream, linen, sand, black). No visible logos. Warm cinematic, natural light. Vertical format (9:16). Calm, present, warm. Not performative happiness. Knowing slight smile. Direct eye contact to camera in key message moments.'
);

-- SEED: Brand voice
insert into brand_voice (
  closeness, spirituality_level, spanish_type,
  preferred_words, forbidden_words,
  recurring_phrases, cta_style, emoji_policy
) values (
  4, 3.5, 'neutro_latino',
  array['intención','observar','patrón','relación con','soltar','apertura','confiar','diálogo interno','momento','espacio','permitirse','reconocer','curiosidad','proceso'],
  array['vibrar alto','bajar la vibración','simplemente','solo tienes que','¡chicas!','amén','energías negativas','tóxico','manifestar (sin contexto)'],
  array['¿Y yo qué quiero?','Me pregunto si…','Lo que sí sé es que…','Hay días en los que todavía…'],
  'invitation_not_command',
  'minimal_intentional'
);

-- SEED: Publication strategy
insert into publication_strategy default values;
