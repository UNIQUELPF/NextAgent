-- name: ListTenants :many
SELECT
    id,
    code,
    name,
    status,
    contact_name,
    contact_phone,
    metadata,
    created_at,
    updated_at
FROM tenants
WHERE (
    sqlc.narg(search)::text IS NULL
    OR name ILIKE '%' || sqlc.narg(search)::text || '%'
    OR code ILIKE '%' || sqlc.narg(search)::text || '%'
)
AND (
    sqlc.narg(status_filter)::text IS NULL
    OR status = sqlc.narg(status_filter)::text
)
ORDER BY created_at DESC
LIMIT sqlc.narg(limit_value) OFFSET sqlc.narg(offset_value);

-- name: CountTenants :one
SELECT COUNT(*)
FROM tenants
WHERE (
    sqlc.narg(search)::text IS NULL
    OR name ILIKE '%' || sqlc.narg(search)::text || '%'
    OR code ILIKE '%' || sqlc.narg(search)::text || '%'
)
AND (
    sqlc.narg(status_filter)::text IS NULL
    OR status = sqlc.narg(status_filter)::text
);

-- name: GetTenant :one
SELECT
    id,
    code,
    name,
    status,
    contact_name,
    contact_phone,
    metadata,
    created_at,
    updated_at
FROM tenants
WHERE id = $1;

-- name: CreateTenant :one
INSERT INTO tenants (
    id,
    code,
    name,
    status,
    contact_name,
    contact_phone,
    metadata
) VALUES (
    $1,
    $2,
    $3,
    COALESCE($4, 'active'),
    $5,
    $6,
    COALESCE($7, '{}'::jsonb)
)
RETURNING
    id,
    code,
    name,
    status,
    contact_name,
    contact_phone,
    metadata,
    created_at,
    updated_at;

-- name: UpdateTenant :one
UPDATE tenants
SET
    code = $2,
    name = $3,
    status = $4,
    contact_name = $5,
    contact_phone = $6,
    metadata = COALESCE($7, metadata),
    updated_at = NOW()
WHERE id = $1
RETURNING
    id,
    code,
    name,
    status,
    contact_name,
    contact_phone,
    metadata,
    created_at,
    updated_at;

-- name: DeleteTenant :exec
DELETE FROM tenants WHERE id = $1;
