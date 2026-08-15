create table if not exists pdf_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz default now()
);

-- Index for fast count queries
create index if not exists pdf_leads_created_at_idx on pdf_leads (created_at desc);

-- Prevent duplicate emails
create unique index if not exists pdf_leads_email_idx on pdf_leads (lower(email));
