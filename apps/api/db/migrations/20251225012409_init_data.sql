-- migrate:up
-- Roles
insert into roles(code,label) values
                                  ('guest','Invité'),
                                  ('student','Étudiant'),
                                  ('staff','Intervenant / Équipe pédagogique'),
                                  ('bde','BDE / Campus'),
                                  ('external','Visiteur (externe)')
    on conflict do nothing;

-- Permissions (toutes les combinaisons)
insert into permissions(key, description) values
                                              ('publications:create','Créer une publication'),
                                              ('publications:read','Lire les publications'),
                                              ('publications:update','Modifier ses publications'),
                                              ('publications:delete','Supprimer ses publications'),
                                              ('publications:moderate','Modérer les publications'),

                                              ('challenges:create','Créer un défi'),
                                              ('challenges:read','Lire les défis'),
                                              ('challenges:update','Modifier ses défis'),
                                              ('challenges:delete','Supprimer ses défis'),
                                              ('challenges:participate','Participer aux défis'),
                                              ('challenges:moderate','Modérer les défis'),

                                              ('resources:create','Créer une ressource'),
                                              ('resources:read','Lire les ressources'),
                                              ('resources:update','Modifier ses ressources'),
                                              ('resources:delete','Supprimer ses ressources'),
                                              ('resources:moderate','Modérer les ressources'),

                                              ('places:create','Créer un lieu'),
                                              ('places:read','Lire les lieux'),
                                              ('places:update','Modifier ses lieux'),
                                              ('places:delete','Supprimer ses lieux'),
                                              ('places:moderate','Modérer les lieux'),

                                              ('chat:create','Créer un message'),
                                              ('chat:read','Lire le chat'),
                                              ('chat:update','Modifier ses messages'),
                                              ('chat:delete','Supprimer ses messages'),
                                              ('chat:moderate','Modérer le chat')
    on conflict do nothing;

-- Helper: map role -> list of permission keys
-- 1) guest: publications R, places R (selon ta matrice)
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r join permissions p on p.key in ('publications:read','places:read')
where r.code = 'guest'
    on conflict do nothing;

-- 2) external: publications R, challenges R, resources R, places R
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r join permissions p on p.key in ('publications:read','challenges:read','resources:read','places:read')
where r.code = 'external'
    on conflict do nothing;

-- 3) student: publications CRUD, challenges R + participate, resources C/R, places C/R
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r join permissions p on p.key in (
                                             'publications:create','publications:read','publications:update','publications:delete',
                                             'challenges:read','challenges:participate',
                                             'resources:create','resources:read',
                                             'places:create','places:read'
    )
where r.code = 'student'
    on conflict do nothing;

-- 4) bde: publications C/R/U, challenges C/R/U/D/participate (ajuste si besoin)
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r join permissions p on p.key in (
                                             'publications:create','publications:read','publications:update',
                                             'challenges:create','challenges:read','challenges:update','challenges:delete','challenges:participate'
    )
where r.code = 'bde'
    on conflict do nothing;

-- 5) staff: full rights (incluant moderate)
insert into role_permissions(role_id, permission_id)
select r.id, p.id
from roles r
         join permissions p on p.key in (
                                         'publications:create','publications:read','publications:update','publications:delete','publications:moderate',
                                         'challenges:create','challenges:read','challenges:update','challenges:delete','challenges:participate','challenges:moderate',
                                         'resources:create','resources:read','resources:update','resources:delete','resources:moderate',
                                         'places:create','places:read','places:update','places:delete','places:moderate',
                                         'chat:create','chat:read','chat:update','chat:delete','chat:moderate'
    )
where r.code = 'staff'
    on conflict do nothing;

-- migrate:down
