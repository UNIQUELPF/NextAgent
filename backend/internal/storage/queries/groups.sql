-- name: ListTenantGroups :many
SELECT
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata,
    created_at,
    updated_at
FROM tenant_groups
WHERE tenant_id = sqlc.arg(tenant_id)
ORDER BY sort_order ASC, name ASC;

-- name: ListAllGroups :many
SELECT
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata,
    created_at,
    updated_at
FROM tenant_groups
ORDER BY tenant_id, sort_order ASC, name ASC;

-- name: GetTenantGroup :one
SELECT
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata,
    created_at,
    updated_at
FROM tenant_groups
WHERE id = sqlc.arg(id);

-- name: CreateTenantGroup :one
INSERT INTO tenant_groups (
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata
) VALUES (
    sqlc.arg(id),
    sqlc.arg(tenant_id),
    sqlc.arg(code),
    sqlc.arg(name),
    sqlc.arg(description),
    sqlc.arg(parent_id),
    COALESCE(sqlc.arg(sort_order)::int, 0),
    COALESCE(sqlc.arg(metadata)::jsonb, '{}'::jsonb)
)
RETURNING
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata,
    created_at,
    updated_at;

-- name: UpdateTenantGroup :one
UPDATE tenant_groups
SET
    code = sqlc.arg(code),
    name = sqlc.arg(name),
    description = sqlc.arg(description),
    parent_id = sqlc.arg(parent_id),
    sort_order = COALESCE(sqlc.arg(sort_order)::int, sort_order),
    metadata = COALESCE(sqlc.arg(metadata)::jsonb, metadata),
    updated_at = NOW()
WHERE id = sqlc.arg(id)
RETURNING
    id,
    tenant_id,
    code,
    name,
    description,
    parent_id,
    sort_order,
    metadata,
    created_at,
    updated_at;

-- name: DeleteTenantGroup :exec
DELETE FROM tenant_groups
WHERE id = sqlc.arg(id);

-- name: CountChildGroups :one
SELECT COUNT(*)
FROM tenant_groups
WHERE parent_id = sqlc.arg(parent_id);

-- name: CountMembersInGroup :one
SELECT COUNT(*)
FROM group_members
WHERE group_id = sqlc.arg(group_id);

-- name: ListMemberCountsForTenant :many
SELECT
    group_id,
    COUNT(*) AS member_count
FROM group_members
WHERE tenant_id = sqlc.arg(tenant_id)
GROUP BY group_id;

-- name: ListMemberCounts :many
SELECT
    group_id,
    COUNT(*) AS member_count
FROM group_members
GROUP BY group_id;

-- name: ListGroupMembers :many
SELECT
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary,
    created_at,
    updated_at
FROM group_members
WHERE group_id = sqlc.arg(group_id)
  AND (
      sqlc.narg(search)::text IS NULL
      OR display_name ILIKE '%' || sqlc.narg(search)::text || '%'
      OR phone ILIKE '%' || sqlc.narg(search)::text || '%'
  )
ORDER BY created_at DESC
LIMIT COALESCE(sqlc.narg(limit_value)::int, 50)
OFFSET COALESCE(sqlc.narg(offset_value)::int, 0);

-- name: CountGroupMembersWithSearch :one
SELECT COUNT(*)
FROM group_members
WHERE group_id = sqlc.arg(group_id)
  AND (
      sqlc.narg(search)::text IS NULL
      OR display_name ILIKE '%' || sqlc.narg(search)::text || '%'
      OR phone ILIKE '%' || sqlc.narg(search)::text || '%'
  );

-- name: CreateGroupMember :one
INSERT INTO group_members (
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary
) VALUES (
    sqlc.arg(group_id),
    sqlc.arg(identity_id),
    sqlc.arg(tenant_id),
    sqlc.arg(display_name),
    sqlc.arg(phone),
    sqlc.arg(title),
    COALESCE(sqlc.arg(is_primary)::boolean, FALSE)
)
ON CONFLICT (group_id, identity_id) DO UPDATE
SET
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    title = EXCLUDED.title,
    is_primary = EXCLUDED.is_primary,
    updated_at = NOW()
RETURNING
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary,
    created_at,
    updated_at;

-- name: UpdateGroupMember :one
UPDATE group_members
SET
    display_name = sqlc.arg(display_name),
    phone = sqlc.arg(phone),
    title = sqlc.arg(title),
    is_primary = COALESCE(sqlc.arg(is_primary)::boolean, is_primary),
    updated_at = NOW()
WHERE group_id = sqlc.arg(group_id)
  AND identity_id = sqlc.arg(identity_id)
RETURNING
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary,
    created_at,
    updated_at;

-- name: MoveGroupMember :one
UPDATE group_members
SET
    group_id = sqlc.arg(new_group_id),
    tenant_id = sqlc.arg(tenant_id),
    updated_at = NOW()
WHERE group_id = sqlc.arg(group_id)
  AND identity_id = sqlc.arg(identity_id)
RETURNING
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary,
    created_at,
    updated_at;

-- name: DeleteGroupMember :exec
DELETE FROM group_members
WHERE group_id = sqlc.arg(group_id)
  AND identity_id = sqlc.arg(identity_id);

-- name: ListGroupsForIdentity :many
SELECT
    group_id,
    identity_id,
    tenant_id,
    display_name,
    phone,
    title,
    is_primary,
    created_at,
    updated_at
FROM group_members
WHERE tenant_id = sqlc.arg(tenant_id)
  AND identity_id = sqlc.arg(identity_id);
