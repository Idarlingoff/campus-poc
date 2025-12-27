-- migrate:up
create table if not exists badges (
                                      id uuid primary key default gen_random_uuid(),
    code text not null unique,
    title text not null,
    description text not null,
    icon text not null,
    created_at timestamptz not null default now()
    );

create table if not exists user_badges (
                                           user_id uuid not null references users(id) on delete cascade,
    badge_id uuid not null references badges(id) on delete cascade,
    unlocked_at timestamptz not null default now(),
    primary key (user_id, badge_id)
    );

create index if not exists idx_user_badges_user_id on user_badges(user_id);

-- migrate:down
drop table if exists user_badges;
drop table if exists badges;
