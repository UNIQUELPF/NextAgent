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

// Group represents an organizational node belonging to a tenant.
type Group struct {
	ID          uuid.UUID       `json:"id"`
	TenantID    uuid.UUID       `json:"tenant_id"`
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	ParentID    *uuid.UUID      `json:"parent_id,omitempty"`
	SortOrder   int32           `json:"sort_order"`
	MemberCount int64           `json:"member_count"`
	Metadata    json.RawMessage `json:"metadata"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// GroupMember captures the relationship between an identity and a group.
type GroupMember struct {
	GroupID     uuid.UUID `json:"group_id"`
	IdentityID  uuid.UUID `json:"identity_id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	DisplayName string    `json:"display_name"`
	Phone       string    `json:"phone"`
	Title       *string   `json:"title,omitempty"`
	IsPrimary   bool      `json:"is_primary"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

var (
	// ErrGroupNotFound indicates the requested group does not exist.
	ErrGroupNotFound = errors.New("group not found")
	// ErrGroupHasChildren prevents deleting groups that still have child nodes.
	ErrGroupHasChildren = errors.New("group still has child groups")
	// ErrGroupHasMembers prevents deleting groups that still have members.
	ErrGroupHasMembers = errors.New("group still has members")
)

// GroupRepository exposes data-access helpers for groups and memberships.
type GroupRepository struct {
	queries *sqldb.Queries
}

// NewGroupRepository constructs a repository using sqlc generated queries.
func NewGroupRepository(queries *sqldb.Queries) *GroupRepository {
	return &GroupRepository{queries: queries}
}

// ListGroups returns groups either for a specific tenant or across all tenants when tenantID is nil.
func (r *GroupRepository) ListGroups(ctx context.Context, tenantID *uuid.UUID) ([]Group, error) {
	memberCounts := make(map[uuid.UUID]int64)

	var rows []sqldb.TenantGroup

	if tenantID == nil {
		countRows, err := r.queries.ListMemberCounts(ctx)
		if err != nil {
			return nil, fmt.Errorf("list member counts: %w", err)
		}
		for _, row := range countRows {
			groupID, err := uuid.FromBytes(row.GroupID.Bytes[:])
			if err != nil {
				return nil, fmt.Errorf("parse group id for count: %w", err)
			}
			memberCounts[groupID] = row.MemberCount
		}

		allRows, err := r.queries.ListAllGroups(ctx)
		if err != nil {
			return nil, fmt.Errorf("list all groups: %w", err)
		}
		rows = allRows
	} else {
		countRows, err := r.queries.ListMemberCountsForTenant(ctx, uuidToPg(*tenantID))
		if err != nil {
			return nil, fmt.Errorf("list member counts: %w", err)
		}
		for _, row := range countRows {
			groupID, err := uuid.FromBytes(row.GroupID.Bytes[:])
			if err != nil {
				return nil, fmt.Errorf("parse group id for count: %w", err)
			}
			memberCounts[groupID] = row.MemberCount
		}

		tenantRows, err := r.queries.ListTenantGroups(ctx, uuidToPg(*tenantID))
		if err != nil {
			return nil, fmt.Errorf("list tenant groups: %w", err)
		}
		rows = tenantRows
	}

	groups := make([]Group, 0, len(rows))
	for _, row := range rows {
		group, err := mapGroupRow(row)
		if err != nil {
			return nil, err
		}
		if count, ok := memberCounts[group.ID]; ok {
			group.MemberCount = count
		}
		groups = append(groups, group)
	}
	return groups, nil
}

// GetGroup fetches a group by ID.
func (r *GroupRepository) GetGroup(ctx context.Context, id uuid.UUID) (Group, error) {
	row, err := r.queries.GetTenantGroup(ctx, uuidToPg(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Group{}, ErrGroupNotFound
		}
		return Group{}, fmt.Errorf("get group: %w", err)
	}
	return mapGroupRow(row)
}

// CreateGroup inserts a new group.
func (r *GroupRepository) CreateGroup(ctx context.Context, group Group) (Group, error) {
	if group.ID == uuid.Nil {
		group.ID = uuid.New()
	}

	metadata := defaultMetadata(group.Metadata)

	result, err := r.queries.CreateTenantGroup(ctx, sqldb.CreateTenantGroupParams{
		ID:          uuidToPg(group.ID),
		TenantID:    uuidToPg(group.TenantID),
		Code:        strings.TrimSpace(group.Code),
		Name:        strings.TrimSpace(group.Name),
		Description: group.Description,
		ParentID:    uuidToNullablePg(group.ParentID),
		SortOrder:   group.SortOrder,
		Metadata:    metadata,
	})
	if err != nil {
		return Group{}, fmt.Errorf("create group: %w", err)
	}
	return mapGroupRow(result)
}

// UpdateGroup updates an existing group.
func (r *GroupRepository) UpdateGroup(ctx context.Context, group Group) (Group, error) {
	var metadata []byte
	if group.Metadata != nil {
		metadata = metadataOrNil(group.Metadata)
	}

	result, err := r.queries.UpdateTenantGroup(ctx, sqldb.UpdateTenantGroupParams{
		Code:        strings.TrimSpace(group.Code),
		Name:        strings.TrimSpace(group.Name),
		Description: group.Description,
		ParentID:    uuidToNullablePg(group.ParentID),
		SortOrder:   group.SortOrder,
		Metadata:    metadata,
		ID:          uuidToPg(group.ID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Group{}, ErrGroupNotFound
		}
		return Group{}, fmt.Errorf("update group: %w", err)
	}
	return mapGroupRow(result)
}

// DeleteGroup removes a group after verifying there are no child groups or members.
func (r *GroupRepository) DeleteGroup(ctx context.Context, id uuid.UUID) error {
	childCount, err := r.queries.CountChildGroups(ctx, uuidToPg(id))
	if err != nil {
		return fmt.Errorf("count child groups: %w", err)
	}
	if childCount > 0 {
		return ErrGroupHasChildren
	}

	memberCount, err := r.queries.CountMembersInGroup(ctx, uuidToPg(id))
	if err != nil {
		return fmt.Errorf("count group members: %w", err)
	}
	if memberCount > 0 {
		return ErrGroupHasMembers
	}

	if err := r.queries.DeleteTenantGroup(ctx, uuidToPg(id)); err != nil {
		return fmt.Errorf("delete group: %w", err)
	}
	return nil
}

// ListMembers returns paginated members of a group along with total count.
func (r *GroupRepository) ListMembers(ctx context.Context, groupID uuid.UUID, search string, limit, offset int32) ([]GroupMember, int64, error) {
	var searchArg *string
	if trimmed := strings.TrimSpace(search); trimmed != "" {
		searchArg = stringPtr(trimmed)
	}

	var limitPtr *int32
	if limit > 0 {
		limitPtr = int32Ptr(limit)
	}
	var offsetPtr *int32
	if offset > 0 {
		offsetPtr = int32Ptr(offset)
	}

	params := sqldb.ListGroupMembersParams{
		GroupID:     uuidToPg(groupID),
		Search:      searchArg,
		OffsetValue: offsetPtr,
		LimitValue:  limitPtr,
	}

	rows, err := r.queries.ListGroupMembers(ctx, params)
	if err != nil {
		return nil, 0, fmt.Errorf("list group members: %w", err)
	}

	total, err := r.queries.CountGroupMembersWithSearch(ctx, sqldb.CountGroupMembersWithSearchParams{
		GroupID: uuidToPg(groupID),
		Search:  searchArg,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count group members: %w", err)
	}

	members := make([]GroupMember, 0, len(rows))
	for _, row := range rows {
		member, err := mapGroupMemberRow(row)
		if err != nil {
			return nil, 0, err
		}
		members = append(members, member)
	}

	return members, total, nil
}

// CreateMember adds or updates a member record for a group.
func (r *GroupRepository) CreateMember(ctx context.Context, member GroupMember) (GroupMember, error) {
	result, err := r.queries.CreateGroupMember(ctx, sqldb.CreateGroupMemberParams{
		GroupID:     uuidToPg(member.GroupID),
		IdentityID:  uuidToPg(member.IdentityID),
		TenantID:    uuidToPg(member.TenantID),
		DisplayName: strings.TrimSpace(member.DisplayName),
		Phone:       strings.TrimSpace(member.Phone),
		Title:       member.Title,
		IsPrimary:   member.IsPrimary,
	})
	if err != nil {
		return GroupMember{}, fmt.Errorf("create group member: %w", err)
	}
	return mapGroupMemberRow(result)
}

// UpdateMember updates mutable fields of an existing member.
func (r *GroupRepository) UpdateMember(ctx context.Context, member GroupMember) (GroupMember, error) {
	result, err := r.queries.UpdateGroupMember(ctx, sqldb.UpdateGroupMemberParams{
		DisplayName: strings.TrimSpace(member.DisplayName),
		Phone:       strings.TrimSpace(member.Phone),
		Title:       member.Title,
		IsPrimary:   member.IsPrimary,
		GroupID:     uuidToPg(member.GroupID),
		IdentityID:  uuidToPg(member.IdentityID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GroupMember{}, fmt.Errorf("update group member: %w", ErrGroupNotFound)
		}
		return GroupMember{}, fmt.Errorf("update group member: %w", err)
	}
	return mapGroupMemberRow(result)
}

// MoveMember changes the group association for an identity.
func (r *GroupRepository) MoveMember(ctx context.Context, identityID, currentGroupID, newGroupID, tenantID uuid.UUID) (GroupMember, error) {
	result, err := r.queries.MoveGroupMember(ctx, sqldb.MoveGroupMemberParams{
		NewGroupID: uuidToPg(newGroupID),
		TenantID:   uuidToPg(tenantID),
		GroupID:    uuidToPg(currentGroupID),
		IdentityID: uuidToPg(identityID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GroupMember{}, fmt.Errorf("move group member: %w", ErrGroupNotFound)
		}
		return GroupMember{}, fmt.Errorf("move group member: %w", err)
	}
	return mapGroupMemberRow(result)
}

// DeleteMember removes a member from a group.
func (r *GroupRepository) DeleteMember(ctx context.Context, groupID, identityID uuid.UUID) error {
	if err := r.queries.DeleteGroupMember(ctx, sqldb.DeleteGroupMemberParams{
		GroupID:    uuidToPg(groupID),
		IdentityID: uuidToPg(identityID),
	}); err != nil {
		return fmt.Errorf("delete group member: %w", err)
	}
	return nil
}

// ListGroupsForIdentity returns all group memberships for a given identity within a tenant.
func (r *GroupRepository) ListGroupsForIdentity(ctx context.Context, tenantID, identityID uuid.UUID) ([]GroupMember, error) {
	rows, err := r.queries.ListGroupsForIdentity(ctx, sqldb.ListGroupsForIdentityParams{
		TenantID:   uuidToPg(tenantID),
		IdentityID: uuidToPg(identityID),
	})
	if err != nil {
		return nil, fmt.Errorf("list groups for identity: %w", err)
	}

	memberships := make([]GroupMember, 0, len(rows))
	for _, row := range rows {
		member, err := mapGroupMemberRow(row)
		if err != nil {
			return nil, err
		}
		memberships = append(memberships, member)
	}
	return memberships, nil
}

func mapGroupRow(row sqldb.TenantGroup) (Group, error) {
	id, err := uuid.FromBytes(row.ID.Bytes[:])
	if err != nil {
		return Group{}, fmt.Errorf("parse group id: %w", err)
	}
	tenantID, err := uuid.FromBytes(row.TenantID.Bytes[:])
	if err != nil {
		return Group{}, fmt.Errorf("parse group tenant id: %w", err)
	}

	var parentID *uuid.UUID
	if p, ok, err := pgUUIDToUUID(row.ParentID); err != nil {
		return Group{}, fmt.Errorf("parse parent id: %w", err)
	} else if ok {
		parentID = &p
	}

	metadata := json.RawMessage(`{}`)
	if len(row.Metadata) > 0 {
		metadata = json.RawMessage(row.Metadata)
	}

	return Group{
		ID:          id,
		TenantID:    tenantID,
		Code:        row.Code,
		Name:        row.Name,
		Description: row.Description,
		ParentID:    parentID,
		SortOrder:   row.SortOrder,
		MemberCount: 0,
		Metadata:    metadata,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}, nil
}

func mapGroupMemberRow(row sqldb.GroupMember) (GroupMember, error) {
	groupID, err := uuid.FromBytes(row.GroupID.Bytes[:])
	if err != nil {
		return GroupMember{}, fmt.Errorf("parse group id: %w", err)
	}
	identityID, err := uuid.FromBytes(row.IdentityID.Bytes[:])
	if err != nil {
		return GroupMember{}, fmt.Errorf("parse identity id: %w", err)
	}
	tenantID, err := uuid.FromBytes(row.TenantID.Bytes[:])
	if err != nil {
		return GroupMember{}, fmt.Errorf("parse tenant id: %w", err)
	}

	return GroupMember{
		GroupID:     groupID,
		IdentityID:  identityID,
		TenantID:    tenantID,
		DisplayName: row.DisplayName,
		Phone:       row.Phone,
		Title:       row.Title,
		IsPrimary:   row.IsPrimary,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}, nil
}
