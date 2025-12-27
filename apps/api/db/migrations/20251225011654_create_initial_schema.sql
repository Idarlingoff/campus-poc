-- migrate:up
create extension if not exists pgcrypto;

create table if not exists roles (
                                     id uuid primary key default gen_random_uuid(),
    code text unique not null,
    label text not null,
    created_at timestamptz not null default now()
    );

create table if not exists permissions (
                                           id uuid primary key default gen_random_uuid(),
    key text unique not null,
    description text,
    created_at timestamptz not null default now()
    );

create table if not exists role_permissions (
                                                role_id uuid not null references roles(id) on delete cascade,
    permission_id uuid not null references permissions(id) on delete cascade,
    primary key(role_id, permission_id)
    );

create table if not exists users (
                                     id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password_hash text,
    display_name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create table if not exists user_roles (
                                          user_id uuid not null references users(id) on delete cascade,
    role_id uuid not null references roles(id) on delete cascade,
    primary key(user_id, role_id)
    );

create index if not exists idx_user_roles_user on user_roles(user_id);
create index if not exists idx_role_permissions_role on role_permissions(role_id);

-- migrate:down
drop table if exists user_roles;
drop table if exists users;
drop table if exists role_permissions;
drop table if exists permissions;
drop table if exists roles;
