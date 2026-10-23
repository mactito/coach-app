-- Run this whole file once in Supabase: SQL Editor > New query > Run.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'client' check (role in ('trainer','client')),
  full_name text,
  created_at timestamptz default now()
);

create function my_role() returns text language sql security definer set search_path = public stable
as $$ select role from profiles where id = auth.uid() $$;
create function is_trainer() returns boolean language sql security definer set search_path = public stable
as $$ select coalesce(my_role() = 'trainer', false) $$;

-- Every new sign-up becomes a client. Raphi is promoted to trainer by hand (see README).
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null, muscle text, video_url text
);
create table workouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trainer_id uuid not null default auth.uid() references profiles(id),
  created_at timestamptz default now()
);
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  position int not null default 0, sets int not null default 3, reps int not null default 10, video_url text
);
create table assignments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  scheduled_on date not null,
  unique (client_id, scheduled_on)
);
create table set_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  set_no int not null, kg numeric, reps int,
  logged_at timestamptz default now(),
  unique (assignment_id, workout_exercise_id, set_no)
);

alter table profiles enable row level security;
alter table exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table assignments enable row level security;
alter table set_logs enable row level security;

create policy "profiles read" on profiles for select using (id = auth.uid() or is_trainer());
create policy "profiles update own" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = my_role());

create policy "exercises read" on exercises for select to authenticated using (true);
create policy "exercises trainer write" on exercises for all using (is_trainer()) with check (is_trainer());

create policy "workouts read" on workouts for select using (
  is_trainer() or exists (select 1 from assignments a where a.workout_id = workouts.id and a.client_id = auth.uid()));
create policy "workouts trainer write" on workouts for all using (is_trainer()) with check (is_trainer());

create policy "workout_exercises read" on workout_exercises for select using (
  is_trainer() or exists (select 1 from assignments a where a.workout_id = workout_exercises.workout_id and a.client_id = auth.uid()));
create policy "workout_exercises trainer write" on workout_exercises for all using (is_trainer()) with check (is_trainer());

create policy "assignments read" on assignments for select using (is_trainer() or client_id = auth.uid());
create policy "assignments trainer write" on assignments for all using (is_trainer()) with check (is_trainer());

create policy "set_logs trainer read" on set_logs for select using (is_trainer());
create policy "set_logs client own" on set_logs for all
  using (exists (select 1 from assignments a where a.id = assignment_id and a.client_id = auth.uid()))
  with check (exists (select 1 from assignments a where a.id = assignment_id and a.client_id = auth.uid()));

insert into exercises (name, muscle) values
  ('Panca piana con bilanciere','Petto'),('Panca inclinata con manubri','Petto'),('Military press','Spalle'),
  ('Alzate laterali','Spalle'),('Pushdown tricipiti','Braccia'),('Rematore con bilanciere','Schiena'),
  ('Lat machine','Schiena'),('Squat','Gambe'),('Stacco rumeno','Gambe'),('Affondi camminati','Gambe'),
  ('Hip thrust','Glutei'),('Plank','Core');
