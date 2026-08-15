-- ============================================================
-- Migration 003 — slides jsonb + launch_mode
-- Run in Supabase SQL editor AFTER 002_kind_and_image_text_length.sql
-- ============================================================

-- 1. Slides de carrusel — estructura: [{slide, role, text}]
--    Nullable para reels y posts (no tienen slides).
ALTER TABLE saved_entries
  ADD COLUMN IF NOT EXISTS slides jsonb;

-- 2. Modo lanzamiento en estrategia.
--    Default true para no romper el comportamiento actual.
ALTER TABLE user_strategy
  ADD COLUMN IF NOT EXISTS launch_mode boolean DEFAULT true;

-- Verificación post-migración:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('saved_entries', 'user_strategy')
--   AND column_name IN ('slides', 'launch_mode')
-- ORDER BY table_name, column_name;
