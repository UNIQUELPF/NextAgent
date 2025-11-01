-- name: ListPermissions :many
SELECT
    code,
    scope,
    description,
    created_at,
    updated_at
FROM permissions
ORDER BY scope, code;
