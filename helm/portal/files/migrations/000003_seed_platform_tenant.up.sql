INSERT INTO tenants (id, code, name, status, metadata)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'platform',
    '平台内部组织',
    'active',
    '{"internal": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
