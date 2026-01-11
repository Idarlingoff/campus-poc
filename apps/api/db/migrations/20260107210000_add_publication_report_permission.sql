-- migrate:up
INSERT INTO permissions(key, description)
VALUES ('publication:report', 'Signaler une publication')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.key = 'publication:report'
  AND r.code IN ('student', 'staff', 'bde', 'external')
ON CONFLICT DO NOTHING;

-- migrate:down
DELETE FROM role_permissions
WHERE permission_id = (SELECT id FROM permissions WHERE key = 'publication:report');

DELETE FROM permissions WHERE key = 'publication:report';

