create unique index orchestration_jobs_one_active_per_run_idx
  on public.orchestration_jobs (run_id)
  where (status in ('pending', 'processing'));

create policy jobs_insert_run_org on public.orchestration_jobs
for insert with check (
  exists (
    select 1 from public.orchestration_runs r
    join public.organization_members m on m.org_id = r.org_id
    where r.id = orchestration_jobs.run_id
      and m.user_id = auth.uid()
      and r.status = 'queued'
      and not exists (
        select 1 from public.orchestration_jobs j
        where j.run_id = r.id
          and j.status in ('pending', 'processing')
      )
  )
);

create policy runs_delete_queued_org on public.orchestration_runs
for delete using (
  status = 'queued'
  and initiating_user = auth.uid()
  and exists (
    select 1 from public.organization_members m
    where m.org_id = orchestration_runs.org_id and m.user_id = auth.uid()
  )
);
