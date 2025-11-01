-- name: ListRoles :many
SELECT
    r.id,
    r.tenant_id,
    r.scope,
    r.code,
    r.name,
    r.description,
    r.metadata,
    r.created_at,
    r.updated_at,
    r.version,
    COALESCE(ra.assigned_count, 0)::bigint AS assigned_count
FROM roles r
LEFT JOIN (
    SELECT role_id, COUNT(*) AS assigned_count
    FROM role_assignments
    GROUP BY role_id
) ra ON ra.role_id = r.id
WHERE
    (sqlc.narg(scope_filter)::text IS NULL OR r.scope = sqlc.narg(scope_filter)::text)
    AND (
        sqlc.narg(tenant_filter)::uuid IS NULL
        OR r.tenant_id = sqlc.narg(tenant_filter)::uuid
    )
    AND (
        sqlc.narg(search)::text IS NULL
        OR r.code ILIKE '%' || sqlc.narg(search)::text || '%'
        OR r.name ILIKE '%' || sqlc.narg(search)::text || '%'
    )
ORDER BY r.created_at DESC
LIMIT COALESCE(sqlc.narg(limit_value)::int, 50)
OFFSET COALESCE(sqlc.narg(offset_value)::int, 0);

-- name: CountRoles :one
SELECT COUNT(*) AS total
FROM roles r
WHERE
    (sqlc.narg(scope_filter)::text IS NULL OR r.scope = sqlc.narg(scope_filter)::text)
    AND (
        sqlc.narg(tenant_filter)::uuid IS NULL
        OR r.tenant_id = sqlc.narg(tenant_filter)::uuid
    )
    AND (
        sqlc.narg(search)::text IS NULL
        OR r.code ILIKE '%' || sqlc.narg(search)::text || '%'
        OR r.name ILIKE '%' || sqlc.narg(search)::text || '%'
    );

-- name: GetRole :one
SELECT
    r.id,
    r.tenant_id,
    r.scope,
    r.code,
    r.name,
    r.description,
    r.metadata,
    r.created_at,
    r.updated_at,
    r.version,
    COALESCE(ra.assigned_count, 0)::bigint AS assigned_count
FROM roles r
LEFT JOIN (
    SELECT role_id, COUNT(*) AS assigned_count
    FROM role_assignments
    GROUP BY role_id
) ra ON ra.role_id = r.id
WHERE r.id = sqlc.arg(id);

-- name: CreateRole :one
INSERT INTO roles (
    id,
    tenant_id,
    scope,
    code,
    name,
    description,
    metadata
) VALUES (
    sqlc.arg(id),
    sqlc.narg(tenant_id),
    sqlc.arg(scope),
    sqlc.arg(code),
    sqlc.arg(name),
    sqlc.narg(description),
    COALESCE(sqlc.narg(metadata)::jsonb, '{}'::jsonb)
) RETURNING
    id,
    tenant_id,
    scope,
    code,
    name,
    description,
    metadata,
    created_at,
    updated_at,
    version;

-- name: UpdateRole :one
UPDATE roles
SET
    code = sqlc.arg(code),
    name = sqlc.arg(name),
    description = sqlc.narg(description),
    metadata = COALESCE(sqlc.narg(metadata)::jsonb, metadata),
    updated_at = NOW(),
    version = version + 1
WHERE id = sqlc.arg(id)
RETURNING
    id,
    tenant_id,
    scope,
    code,
    name,
    description,
    metadata,
    created_at,
    updated_at,
    version;

-- name: DeleteRole :exec
DELETE FROM roles
WHERE id = sqlc.arg(id);

-- name: ListRolePermissions :many
SELECT permission_code
FROM role_permissions
WHERE role_id = sqlc.arg(role_id)
ORDER BY permission_code ASC;

-- name: InsertRolePermission :exec
INSERT INTO role_permissions (role_id, permission_code)
VALUES (sqlc.arg(role_id), sqlc.arg(permission_code))
ON CONFLICT (role_id, permission_code) DO NOTHING;

-- name: DeleteRolePermissions :exec
DELETE FROM role_permissions
WHERE role_id = sqlc.arg(role_id);

-- name: ListRoleAssignments :many
SELECT
    ra.role_id,
    ra.identity_id,
    ra.tenant_id,
    ra.created_at
FROM role_assignments ra
WHERE ra.role_id = sqlc.arg(role_id)
ORDER BY ra.created_at DESC
LIMIT COALESCE(sqlc.narg(limit_value)::int, 50)
OFFSET COALESCE(sqlc.narg(offset_value)::int, 0);

-- name: CountRoleAssignments :one
SELECT COUNT(*) AS total
FROM role_assignments
WHERE role_id = sqlc.arg(role_id);

-- name: UpsertRoleAssignment :exec
INSERT INTO role_assignments (role_id, identity_id, tenant_id)
VALUES (sqlc.arg(role_id), sqlc.arg(identity_id), sqlc.narg(tenant_id))
ON CONFLICT (role_id, identity_id)
DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

-- name: DeleteRoleAssignment :exec
DELETE FROM role_assignments
WHERE role_id = sqlc.arg(role_id)
  AND identity_id = sqlc.arg(identity_id);
