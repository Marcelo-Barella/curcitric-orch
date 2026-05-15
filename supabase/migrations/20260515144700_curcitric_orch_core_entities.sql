create extension if not exists "uuid-ossp";

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  primary key (org_id, user_id)
);

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.repositories (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  github_repo_id bigint not null,
  full_name text not null,
  unique (org_id, github_repo_id)
);

create table public.secret_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  encrypted_payload bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orchestration_runs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  initiating_user uuid not null references auth.users(id),
  github_installation_id bigint,
  bootstrap_run_id text,
  status text not null check (status in ('pending','queued','running','completed','failed')),
  config_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.orchestration_jobs (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references public.orchestration_runs(id) on delete cascade,
  claimed_by text,
  available_at timestamptz not null default now(),
  status text not null check (status in ('pending','processing','done','error'))
);
