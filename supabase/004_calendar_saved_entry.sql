-- ============================================================
-- Migration 004 — calendar_entries (tabla nueva, versión simplificada)
-- Sin FKs a content_pieces/idea_bank/pillars — esas tablas no existen
-- en este proyecto. Solo los campos que usa el flujo actual.
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date  date NOT NULL,
  status          text NOT NULL DEFAULT 'idea',
  notes           text,
  format_type     text,
  week_number     integer,
  saved_entry_id  uuid REFERENCES saved_entries(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  CONSTRAINT has_content CHECK (
    saved_entry_id IS NOT NULL OR notes IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_calendar_date   ON calendar_entries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_calendar_status ON calendar_entries(status);
