-- migrate:up
-- user follow graph
create table if not exists user_follows (
                                            follower_user_id uuid not null references users(id) on delete cascade,
    followed_user_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (follower_user_id, followed_user_id),
    constraint chk_user_follows_no_self_follow check (follower_user_id <> followed_user_id)
    );

create index if not exists idx_user_follows_follower on user_follows(follower_user_id);
create index if not exists idx_user_follows_followed on user_follows(followed_user_id);
create index if not exists idx_user_follows_created_at on user_follows(created_at desc);


-- migrate:down
drop table if exists user_follows;

