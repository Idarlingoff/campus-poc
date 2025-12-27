-- migrate:up

-- enums
do $$ begin
create type challenge_status as enum ('PENDING','APPROVED','REJECTED');
exception when duplicate_object then null;
end $$;

do $$ begin
create type challenge_difficulty as enum ('facile','moyen','difficile');
exception when duplicate_object then null;
end $$;

do $$ begin
create type challenge_category as enum ('creation','nourriture','photo','groupe','style','autre');
exception when duplicate_object then null;
end $$;

-- table
create table if not exists challenges (
                                          id uuid primary key default gen_random_uuid(),

    title text not null,
    description text not null,

    category challenge_category not null default 'autre',
    difficulty challenge_difficulty not null default 'moyen',

    points int not null default 0,
    duration_min int not null default 60,

    status challenge_status not null default 'PENDING',

    created_by uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    moderated_by uuid references users(id) on delete set null,
    moderated_at timestamptz,
    rejection_reason text
    );

create index if not exists idx_challenges_status on challenges(status);
create index if not exists idx_challenges_created_by on challenges(created_by);

-- auto updated_at (si tu n’as pas déjà une fonction globale)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

drop trigger if exists trg_challenges_updated_at on challenges;
create trigger trg_challenges_updated_at
    before update on challenges
    for each row execute function set_updated_at();

-- migrate:down
drop trigger if exists trg_challenges_updated_at on challenges;
drop table if exists challenges;

drop type if exists challenge_category;
drop type if exists challenge_difficulty;
drop type if exists challenge_status;
