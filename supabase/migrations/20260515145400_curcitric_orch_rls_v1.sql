alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.repositories enable row level security;
alter table public.secret_profiles enable row level security;
alter table public.orchestration_runs enable row level security;
alter table public.orchestration_jobs enable row level security;

create policy organizations_select_members on public.organizations
for select using (
  exists (
    select 1 from public.organization_members m
    where m.org_id = organizations.id and m.user_id = auth.uid()
  )
);

create policy org_members_select_own on public.organization_members
for select using (user_id = auth.uid());

create policy projects_select_members on public.projects
for select using (
  exists (
    select 1 from public.organization_members m
    where m.org_id = projects.org_id and m.user_id = auth.uid()
  )
);

create policy projects_insert_admin on public.projects
for insert with check (
  exists (
    select 1 from public.organization_members m
    where m.org_id = projects.org_id and m.user_id = auth.uid()
    and m.role in ('owner', 'admin')
  )
);

create policy repositories_select_members on public.repositories
for select using (
  exists (
    select 1 from public.organization_members m
    where m.org_id = repositories.org_id and m.user_id = auth.uid()
  )
);

create policy secret_profiles_crud_own on public.secret_profiles
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy runs_select_org on public.orchestration_runs
for select using (
  exists (
    select 1 from public.organization_members m
    where m.org_id = orchestration_runs.org_id and m.user_id = auth.uid()
  )
);

create policy runs_insert_members on public.orchestration_runs
for insert with check (
  exists (
    select 1 from public.organization_members m
    where m.org_id = orchestration_runs.org_id and m.user_id = auth.uid()
  )
);

create policy jobs_select_run_org on public.orchestration_jobs
for select using (
  exists (
    select 1 from public.orchestration_runs r
    join public.organization_members m on m.org_id = r.org_id
    where r.id = orchestration_jobs.run_id and m.user_id = auth.uid()
  )
);
