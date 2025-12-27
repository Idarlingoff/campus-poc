-- migrate:up
do $$ begin
create type participant_type as enum ('USER','TEAM');
exception when duplicate_object then null;
end $$;

do $$ begin
create type participant_status as enum ('REGISTERED','SUBMITTED','WITHDRAWN','DISQUALIFIED');
exception when duplicate_object then null;
end $$;

create table if not exists challenge_participants (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null references challenges(id) on delete cascade,
    participant_type participant_type not null,

    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,

    status participant_status not null default 'REGISTERED',
    registered_at timestamptz not null default now(),
    submitted_at timestamptz
    );

-- contraintes: soit user_id soit team_id
alter table challenge_participants
    add constraint chk_participant_one
        check (
            (participant_type='USER' and user_id is not null and team_id is null) or
            (participant_type='TEAM' and team_id is not null and user_id is null)
            );

-- unicité par challenge
create unique index if not exists uq_ch_part_user
    on challenge_participants(challenge_id, user_id)
    where user_id is not null;

create unique index if not exists uq_ch_part_team
    on challenge_participants(challenge_id, team_id)
    where team_id is not null;

-- (optionnel mais utile pour performances)
create index if not exists idx_ch_part_challenge on challenge_participants(challenge_id);
create index if not exists idx_ch_part_user on challenge_participants(user_id);
create index if not exists idx_ch_part_team on challenge_participants(team_id);

-- migrate:down
drop table if exists challenge_participants;
drop type if exists participant_status;
drop type if exists participant_type;
