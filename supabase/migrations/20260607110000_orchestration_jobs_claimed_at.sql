alter table public.orchestration_jobs
  add column if not exists claimed_at timestamptz;

create index if not exists orchestration_jobs_stale_processing_idx
  on public.orchestration_jobs (claimed_at)
  where status = 'processing';
