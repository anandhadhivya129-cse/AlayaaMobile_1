alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.enquiries enable row level security;
alter table public.broker_approvals enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
)
with check (
  id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "properties_public_select" on public.properties;
create policy "properties_public_select"
on public.properties
for select
to anon, authenticated
using (
  status = 'active'
  or broker_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "properties_insert_broker_or_admin" on public.properties;
create policy "properties_insert_broker_or_admin"
on public.properties
for insert
to authenticated
with check (
  (broker_id = (select auth.uid()) and public.is_approved_broker())
  or public.is_admin()
);

drop policy if exists "properties_update_broker_or_admin" on public.properties;
create policy "properties_update_broker_or_admin"
on public.properties
for update
to authenticated
using (
  broker_id = (select auth.uid())
  or public.is_admin()
)
with check (
  (broker_id = (select auth.uid()) and public.is_approved_broker())
  or public.is_admin()
);

drop policy if exists "properties_delete_broker_or_admin" on public.properties;
create policy "properties_delete_broker_or_admin"
on public.properties
for delete
to authenticated
using (
  broker_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (
  customer_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (
  customer_id = (select auth.uid())
);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (
  customer_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "enquiries_select_own_broker_admin" on public.enquiries;
create policy "enquiries_select_own_broker_admin"
on public.enquiries
for select
to authenticated
using (
  customer_id = (select auth.uid())
  or broker_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "enquiries_insert_customer" on public.enquiries;
create policy "enquiries_insert_customer"
on public.enquiries
for insert
to authenticated
with check (
  customer_id = (select auth.uid())
);

drop policy if exists "enquiries_update_broker_admin" on public.enquiries;
create policy "enquiries_update_broker_admin"
on public.enquiries
for update
to authenticated
using (
  broker_id = (select auth.uid())
  or public.is_admin()
)
with check (
  broker_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "broker_approvals_select_own_admin" on public.broker_approvals;
create policy "broker_approvals_select_own_admin"
on public.broker_approvals
for select
to authenticated
using (
  broker_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "broker_approvals_update_admin" on public.broker_approvals;
create policy "broker_approvals_update_admin"
on public.broker_approvals
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "broker_approvals_insert_admin" on public.broker_approvals;
create policy "broker_approvals_insert_admin"
on public.broker_approvals
for insert
to authenticated
with check (public.is_admin());

