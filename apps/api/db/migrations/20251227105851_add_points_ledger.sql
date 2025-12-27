-- migrate:up
create table if not exists user_points_ledger (
                                                  id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    source text not null,      -- ex: "challenge", "badge", "manual"
    ref_id uuid,               -- optionnel (id du challenge, etc.)
    delta int not null,        -- +100, +50, etc.
    created_at timestamptz not null default now()
    );

create index if not exists idx_points_user_id_created_at
    on user_points_ledger(user_id, created_at desc);

-- migrate:down
drop table if exists user_points_ledger;
