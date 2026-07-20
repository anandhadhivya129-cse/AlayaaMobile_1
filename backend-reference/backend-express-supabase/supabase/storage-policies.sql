insert into storage.buckets (id, name, public)
values
  ('profile-pictures', 'profile-pictures', true),
  ('property-images', 'property-images', true)
on conflict (id) do update
set public = excluded.public;

alter table storage.objects enable row level security;

drop policy if exists "profile_pictures_insert_owner" on storage.objects;
create policy "profile_pictures_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "profile_pictures_update_owner" on storage.objects;
create policy "profile_pictures_update_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "profile_pictures_delete_owner" on storage.objects;
create policy "profile_pictures_delete_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "property_images_insert_broker" on storage.objects;
create policy "property_images_insert_broker"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (public.is_approved_broker() or public.is_admin())
);

drop policy if exists "property_images_update_broker" on storage.objects;
create policy "property_images_update_broker"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (public.is_approved_broker() or public.is_admin())
)
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (public.is_approved_broker() or public.is_admin())
);

drop policy if exists "property_images_delete_broker" on storage.objects;
create policy "property_images_delete_broker"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (public.is_approved_broker() or public.is_admin())
);

