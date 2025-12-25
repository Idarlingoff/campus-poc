-- migrate:up
insert into permissions(key, description)
values ('roles:assign', 'Assigner des rôles utilisateurs')
    on conflict do nothing;

insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r join permissions p on p.key='roles:assign'
where r.code='staff'
    on conflict do nothing;

-- migrate:down
-- (optional)
