-- migrate:up
create table if not exists user_activity (
                                             id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    icon text,
    title text not null,
    meta text,
    points int,
    created_at timestamptz not null default now()
    );

create index if not exists idx_user_activity_user_id_created_at
    on user_activity(user_id, created_at desc);

-- migrate:down
drop table if exists user_activity;
