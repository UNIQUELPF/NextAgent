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

	"github.com/laofa009/next-agent-portal/backend/internal/storage/sqldb"
)

// Tenant represents the tenant entity exposed to callers.
type Tenant struct {
	ID           uuid.UUID       `json:"id"`
	Code         string          `json:"code"`
	Name         string          `json:"name"`
	Status       string          `json:"status"`
	ContactName  *string         `json:"contact_name,omitempty"`
	ContactPhone *string         `json:"contact_phone,omitempty"`
	Metadata     json.RawMessage `json:"metadata"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

// ErrTenantNotFound is returned when a tenant cannot be located.
var ErrTenantNotFound = errors.New("tenant not found")

// TenantRepository provides data access backed by sqlc generated queries.
type TenantRepository struct {
	queries *sqldb.Queries
}

// NewTenantRepository builds a repository using sqlc queries.
func NewTenantRepository(queries *sqldb.Queries) *TenantRepository {
	return &TenantRepository{queries: queries}
}

// ListTenants retrieves paginated tenants with optional search and status filters.
func (r *TenantRepository) ListTenants(ctx context.Context, search string, status string, limit, offset int32) ([]Tenant, int64, error) {
	var searchArg *string
	if trimmed := strings.TrimSpace(search); trimmed != "" {
		searchArg = stringPtr(trimmed)
	}

	var statusArg *string
	if trimmed := strings.ToLower(strings.TrimSpace(status)); trimmed != "" {
		statusArg = stringPtr(trimmed)
	}

	items, err := r.queries.ListTenants(ctx, sqldb.ListTenantsParams{
		Search:       searchArg,
		StatusFilter: statusArg,
		OffsetValue:  int32Ptr(offset),
		LimitValue:   int32Ptr(limit),
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list tenants: %w", err)
	}

	total, err := r.queries.CountTenants(ctx, sqldb.CountTenantsParams{
		Search:       searchArg,
		StatusFilter: statusArg,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count tenants: %w", err)
	}

	result := make([]Tenant, 0, len(items))
	for _, row := range items {
		tenant, err := mapTenantRow(row)
		if err != nil {
			return nil, 0, err
		}
		result = append(result, tenant)
	}

	return result, total, nil
}

// CreateTenant persists a new tenant record.
func (r *TenantRepository) CreateTenant(ctx context.Context, tenant Tenant) (Tenant, error) {
	if tenant.ID == uuid.Nil {
		tenant.ID = uuid.New()
	}
	if len(tenant.Metadata) == 0 {
		tenant.Metadata = json.RawMessage(`{}`)
	}

	result, err := r.queries.CreateTenant(ctx, sqldb.CreateTenantParams{
		ID:           uuidToPg(tenant.ID),
		Code:         tenant.Code,
		Name:         tenant.Name,
		Column4:      statusOrNil(tenant.Status),
		ContactName:  tenant.ContactName,
		ContactPhone: tenant.ContactPhone,
		Column7:      metadataOrNil(tenant.Metadata),
	})
	if err != nil {
		return Tenant{}, fmt.Errorf("create tenant: %w", err)
	}

	return mapTenantRow(result)
}

// GetTenant fetches a tenant by ID.
func (r *TenantRepository) GetTenant(ctx context.Context, id uuid.UUID) (Tenant, error) {
	result, err := r.queries.GetTenant(ctx, uuidToPg(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Tenant{}, ErrTenantNotFound
		}
		return Tenant{}, fmt.Errorf("get tenant: %w", err)
	}
	return mapTenantRow(result)
}

// UpdateTenant updates an existing tenant.
func (r *TenantRepository) UpdateTenant(ctx context.Context, tenant Tenant) (Tenant, error) {
	var metadataArg []byte
	if tenant.Metadata != nil {
		if len(tenant.Metadata) == 0 {
			metadataArg = []byte("{}")
		} else {
			metadataArg = tenant.Metadata
		}
	}

	result, err := r.queries.UpdateTenant(ctx, sqldb.UpdateTenantParams{
		ID:           uuidToPg(tenant.ID),
		Code:         tenant.Code,
		Name:         tenant.Name,
		Status:       tenant.Status,
		ContactName:  tenant.ContactName,
		ContactPhone: tenant.ContactPhone,
		Metadata:     metadataArg,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Tenant{}, ErrTenantNotFound
		}
		return Tenant{}, fmt.Errorf("update tenant: %w", err)
	}
	return mapTenantRow(result)
}

// DeleteTenant removes a tenant.
func (r *TenantRepository) DeleteTenant(ctx context.Context, id uuid.UUID) error {
	if err := r.queries.DeleteTenant(ctx, uuidToPg(id)); err != nil {
		return fmt.Errorf("delete tenant: %w", err)
	}
	return nil
}

func mapTenantRow(row sqldb.Tenant) (Tenant, error) {
	if !row.ID.Valid {
		return Tenant{}, fmt.Errorf("tenant id is null")
	}
	uuidVal, err := uuid.FromBytes(row.ID.Bytes[:])
	if err != nil {
		return Tenant{}, fmt.Errorf("parse tenant id: %w", err)
	}

	created := row.CreatedAt.Time
	updated := row.UpdatedAt.Time

	metadata := json.RawMessage(`{}`)
	if len(row.Metadata) > 0 {
		metadata = json.RawMessage(row.Metadata)
	}

	return Tenant{
		ID:           uuidVal,
		Code:         row.Code,
		Name:         row.Name,
		Status:       row.Status,
		ContactName:  row.ContactName,
		ContactPhone: row.ContactPhone,
		Metadata:     metadata,
		CreatedAt:    created,
		UpdatedAt:    updated,
	}, nil
}

func statusOrNil(status string) any {
	status = strings.TrimSpace(status)
	if status == "" {
		return nil
	}
	return status
}
