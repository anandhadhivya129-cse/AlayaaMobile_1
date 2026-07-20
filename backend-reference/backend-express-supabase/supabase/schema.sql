create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('customer', 'broker', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.approval_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.property_status as enum ('draft', 'pending', 'active', 'sold', 'rented', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enquiry_status as enum ('new', 'read', 'replied', 'closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'customer',
  profile_picture text,
  city text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.broker_approvals (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null unique references public.profiles(id) on delete cascade,
  status public.approval_status not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(12,2) not null default 0,
  location text not null,
  city text not null,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  area numeric(12,2) not null default 0,
  property_type text not null,
  status public.property_status not null default 'draft',
  images text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, property_id)
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  broker_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.touch_updated_at();

drop trigger if exists set_enquiries_updated_at on public.enquiries;
create trigger set_enquiries_updated_at
before update on public.enquiries
for each row
execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.is_approved_broker()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.broker_approvals ba on ba.broker_id = p.id
    where p.id = (select auth.uid())
      and p.role = 'broker'
      and ba.status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role public.user_role;
begin
  resolved_role := case
    when new.raw_user_meta_data ->> 'role' = 'broker' then 'broker'::public.user_role
    when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin'::public.user_role
    else 'customer'::public.user_role
  end;

  insert into public.profiles (id, full_name, email, phone, role, profile_picture, city, bio)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    resolved_role,
    nullif(new.raw_user_meta_data ->> 'profile_picture', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'bio', '')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    profile_picture = excluded.profile_picture,
    city = excluded.city,
    bio = excluded.bio,
    updated_at = now();

  if resolved_role = 'broker' then
    insert into public.broker_approvals (broker_id, status)
    values (new.id, 'pending')
    on conflict (broker_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.promote_user_to_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'admin', updated_at = now()
  where id = target_user_id;
end;
$$;
