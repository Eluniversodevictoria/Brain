-- ============================================================
-- Migration 002 — kind normalization + image_text_length
-- Run in Supabase SQL editor AFTER schema-additions.sql
-- ============================================================

-- 1. Backfill: la única fila con kind=null vino de /inspirar (siempre reel).
UPDATE saved_entries
SET kind = 'reel'
WHERE kind IS NULL;

-- 2. Añadir columna image_text_length con validación de valores.
--    Nullable: reels, carruseles y entradas legacy no tienen longitud de texto imagen.
ALTER TABLE saved_entries
  ADD COLUMN IF NOT EXISTS image_text_length text
  CHECK (image_text_length IN ('short', 'medium', 'long'));

-- 3. Verificación post-migración.
--    Ejecuta esto después para confirmar que todo quedó bien:
--
-- SELECT kind, count(*) FROM saved_entries GROUP BY kind ORDER BY count DESC;
-- SELECT image_text_length, count(*) FROM saved_entries GROUP BY image_text_length;
