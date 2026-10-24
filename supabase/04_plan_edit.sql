-- Run AFTER 03_photos.sql: delete workouts safely, per-client plan edits, and protection for completed workouts.

alter table workouts add column deleted_at timestamptz;                 -- "deleted" workouts are hidden, not erased, so history stays
alter table workouts add column is_custom boolean not null default false; -- a private copy edited for one client's day

-- Workouts that clients have already logged sets for
create view workouts_used with (security_invoker = true) as
  select distinct a.workout_id from assignments a
  where exists (select 1 from set_logs l where l.assignment_id = a.id);

-- Delete a workout: hide it and remove FUTURE assignments that have no logged sets. Past sessions stay in the clients' history.
create function delete_workout(wid uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_trainer() then raise exception 'Non autorizzato'; end if;
  delete from assignments a
    where a.workout_id = wid and a.scheduled_on >= (now() at time zone 'Europe/Rome')::date
      and not exists (select 1 from set_logs l where l.assignment_id = a.id);
  update workouts set deleted_at = now() where id = wid;
end $$;

-- Replace a workout with a new version: future, untouched assignments move to the new version; the old one is hidden.
create function replace_workout(old_id uuid, new_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_trainer() then raise exception 'Non autorizzato'; end if;
  update assignments a set workout_id = new_id
    where a.workout_id = old_id and a.scheduled_on >= (now() at time zone 'Europe/Rome')::date
      and not exists (select 1 from set_logs l where l.assignment_id = a.id);
  update workouts set deleted_at = now() where id = old_id;
end $$;

-- Safety nets: a workout a client has already started or finished can't be swapped or have exercises removed.
create function block_reassign() returns trigger language plpgsql as $$
begin
  if new.workout_id <> old.workout_id and exists (select 1 from set_logs where assignment_id = old.id) then
    raise exception 'Il cliente ha già registrato delle serie: non puoi cambiare questo allenamento.';
  end if;
  return new;
end $$;
create trigger assignments_block_reassign before update on assignments for each row execute function block_reassign();

create function block_logged_exercise_delete() returns trigger language plpgsql as $$
begin
  if exists (select 1 from set_logs where workout_exercise_id = old.id) then
    raise exception 'Questo esercizio ha serie già registrate dai clienti: non può essere eliminato.';
  end if;
  return old;
end $$;
create trigger workout_exercises_block_delete before delete on workout_exercises for each row execute function block_logged_exercise_delete();
