-- Run AFTER 02_nutrition_chat.sql: check-in photos (before / after), stored privately.
create table checkin_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  kind text not null check (kind in ('before','after')),
  path text not null,
  created_at timestamptz not null default now()
);
create index on checkin_photos (client_id, created_at desc);
alter table checkin_photos enable row level security;
create policy "photos read" on checkin_photos for select using (is_trainer() or client_id = auth.uid());
create policy "photos insert own" on checkin_photos for insert with check (client_id = auth.uid());
create policy "photos delete own" on checkin_photos for delete using (client_id = auth.uid());

insert into storage.buckets (id, name, public) values ('checkins', 'checkins', false) on conflict do nothing;
create policy "checkins read" on storage.objects for select to authenticated
  using (bucket_id = 'checkins' and (public.is_trainer() or (storage.foldername(name))[1] = auth.uid()::text));
create policy "checkins upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
