-- migrate:up
do $$ begin
create type participation_mode as enum ('SOLO','TEAM');
exception when duplicate_object then null;
end $$;

do $$ begin
create type challenge_phase as enum ('REGISTRATION','RUNNING','JUDGING','FINISHED');
exception when duplicate_object then null;
end $$;

alter table challenges
    add column if not exists participation_mode participation_mode not null default 'SOLO',
    add column if not exists start_at timestamptz,
    add column if not exists end_at timestamptz,
    add column if not exists phase challenge_phase not null default 'REGISTRATION',
    add column if not exists requires_proof boolean not null default false,
    add column if not exists podium_size int not null default 1,
    add column if not exists winners_finalized boolean not null default false;

-- pour l’instant, on autorise start/end null si tu as déjà des rows,
-- mais idéalement tu les remplis puis tu mets NOT NULL dans une migration suivante.

-- migrate:down
alter table challenges
drop column if exists winners_finalized,
  drop column if exists podium_size,
  drop column if exists requires_proof,
  drop column if exists phase,
  drop column if exists end_at,
  drop column if exists start_at,
  drop column if exists participation_mode;

drop type if exists challenge_phase;
drop type if exists participation_mode;
