-- Run AFTER 04_plan_edit.sql: rest timer per exercise, and the client's first-login questionnaire.

alter table workout_exercises add column rest_seconds int not null default 90 check (rest_seconds between 0 and 600);
alter table profiles add column onboarded_at timestamptz;

create table client_profiles (
  client_id uuid primary key references profiles(id) on delete cascade,
  age int check (age between 10 and 100),
  weight_kg numeric(5,1) check (weight_kg between 25 and 300),
  height_cm int check (height_cm between 100 and 250),
  goal text, experience text,
  days_per_week int check (days_per_week between 1 and 7),
  limitations text,
  updated_at timestamptz default now()
);
alter table client_profiles enable row level security;
create policy "client_profiles read" on client_profiles for select using (is_trainer() or client_id = auth.uid());
create policy "client_profiles insert own" on client_profiles for insert with check (client_id = auth.uid());
create policy "client_profiles update own" on client_profiles for update using (client_id = auth.uid()) with check (client_id = auth.uid());
