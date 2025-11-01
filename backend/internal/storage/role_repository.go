package storage

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/laofa009/next-agent-portal/backend/internal/storage/sqldb"
)

// Role models an authorization role within either the platform or a tenant scope.
type Role struct {
	ID            uuid.UUID       `json:"id"`
	TenantID      *uuid.UUID      `json:"tenant_id,omitempty"`
	Scope         string          `json:"scope"`
	Code          string          `json:"code"`
	Name          string          `json:"name"`
	Description   *string         `json:"description,omitempty"`
	Metadata      json.RawMessage `json:"metadata"`
	Permissions   []string        `json:"permissions,omitempty"`
	AssignedCount int64           `json:"assigned_count"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	Version       int32           `json:"version"`
}

// RoleAssignment represents the relationship between an identity and a role.
type RoleAssignment struct {
	RoleID     uuid.UUID  `json:"role_id"`
	IdentityID uuid.UUID  `json:"identity_id"`
	TenantID   *uuid.UUID `json:"tenant_id,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

// ErrRoleNotFound indicates the requested role was not located.
var ErrRoleNotFound = errors.New("role not found")

// RoleListParams captures filters used when listing roles.
type RoleListParams struct {
	Scope    string
	TenantID *uuid.UUID
	Search   string
	Limit    int32
	Offset   int32
}

// RoleRepository provides helpers for managing roles and related metadata.
type RoleRepository struct {
	pool    *pgxpool.Pool
	queries *sqldb.Queries
}

// NewRoleRepository constructs a repository backed by sqlc queries.
func NewRoleRepository(pool *pgxpool.Pool, queries *sqldb.Queries) *RoleRepository {
	return &RoleRepository{
		pool:    pool,
		queries: queries,
	}
}

// ListRoles returns paginated roles together with the total count.
func (r *RoleRepository) ListRoles(ctx context.Context, params RoleListParams) ([]Role, int64, error) {
	var scopeArg *string
	if trimmed := strings.TrimSpace(params.Scope); trimmed != "" {
		scopeArg = stringPtr(trimmed)
	}

	var tenantArg pgtype.UUID
	if params.TenantID != nil {
		tenantArg = uuidToPg(*params.TenantID)
	}

	var searchArg *string
	if trimmed := strings.TrimSpace(params.Search); trimmed != "" {
		searchArg = stringPtr(trimmed)
	}

	var offsetArg *int32
	if params.Offset > 0 {
		offsetArg = int32Ptr(params.Offset)
	}

	var limitArg *int32
	if params.Limit > 0 {
		limitArg = int32Ptr(params.Limit)
	}

	rows, err := r.queries.ListRoles(ctx, sqldb.ListRolesParams{
		ScopeFilter:  scopeArg,
		TenantFilter: tenantArg,
		Search:       searchArg,
		OffsetValue:  offsetArg,
		LimitValue:   limitArg,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list roles: %w", err)
	}

	total, err := r.queries.CountRoles(ctx, sqldb.CountRolesParams{
		ScopeFilter:  scopeArg,
		TenantFilter: tenantArg,
		Search:       searchArg,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count roles: %w", err)
	}

	result := make([]Role, 0, len(rows))
	for _, row := range rows {
		role, err := mapRoleListRow(row)
		if err != nil {
			return nil, 0, err
		}
		result = append(result, role)
	}
	return result, total, nil
}

// GetRole retrieves a single role by ID along with its aggregate metadata.
func (r *RoleRepository) GetRole(ctx context.Context, id uuid.UUID) (Role, error) {
	row, err := r.queries.GetRole(ctx, uuidToPg(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Role{}, ErrRoleNotFound
		}
		return Role{}, fmt.Errorf("get role: %w", err)
	}

	role, err := mapRoleRow(row)
	if err != nil {
		return Role{}, err
	}

	perms, err := r.queries.ListRolePermissions(ctx, uuidToPg(role.ID))
	if err != nil {
		return Role{}, fmt.Errorf("list role permissions: %w", err)
	}
	role.Permissions = perms

	return role, nil
}

// CreateRole persists a new role together with its permission set.
func (r *RoleRepository) CreateRole(ctx context.Context, role Role) (Role, error) {
	if role.ID == uuid.Nil {
		role.ID = uuid.New()
	}
	if role.Metadata == nil {
		role.Metadata = json.RawMessage(`{}`)
	}

	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Role{}, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) // nolint:errcheck

	qtx := r.queries.WithTx(tx)
	result, err := qtx.CreateRole(ctx, sqldb.CreateRoleParams{
		ID:          uuidToPg(role.ID),
		TenantID:    uuidToNullablePg(role.TenantID),
		Scope:       strings.TrimSpace(role.Scope),
		Code:        strings.TrimSpace(role.Code),
		Name:        strings.TrimSpace(role.Name),
		Description: role.Description,
		Metadata:    defaultMetadata(role.Metadata),
	})
	if err != nil {
		return Role{}, fmt.Errorf("create role: %w", err)
	}

	if len(role.Permissions) > 0 {
		for _, perm := range role.Permissions {
			trimmed := strings.TrimSpace(perm)
			if trimmed == "" {
				continue
			}
			if err := qtx.InsertRolePermission(ctx, sqldb.InsertRolePermissionParams{
				RoleID:         uuidToPg(role.ID),
				PermissionCode: trimmed,
			}); err != nil {
				return Role{}, fmt.Errorf("insert role permission: %w", err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return Role{}, fmt.Errorf("commit role tx: %w", err)
	}

	created, err := mapRole(result)
	if err != nil {
		return Role{}, err
	}
	created.Permissions = append([]string(nil), role.Permissions...)
	return created, nil
}

// UpdateRole updates the main role fields and optionally replaces the permission set.
func (r *RoleRepository) UpdateRole(ctx context.Context, role Role, replacePermissions bool) (Role, error) {
	if role.Metadata == nil {
		role.Metadata = json.RawMessage(`{}`)
	}

	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Role{}, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) // nolint:errcheck

	qtx := r.queries.WithTx(tx)
	result, err := qtx.UpdateRole(ctx, sqldb.UpdateRoleParams{
		Code:        strings.TrimSpace(role.Code),
		Name:        strings.TrimSpace(role.Name),
		Description: role.Description,
		Metadata:    metadataOrNil(role.Metadata),
		ID:          uuidToPg(role.ID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Role{}, ErrRoleNotFound
		}
		return Role{}, fmt.Errorf("update role: %w", err)
	}

	if replacePermissions {
		if err := qtx.DeleteRolePermissions(ctx, uuidToPg(role.ID)); err != nil {
			return Role{}, fmt.Errorf("delete role permissions: %w", err)
		}
		for _, perm := range role.Permissions {
			trimmed := strings.TrimSpace(perm)
			if trimmed == "" {
				continue
			}
			if err := qtx.InsertRolePermission(ctx, sqldb.InsertRolePermissionParams{
				RoleID:         uuidToPg(role.ID),
				PermissionCode: trimmed,
			}); err != nil {
				return Role{}, fmt.Errorf("insert role permission: %w", err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return Role{}, fmt.Errorf("commit role update: %w", err)
	}

	updated, err := mapRole(result)
	if err != nil {
		return Role{}, err
	}
	if replacePermissions {
		updated.Permissions = append([]string(nil), role.Permissions...)
	} else {
		perms, err := r.queries.ListRolePermissions(ctx, uuidToPg(role.ID))
		if err != nil {
			return Role{}, fmt.Errorf("list role permissions: %w", err)
		}
		updated.Permissions = perms
	}
	return updated, nil
}

// DeleteRole removes a role and its associated permissions/assignments.
func (r *RoleRepository) DeleteRole(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteRole(ctx, uuidToPg(id)); err != nil {
		return fmt.Errorf("delete role: %w", err)
	}
	return nil
}

// ListPermissions returns the permissions for a single role.
func (r *RoleRepository) ListPermissions(ctx context.Context, id uuid.UUID) ([]string, error) {
	perms, err := r.queries.ListRolePermissions(ctx, uuidToPg(id))
	if err != nil {
		return nil, fmt.Errorf("list role permissions: %w", err)
	}
	return perms, nil
}

// ListAssignments returns paginated assignments for a role.
func (r *RoleRepository) ListAssignments(ctx context.Context, roleID uuid.UUID, limit, offset int32) ([]RoleAssignment, int64, error) {
	var offsetArg *int32
	if offset > 0 {
		offsetArg = int32Ptr(offset)
	}

	var limitArg *int32
	if limit > 0 {
		limitArg = int32Ptr(limit)
	}

	rows, err := r.queries.ListRoleAssignments(ctx, sqldb.ListRoleAssignmentsParams{
		RoleID:      uuidToPg(roleID),
		OffsetValue: offsetArg,
		LimitValue:  limitArg,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list role assignments: %w", err)
	}

	total, err := r.queries.CountRoleAssignments(ctx, uuidToPg(roleID))
	if err != nil {
		return nil, 0, fmt.Errorf("count role assignments: %w", err)
	}

	result := make([]RoleAssignment, 0, len(rows))
	for _, row := range rows {
		roleIDVal, _, err := pgUUIDToUUID(row.RoleID)
		if err != nil {
			return nil, 0, fmt.Errorf("parse role id: %w", err)
		}
		identityID, _, err := pgUUIDToUUID(row.IdentityID)
		if err != nil {
			return nil, 0, fmt.Errorf("parse identity id: %w", err)
		}
		var tenantID *uuid.UUID
		if tenantUUID, ok, err := pgUUIDToUUID(row.TenantID); err != nil {
			return nil, 0, fmt.Errorf("parse tenant id: %w", err)
		} else if ok {
			tenantID = &tenantUUID
		}
		result = append(result, RoleAssignment{
			RoleID:     roleIDVal,
			IdentityID: identityID,
			TenantID:   tenantID,
			CreatedAt:  row.CreatedAt.Time,
		})
	}

	return result, total, nil
}

// UpsertAssignment associates an identity with a role.
func (r *RoleRepository) UpsertAssignment(ctx context.Context, roleID, identityID uuid.UUID, tenantID *uuid.UUID) error {
	if err := r.queries.UpsertRoleAssignment(ctx, sqldb.UpsertRoleAssignmentParams{
		RoleID:     uuidToPg(roleID),
		IdentityID: uuidToPg(identityID),
		TenantID:   uuidToNullablePg(tenantID),
	}); err != nil {
		return fmt.Errorf("upsert role assignment: %w", err)
	}
	return nil
}

// DeleteAssignment removes an identity from the role.
func (r *RoleRepository) DeleteAssignment(ctx context.Context, roleID, identityID uuid.UUID) error {
	if err := r.queries.DeleteRoleAssignment(ctx, sqldb.DeleteRoleAssignmentParams{
		RoleID:     uuidToPg(roleID),
		IdentityID: uuidToPg(identityID),
	}); err != nil {
		return fmt.Errorf("delete role assignment: %w", err)
	}
	return nil
}

func mapRoleListRow(row sqldb.ListRolesRow) (Role, error) {
	var tenantID *uuid.UUID
	if id, ok, err := pgUUIDToUUID(row.TenantID); err != nil {
		return Role{}, fmt.Errorf("parse tenant id: %w", err)
	} else if ok {
		tenantID = &id
	}

	roleID, ok, err := pgUUIDToUUID(row.ID)
	if err != nil {
		return Role{}, fmt.Errorf("parse role id: %w", err)
	}
	if !ok {
		return Role{}, fmt.Errorf("role id invalid")
	}

	return Role{
		ID:            roleID,
		TenantID:      tenantID,
		Scope:         row.Scope,
		Code:          row.Code,
		Name:          row.Name,
		Description:   row.Description,
		Metadata:      normalizeMetadata(row.Metadata),
		AssignedCount: row.AssignedCount,
		CreatedAt:     row.CreatedAt.Time,
		UpdatedAt:     row.UpdatedAt.Time,
		Version:       row.Version,
	}, nil
}

func mapRole(row sqldb.Role) (Role, error) {
	var tenantID *uuid.UUID
	if id, ok, err := pgUUIDToUUID(row.TenantID); err != nil {
		return Role{}, fmt.Errorf("parse tenant id: %w", err)
	} else if ok {
		tenantID = &id
	}

	roleID, ok, err := pgUUIDToUUID(row.ID)
	if err != nil {
		return Role{}, fmt.Errorf("parse role id: %w", err)
	}
	if !ok {
		return Role{}, fmt.Errorf("role id invalid")
	}

	return Role{
		ID:          roleID,
		TenantID:    tenantID,
		Scope:       row.Scope,
		Code:        row.Code,
		Name:        row.Name,
		Description: row.Description,
		Metadata:    normalizeMetadata(row.Metadata),
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
		Version:     row.Version,
	}, nil
}

func mapRoleRow(row sqldb.GetRoleRow) (Role, error) {
	var tenantID *uuid.UUID
	if id, ok, err := pgUUIDToUUID(row.TenantID); err != nil {
		return Role{}, fmt.Errorf("parse tenant id: %w", err)
	} else if ok {
		tenantID = &id
	}

	roleID, ok, err := pgUUIDToUUID(row.ID)
	if err != nil {
		return Role{}, fmt.Errorf("parse role id: %w", err)
	}
	if !ok {
		return Role{}, fmt.Errorf("role id invalid")
	}

	return Role{
		ID:            roleID,
		TenantID:      tenantID,
		Scope:         row.Scope,
		Code:          row.Code,
		Name:          row.Name,
		Description:   row.Description,
		Metadata:      normalizeMetadata(row.Metadata),
		AssignedCount: row.AssignedCount,
		CreatedAt:     row.CreatedAt.Time,
		UpdatedAt:     row.UpdatedAt.Time,
		Version:       row.Version,
	}, nil
}

func normalizeMetadata(data []byte) json.RawMessage {
	if len(data) == 0 {
		return json.RawMessage(`{}`)
	}
	return json.RawMessage(data)
}
