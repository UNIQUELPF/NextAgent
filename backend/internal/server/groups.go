package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/kratos"
	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
	"github.com/laofa009/next-agent-portal/backend/internal/storage"
)

func (s *Server) registerGroupRoutes(group *gin.RouterGroup) {
	group.GET("/groups", s.handleListGroups)
	group.POST("/groups", s.handleCreateGroup)
	group.PUT("/groups/:id", s.handleUpdateGroup)
	group.DELETE("/groups/:id", s.handleDeleteGroup)
	group.GET("/groups/:id/members", s.handleListGroupMembers)
	group.POST("/groups/:id/members", s.handleCreateGroupMember)
	group.PATCH("/groups/:id/members/:member", s.handleUpdateGroupMember)
	group.DELETE("/groups/:id/members/:member", s.handleDeleteGroupMember)
}

type groupResponse struct {
	ID          uuid.UUID       `json:"id"`
	TenantID    uuid.UUID       `json:"tenant_id"`
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	ParentID    *uuid.UUID      `json:"parent_id,omitempty"`
	SortOrder   int32           `json:"sort_order"`
	MemberCount int64           `json:"member_count"`
	Metadata    map[string]any  `json:"metadata"`
	CreatedAt   string          `json:"created_at"`
	UpdatedAt   string          `json:"updated_at"`
	Children    []groupResponse `json:"children,omitempty"`
}

type groupPayload struct {
	TenantID    string         `json:"tenant_id"`
	Code        string         `json:"code"`
	Name        string         `json:"name"`
	Description *string        `json:"description"`
	ParentID    *string        `json:"parent_id"`
	SortOrder   *int32         `json:"sort_order"`
	Metadata    map[string]any `json:"metadata"`
}

type listGroupsResponse struct {
	Items []groupResponse `json:"items"`
}

type groupMemberResponse struct {
	IdentityID  uuid.UUID `json:"identity_id"`
	DisplayName string    `json:"display_name"`
	Phone       string    `json:"phone"`
	Title       *string   `json:"title,omitempty"`
	IsPrimary   bool      `json:"is_primary"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

type listGroupMembersResponse struct {
	Items    []groupMemberResponse `json:"items"`
	Total    int64                 `json:"total"`
	Page     int                   `json:"page"`
	PageSize int                   `json:"page_size"`
}

var groupCodePattern = regexp.MustCompile(`^[A-Za-z0-9_-]{1,32}$`)

func (s *Server) handleListGroups(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	var tenantFilter *uuid.UUID
	if isPlatformAdmin(ctx) {
		if tenantParam := strings.TrimSpace(c.Query("tenant_id")); tenantParam != "" {
			tenantUUID, err := uuid.Parse(tenantParam)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
				return
			}
			tenantFilter = &tenantUUID
		}
	} else {
		tenantID, ok := s.resolveTenantID(c, ctx, false)
		if !ok {
			return
		}
		tenantFilter = &tenantID
	}

	groups, err := s.groupRepo.ListGroups(c.Request.Context(), tenantFilter)
	if err != nil {
		s.logger.Error("list groups failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load groups"})
		return
	}

	tree := buildGroupTree(groups)
	c.JSON(http.StatusOK, listGroupsResponse{Items: tree})
}

func (s *Server) handleCreateGroup(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	var payload groupPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if strings.TrimSpace(payload.Code) == "" || strings.TrimSpace(payload.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code and name are required"})
		return
	}

	if !groupCodePattern.MatchString(payload.Code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "group code must be 1-32 alphanumeric or -/_"})
		return
	}

	tenantID, ok := s.resolveTenantIDForPayload(c, ctx, payload.TenantID)
	if !ok {
		return
	}

	var parentID *uuid.UUID
	if payload.ParentID != nil && strings.TrimSpace(*payload.ParentID) != "" {
		parentUUID, err := uuid.Parse(strings.TrimSpace(*payload.ParentID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parent_id"})
			return
		}
		parent, err := s.groupRepo.GetGroup(c.Request.Context(), parentUUID)
		if err != nil {
			if errors.Is(err, storage.ErrGroupNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "parent group not found"})
				return
			}
			s.logger.Error("load parent group failed", zapError(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load parent group"})
			return
		}
		if parent.TenantID != tenantID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "parent group belongs to another tenant"})
			return
		}
		parentID = &parentUUID
	}

	sortOrder := int32(0)
	if payload.SortOrder != nil {
		sortOrder = *payload.SortOrder
	}

	metadataBytes := json.RawMessage(`{}`)
	if payload.Metadata != nil {
		raw, err := json.Marshal(payload.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
			return
		}
		metadataBytes = raw
	}

	group := storage.Group{
		TenantID:    tenantID,
		Code:        strings.TrimSpace(payload.Code),
		Name:        strings.TrimSpace(payload.Name),
		SortOrder:   sortOrder,
		Metadata:    metadataBytes,
		Description: payload.Description,
		ParentID:    parentID,
	}

	created, err := s.groupRepo.CreateGroup(c.Request.Context(), group)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "group code already exists"})
			return
		}
		s.logger.Error("create group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create group"})
		return
	}

	c.JSON(http.StatusCreated, mapGroupResponse(created))
}

func (s *Server) handleUpdateGroup(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	existing, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, existing.TenantID) {
		return
	}

	var payload groupPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	code := strings.TrimSpace(payload.Code)
	if code == "" {
		code = existing.Code
	}
	if !groupCodePattern.MatchString(code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "group code must be 1-32 alphanumeric or -/_"})
		return
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		name = existing.Name
	}

	var parentID *uuid.UUID
	if payload.ParentID != nil {
		trimmed := strings.TrimSpace(*payload.ParentID)
		if trimmed == "" {
			parentID = nil
		} else {
			parentUUID, err := uuid.Parse(trimmed)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parent_id"})
				return
			}
			if parentUUID == existing.ID {
				c.JSON(http.StatusBadRequest, gin.H{"error": "group cannot be its own parent"})
				return
			}
			parent, err := s.groupRepo.GetGroup(c.Request.Context(), parentUUID)
			if err != nil {
				if errors.Is(err, storage.ErrGroupNotFound) {
					c.JSON(http.StatusBadRequest, gin.H{"error": "parent group not found"})
					return
				}
				s.logger.Error("load parent group failed", zapError(err))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load parent group"})
				return
			}
			if parent.TenantID != existing.TenantID {
				c.JSON(http.StatusBadRequest, gin.H{"error": "parent group belongs to another tenant"})
				return
			}
			parentID = &parentUUID
		}
	} else {
		parentID = existing.ParentID
	}

	sortOrder := existing.SortOrder
	if payload.SortOrder != nil {
		sortOrder = *payload.SortOrder
	}

	var metadataBytes []byte
	if payload.Metadata != nil {
		raw, err := json.Marshal(payload.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
			return
		}
		metadataBytes = raw
	}

	updated, err := s.groupRepo.UpdateGroup(c.Request.Context(), storage.Group{
		ID:          existing.ID,
		TenantID:    existing.TenantID,
		Code:        code,
		Name:        name,
		Description: payload.Description,
		ParentID:    parentID,
		SortOrder:   sortOrder,
		Metadata:    metadataBytes,
	})
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "group code already exists"})
			return
		}
		s.logger.Error("update group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update group"})
		return
	}

	c.JSON(http.StatusOK, mapGroupResponse(updated))
}

func (s *Server) handleDeleteGroup(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	group, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.Status(http.StatusNoContent)
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, group.TenantID) {
		return
	}

	if err := s.groupRepo.DeleteGroup(c.Request.Context(), groupID); err != nil {
		if errors.Is(err, storage.ErrGroupHasChildren) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "group still has child groups"})
			return
		}
		if errors.Is(err, storage.ErrGroupHasMembers) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "group still has members"})
			return
		}
		s.logger.Error("delete group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete group"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (s *Server) handleListGroupMembers(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	group, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, group.TenantID) {
		return
	}

	page := parsePositiveInt(c.Query("page"), defaultPage)
	pageSize := parsePositiveInt(c.Query("page_size"), defaultPageSize)
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}
	if page < 1 {
		page = defaultPage
	}

	search := strings.TrimSpace(c.Query("search"))
	limit := int32(pageSize)
	offset := int32((page - 1) * pageSize)

	members, total, err := s.groupRepo.ListMembers(c.Request.Context(), groupID, search, limit, offset)
	if err != nil {
		s.logger.Error("list group members failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load members"})
		return
	}

	items := make([]groupMemberResponse, 0, len(members))
	for _, member := range members {
		items = append(items, mapGroupMember(member))
	}

	c.JSON(http.StatusOK, listGroupMembersResponse{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

type createGroupMemberPayload struct {
	DisplayName string  `json:"display_name"`
	Phone       string  `json:"phone"`
	Password    string  `json:"password"`
	Title       *string `json:"title"`
}

func (s *Server) handleCreateGroupMember(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	group, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, group.TenantID) {
		return
	}

	var payload createGroupMemberPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	displayName := strings.TrimSpace(payload.DisplayName)
	phone := normalizePhone(payload.Phone)
	password := strings.TrimSpace(payload.Password)

	if displayName == "" || phone == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "display name, phone and password are required"})
		return
	}

	if len(password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 6 characters"})
		return
	}

	existing, err := s.kratosClient.FindIdentityByIdentifier(c.Request.Context(), phone)
	if err != nil {
		s.logger.Error("kratos lookup failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check existing user"})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "手机号已注册"})
		return
	}

	tenantUUIDStr := group.TenantID.String()
	groupIDStr := group.ID.String()

	identity, err := s.kratosClient.CreateIdentity(c.Request.Context(), kratos.CreateIdentityInput{
		Phone:    phone,
		Nickname: displayName,
		UserType: "internal",
		TenantID: tenantUUIDStr,
		Roles:    []string{},
		Password: password,
	})
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		s.logger.Error("create kratos identity failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	identityID, err := uuid.Parse(identity.ID)
	if err != nil {
		s.logger.Error("parse identity id failed", zap.String("identity", identity.ID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid identity id"})
		return
	}

	var titlePtr *string
	if payload.Title != nil {
		trimmed := strings.TrimSpace(*payload.Title)
		if trimmed != "" {
			title := trimmed
			titlePtr = &title
		}
	}

	member, err := s.groupRepo.CreateMember(c.Request.Context(), storage.GroupMember{
		GroupID:     group.ID,
		IdentityID:  identityID,
		TenantID:    group.TenantID,
		DisplayName: displayName,
		Phone:       phone,
		Title:       titlePtr,
		IsPrimary:   false,
	})
	if err != nil {
		s.logger.Error("create group member failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add member"})
		return
	}

	if err := s.ketoClient.AssignGroupMember(c.Request.Context(), tenantUUIDStr, groupIDStr, identityID.String()); err != nil {
		s.logger.Warn("assign group membership failed", zapError(err))
	}

	c.JSON(http.StatusCreated, mapGroupMember(member))
}

type updateGroupMemberPayload struct {
	TargetGroupID string `json:"target_group_id"`
}

func (s *Server) handleUpdateGroupMember(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	identityID, err := uuid.Parse(strings.TrimSpace(c.Param("member")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}

	group, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, group.TenantID) {
		return
	}

	var payload updateGroupMemberPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if strings.TrimSpace(payload.TargetGroupID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target group id is required"})
		return
	}

	targetUUID, err := uuid.Parse(strings.TrimSpace(payload.TargetGroupID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid target group id"})
		return
	}

	if targetUUID == group.ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target group must differ from source"})
		return
	}

	targetGroup, err := s.groupRepo.GetGroup(c.Request.Context(), targetUUID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "target group not found"})
			return
		}
		s.logger.Error("load target group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load target group"})
		return
	}

	if targetGroup.TenantID != group.TenantID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target group belongs to another tenant"})
		return
	}

	tenantIDStr := group.TenantID.String()
	identityIDStr := identityID.String()
	groupIDStr := group.ID.String()

	moved, err := s.groupRepo.MoveMember(c.Request.Context(), identityID, group.ID, targetUUID, group.TenantID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "member not found"})
			return
		}
		s.logger.Error("move member failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to move member"})
		return
	}

	if err := s.ketoClient.RemoveGroupMember(c.Request.Context(), tenantIDStr, groupIDStr, identityIDStr); err != nil {
		s.logger.Warn("remove old group membership failed", zapError(err))
	}
	if err := s.ketoClient.AssignGroupMember(c.Request.Context(), tenantIDStr, moved.GroupID.String(), identityIDStr); err != nil {
		s.logger.Warn("assign new group membership failed", zapError(err))
	}

	c.JSON(http.StatusOK, mapGroupMember(moved))
}

func (s *Server) handleDeleteGroupMember(c *gin.Context) {
	ctx, ok := s.requireOrgManager(c)
	if !ok {
		return
	}

	groupID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}

	identityID, err := uuid.Parse(strings.TrimSpace(c.Param("member")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}

	group, err := s.groupRepo.GetGroup(c.Request.Context(), groupID)
	if err != nil {
		if errors.Is(err, storage.ErrGroupNotFound) {
			c.Status(http.StatusNoContent)
			return
		}
		s.logger.Error("load group failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load group"})
		return
	}

	if !s.ensureTenantAccess(c, ctx, group.TenantID) {
		return
	}

	if err := s.groupRepo.DeleteMember(c.Request.Context(), groupID, identityID); err != nil {
		s.logger.Error("delete group member failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete member"})
		return
	}

	if err := s.ketoClient.RemoveGroupMember(c.Request.Context(), group.TenantID.String(), group.ID.String(), identityID.String()); err != nil {
		s.logger.Warn("remove group membership failed", zapError(err))
	}

	c.Status(http.StatusNoContent)
}

func (s *Server) requireOrgManager(c *gin.Context) (*middleware.IdentityContext, bool) {
	ctx := middleware.IdentityFromContext(c)
	if ctx == nil || ctx.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return nil, false
	}

	if isPlatformAdmin(ctx) {
		return ctx, true
	}

	for _, role := range ctx.Roles {
		switch strings.ToLower(role) {
		case "tenant_admin", "tenant-admin", "organization_manager", "organization-manager":
			if strings.TrimSpace(ctx.TenantID) == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "tenant context missing"})
				return nil, false
			}
			return ctx, true
		}
	}

	c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	return nil, false
}

func (s *Server) ensureTenantAccess(c *gin.Context, ctx *middleware.IdentityContext, tenantID uuid.UUID) bool {
	if isPlatformAdmin(ctx) {
		if tenantID != s.platformTenantID {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for tenant"})
			return false
		}
		return true
	}
	if strings.TrimSpace(ctx.TenantID) == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "tenant context missing"})
		return false
	}
	ctxTenant, err := uuid.Parse(ctx.TenantID)
	if err != nil {
		s.logger.Error("parse tenant context failed", zap.String("tenant_id", ctx.TenantID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant context"})
		return false
	}
	if ctxTenant != tenantID {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for tenant"})
		return false
	}
	return true
}

func (s *Server) resolveTenantID(c *gin.Context, ctx *middleware.IdentityContext, allowQuery bool) (uuid.UUID, bool) {
	if isPlatformAdmin(ctx) {
		if allowQuery {
			if tenantParam := strings.TrimSpace(c.Query("tenant_id")); tenantParam != "" {
				tenantUUID, err := uuid.Parse(tenantParam)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
					return uuid.Nil, false
				}
				if tenantUUID != s.platformTenantID {
					c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for tenant"})
					return uuid.Nil, false
				}
				return tenantUUID, true
			}
		}
		return s.platformTenantID, true
	}

	if strings.TrimSpace(ctx.TenantID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id is required"})
		return uuid.Nil, false
	}
	tenantUUID, err := uuid.Parse(ctx.TenantID)
	if err != nil {
		s.logger.Error("parse tenant context failed", zap.String("tenant_id", ctx.TenantID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant context"})
		return uuid.Nil, false
	}
	return tenantUUID, true
}

func (s *Server) resolveTenantIDForPayload(c *gin.Context, ctx *middleware.IdentityContext, payloadTenant string) (uuid.UUID, bool) {
	if trimmed := strings.TrimSpace(payloadTenant); trimmed != "" {
		tenantUUID, err := uuid.Parse(trimmed)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
			return uuid.Nil, false
		}
		if isPlatformAdmin(ctx) {
			if tenantUUID != s.platformTenantID {
				c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for tenant"})
				return uuid.Nil, false
			}
			return tenantUUID, true
		}
		if !s.ensureTenantAccess(c, ctx, tenantUUID) {
			return uuid.Nil, false
		}
		return tenantUUID, true
	}

	if isPlatformAdmin(ctx) {
		return s.platformTenantID, true
	}

	if strings.TrimSpace(ctx.TenantID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id is required"})
		return uuid.Nil, false
	}
	tenantUUID, err := uuid.Parse(ctx.TenantID)
	if err != nil {
		s.logger.Error("parse tenant context failed", zap.String("tenant_id", ctx.TenantID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant context"})
		return uuid.Nil, false
	}
	return tenantUUID, true
}

func buildGroupTree(groups []storage.Group) []groupResponse {
	children := make(map[uuid.UUID][]storage.Group)
	roots := make([]storage.Group, 0)
	for _, group := range groups {
		if group.ParentID == nil {
			roots = append(roots, group)
			continue
		}
		children[*group.ParentID] = append(children[*group.ParentID], group)
	}

	var toResponse func(storage.Group) groupResponse
	toResponse = func(g storage.Group) groupResponse {
		resp := mapGroupResponse(g)
		for _, child := range children[g.ID] {
			resp.Children = append(resp.Children, toResponse(child))
		}
		return resp
	}

	result := make([]groupResponse, 0, len(roots))
	for _, root := range roots {
		result = append(result, toResponse(root))
	}
	return result
}

func mapGroupResponse(group storage.Group) groupResponse {
	metadata := map[string]any{}
	if len(group.Metadata) > 0 {
		if err := json.Unmarshal(group.Metadata, &metadata); err != nil {
			metadata = map[string]any{}
		}
	}

	resp := groupResponse{
		ID:          group.ID,
		TenantID:    group.TenantID,
		Code:        group.Code,
		Name:        group.Name,
		Description: group.Description,
		ParentID:    group.ParentID,
		SortOrder:   group.SortOrder,
		MemberCount: group.MemberCount,
		Metadata:    metadata,
		CreatedAt:   group.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   group.UpdatedAt.Format(time.RFC3339),
	}
	return resp
}

func mapGroupMember(member storage.GroupMember) groupMemberResponse {
	return groupMemberResponse{
		IdentityID:  member.IdentityID,
		DisplayName: member.DisplayName,
		Phone:       member.Phone,
		Title:       member.Title,
		IsPrimary:   member.IsPrimary,
		CreatedAt:   member.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   member.UpdatedAt.Format(time.RFC3339),
	}
}

func normalizePhone(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return raw
	}
	if strings.HasPrefix(raw, "+") {
		return raw
	}
	if strings.HasPrefix(raw, "86") {
		return "+" + raw
	}
	return "+86" + raw
}
