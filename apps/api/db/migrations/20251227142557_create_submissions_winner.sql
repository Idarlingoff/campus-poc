-- migrate:up
create table if not exists challenge_submissions (
                                                     id uuid primary key default gen_random_uuid(),
    challenge_id uuid not null references challenges(id) on delete cascade,
    participant_type participant_type not null,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    content text,
    attachments jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
    );

alter table challenge_submissions
    add constraint chk_submission_one
        check (
            (participant_type='USER' and user_id is not null and team_id is null) or
            (participant_type='TEAM' and team_id is not null and user_id is null)
            );

-- MVP: 1 soumission max par participant
create unique index if not exists uq_submission_user
    on challenge_submissions(challenge_id, user_id) where user_id is not null;

create unique index if not exists uq_submission_team
    on challenge_submissions(challenge_id, team_id) where team_id is not null;

create table if not exists challenge_winners (
    challenge_id uuid not null references challenges(id) on delete cascade,
    rank int not null,
    participant_type participant_type not null,
    user_id uuid references users(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    decided_by uuid not null references users(id) on delete set null,
    decided_at timestamptz not null default now(),
    primary key (challenge_id, rank)
    );

alter table challenge_winners
    add constraint chk_winner_one
        check (
            (participant_type='USER' and user_id is not null and team_id is null) or
            (participant_type='TEAM' and team_id is not null and user_id is null)
            );

create unique index if not exists uq_winner_user
    on challenge_winners(challenge_id, user_id) where user_id is not null;

create unique index if not exists uq_winner_team
    on challenge_winners(challenge_id, team_id) where team_id is not null;

-- migrate:down
drop table if exists challenge_winners;
drop table if exists challenge_submissions;
