-- Create the customers table, its indexes, its updated_at trigger, and its
-- Row Level Security policies. See docs/database.md for the design rationale.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supports the per-user "list customers, newest first" query and backs the
-- owner_id equality checks used by every RLS policy below.
create index customers_owner_id_created_at_idx
  on public.customers (owner_id, created_at desc);

-- Postgres has no built-in "touch updated_at on change" behavior, so it must
-- be implemented explicitly as a trigger.
create function public.set_customers_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.set_customers_updated_at();

alter table public.customers enable row level security;

-- A user may only ever see their own customer records.
create policy customers_select_own
  on public.customers
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- with check prevents inserting a row owned by anyone other than the caller,
-- even if a client attempts to supply a different owner_id explicitly.
create policy customers_insert_own
  on public.customers
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

-- using restricts which existing rows can be targeted; with check prevents
-- the update from reassigning owner_id to steal or give away a row.
create policy customers_update_own
  on public.customers
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy customers_delete_own
  on public.customers
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));
