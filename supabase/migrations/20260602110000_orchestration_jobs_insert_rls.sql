create policy jobs_insert_run_org on public.orchestration_jobs
for insert with check (
  exists (
    select 1 from public.orchestration_runs r
    join public.organization_members m on m.org_id = r.org_id
    where r.id = orchestration_jobs.run_id and m.user_id = auth.uid()
  )
);

create policy runs_delete_queued_org on public.orchestration_runs
for delete using (
  status = 'queued'
  and exists (
    select 1 from public.organization_members m
    where m.org_id = orchestration_runs.org_id and m.user_id = auth.uid()
  )
);
