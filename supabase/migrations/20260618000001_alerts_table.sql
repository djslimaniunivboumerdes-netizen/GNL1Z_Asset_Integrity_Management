-- supabase/migrations/20260618000001_alerts_table.sql
-- New table for Fast Alerts as per spec

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  tag text not null,
  alert_type text not null,           -- e.g. 'FAILED_TEST', 'OVERDUE_TEST', 'UPCOMING_TEST', 'NOTE_KEYWORD'
  priority text not null check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  message text not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
  source_log_id uuid references public.maintenance_logs(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists alerts_tag_idx on public.alerts(tag);
create index if not exists alerts_status_idx on public.alerts(status);
create index if not exists alerts_priority_idx on public.alerts(priority);
create index if not exists alerts_created_idx on public.alerts(created_at desc);

-- RLS
alter table public.alerts enable row level security;

-- Public read (all users can see alerts)
create policy "alerts_read_all" on public.alerts for select using (true);

-- Authenticated can insert/update (for triggers or manual)
create policy "alerts_insert_auth" on public.alerts for insert to authenticated with check (true);
create policy "alerts_update_auth" on public.alerts for update to authenticated using (true);

-- Trigger to update timestamp
create or replace function update_alerts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_alerts_updated_at
  before update on public.alerts
  for each row execute function update_alerts_updated_at();
