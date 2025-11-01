package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/laofa009/next-agent-portal/backend/internal/storage/sqldb"
)

// Permission describes an available granular action that can be assigned to roles.
type Permission struct {
	Code        string    `json:"code"`
	Scope       string    `json:"scope"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PermissionRepository exposes read helpers for the permissions catalog.
type PermissionRepository struct {
	queries *sqldb.Queries
}

// NewPermissionRepository constructs a repository backed by sqlc queries.
func NewPermissionRepository(queries *sqldb.Queries) *PermissionRepository {
	return &PermissionRepository{queries: queries}
}

// ListPermissions returns all permission definitions.
func (r *PermissionRepository) ListPermissions(ctx context.Context) ([]Permission, error) {
	rows, err := r.queries.ListPermissions(ctx)
	if err != nil {
		return nil, fmt.Errorf("list permissions: %w", err)
	}

	perms := make([]Permission, 0, len(rows))
	for _, row := range rows {
		perms = append(perms, Permission{
			Code:        row.Code,
			Scope:       row.Scope,
			Description: row.Description,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
		})
	}
	return perms, nil
}
