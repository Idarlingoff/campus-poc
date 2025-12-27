-- migrate:up
create table if not exists teams (
                                     id uuid primary key default gen_random_uuid(),
    name text not null,
    created_by uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now()
    );

create table if not exists team_members (
                                            team_id uuid not null references teams(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role text not null default 'owner',
    joined_at timestamptz not null default now(),
    primary key (team_id, user_id)
    );

create index if not exists idx_team_members_user on team_members(user_id);

-- migrate:down
drop table if exists team_members;
drop table if exists teams;
