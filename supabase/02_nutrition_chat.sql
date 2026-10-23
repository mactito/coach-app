-- Run AFTER schema.sql: Supabase > SQL Editor > New query > Run.

alter table profiles add column consented_at timestamptz;

create table nutrition_targets (
  client_id uuid primary key references profiles(id) on delete cascade,
  kcal int not null default 2200, protein int not null default 160,
  carbs int not null default 240, fat int not null default 70,
  updated_at timestamptz default now()
);
create table meals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  day int not null check (day between 0 and 6),          -- 0 = Monday
  position int not null default 0,
  title text not null, description text not null default '',
  protein int not null default 0, carbs int not null default 0, fat int not null default 0
);
create index on meals (client_id, day);
create table messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,   -- the thread belongs to this client
  sender_id uuid not null default auth.uid() references profiles(id),
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index on messages (client_id, created_at);

alter table nutrition_targets enable row level security;
alter table meals enable row level security;
alter table messages enable row level security;

create policy "targets read" on nutrition_targets for select using (is_trainer() or client_id = auth.uid());
create policy "targets trainer write" on nutrition_targets for all using (is_trainer()) with check (is_trainer());
create policy "meals read" on meals for select using (is_trainer() or client_id = auth.uid());
create policy "meals trainer write" on meals for all using (is_trainer()) with check (is_trainer());
create policy "messages read" on messages for select using (is_trainer() or client_id = auth.uid());
create policy "messages send" on messages for insert
  with check (sender_id = auth.uid() and (is_trainer() or client_id = auth.uid()));

alter publication supabase_realtime add table messages;
