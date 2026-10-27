-- Run AFTER 05_timer_onboarding.sql: stores the phones that should receive push notifications.
create table device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);
alter table device_tokens enable row level security;  -- no policies: only the two functions below and the server can touch it

create function register_device(p_token text, p_platform text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  insert into device_tokens (user_id, token, platform) values (auth.uid(), p_token, p_platform)
  on conflict (token) do update set user_id = auth.uid(), platform = excluded.platform, updated_at = now();
end $$;

create function unregister_device(p_token text) returns void language plpgsql security definer set search_path = public as $$
begin
  delete from device_tokens where token = p_token and user_id = auth.uid();
end $$;
