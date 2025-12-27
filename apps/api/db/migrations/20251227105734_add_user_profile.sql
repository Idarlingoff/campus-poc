-- migrate:up
create table if not exists user_profile (
                                            user_id uuid primary key references users(id) on delete cascade,
    bio text,
    city text,
    school_line text,
    since_date date,
    avatar_text text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists idx_user_profile_user_id on user_profile(user_id);

-- migrate:down
drop table if exists user_profile;
