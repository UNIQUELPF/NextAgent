package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/keto"
	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
	"github.com/laofa009/next-agent-portal/backend/internal/storage"
)

const (
	defaultRolePageSize = 20
	maxRolePageSize     = 100
)

type permissionBinding struct {
	Scope    string
	Object   string
	Relation string
}

var permissionBindings = map[string][]permissionBinding{
	"tenant.manage": {
		{Scope: "global", Object: "api/v1/tenants", Relation: "admins"},
		{Scope: "global", Object: "api/v1/tenants/:uuid", Relation: "admins"},
	},
	"tenant.view": {
		{Scope: "global", Object: "api/v1/tenants", Relation: "viewers"},
		{Scope: "global", Object: "api/v1/tenants/:uuid", Relation: "viewers"},
	},
	"role.manage": {
		{Scope: "tenant", Object: "api/v1/roles", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/roles/:uuid", Relation: "editors"},
	},
	"role.assign": {
		{Scope: "tenant", Object: "api/v1/roles/:uuid/members", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/roles/:uuid/members/:uuid", Relation: "editors"},
	},
	"role.view": {
		{Scope: "tenant", Object: "api/v1/roles", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/roles/:uuid", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/roles/:uuid/members", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/permissions", Relation: "viewers"},
		{Scope: "global", Object: "api/v1/permissions", Relation: "viewers"},
	},
	"group.manage": {
		{Scope: "tenant", Object: "api/v1/groups", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid/members", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid/members/:uuid", Relation: "editors"},
	},
	"group.view": {
		{Scope: "tenant", Object: "api/v1/groups", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid/members", Relation: "viewers"},
	},
	"group.member.manage": {
		{Scope: "tenant", Object: "api/v1/groups/:uuid/members", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/groups/:uuid/members/:uuid", Relation: "editors"},
	},
	"user.invite": {
		{Scope: "tenant", Object: "api/v1/users", Relation: "editors"},
	},
	"user.disable": {
		{Scope: "tenant", Object: "api/v1/users", Relation: "editors"},
		{Scope: "tenant", Object: "api/v1/users/:uuid", Relation: "editors"},
	},
	"user.view": {
		{Scope: "tenant", Object: "api/v1/users", Relation: "viewers"},
		{Scope: "tenant", Object: "api/v1/users/:uuid", Relation: "viewers"},
	},
}

func (s *Server) registerRoleRoutes(group *gin.RouterGroup) {
	group.GET("/roles", s.handleListRoles)
	group.POST("/roles", s.handleCreateRole)
	group.PUT("/roles/:id", s.handleUpdateRole)
	group.DELETE("/roles/:id", s.handleDeleteRole)
	group.GET("/roles/:id/members", s.handleListRoleMembers)
	group.POST("/roles/:id/members", s.handleAddRoleMembers)
	group.DELETE("/roles/:id/members/:member", s.handleDeleteRoleMember)
}

type roleResponse struct {
	ID            string         `json:"id"`
	TenantID      *string        `json:"tenantId,omitempty"`
	Scope         string         `json:"scope"`
	Code          string         `json:"code"`
	Name          string         `json:"name"`
	Description   *string        `json:"description,omitempty"`
	Metadata      map[string]any `json:"metadata"`
	Permissions   []string       `json:"permissions,omitempty"`
	AssignedCount int64          `json:"assignedCount"`
	CreatedAt     string         `json:"createdAt"`
	UpdatedAt     string         `json:"updatedAt"`
	Version       int32          `json:"version"`
}

type listRolesResponse struct {
	Items    []roleResponse `json:"items"`
	Total    int64          `json:"total"`
	Page     int            `json:"page"`
	PageSize int            `json:"pageSize"`
}

type roleMemberResponse struct {
	IdentityID string  `json:"identityId"`
	TenantID   *string `json:"tenantId,omitempty"`
	AssignedAt string  `json:"assignedAt"`
}

type listRoleMembersResponse struct {
	Items    []roleMemberResponse `json:"items"`
	Total    int64                `json:"total"`
	Page     int                  `json:"page"`
	PageSize int                  `json:"pageSize"`
}

type assignRoleMembersPayload struct {
	Identities []string `json:"identities"`
}

type resolvedBinding struct {
	Object   string
	Relation string
}

func (s *Server) handleListRoles(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if !isPlatformAdmin(identity) && !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	scope := strings.TrimSpace(strings.ToLower(c.Query("scope")))
	if scope != "" && scope != "global" && scope != "tenant" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "scope must be global or tenant"})
		return
	}

	search := strings.TrimSpace(c.Query("search"))
	page := parsePositiveInt(c.Query("page"), defaultPage)
	pageSize := parsePositiveInt(c.Query("page_size"), defaultRolePageSize)
	if pageSize > maxRolePageSize {
		pageSize = maxRolePageSize
	}

	includePermissions := false
	for _, token := range strings.Split(c.Query("include"), ",") {
		if strings.EqualFold(strings.TrimSpace(token), "permissions") {
			includePermissions = true
			break
		}
	}

	params := storage.RoleListParams{
		Scope:  scope,
		Search: search,
		Limit:  int32(pageSize),
		Offset: int32((page - 1) * pageSize),
	}

	if isPlatformAdmin(identity) {
		if scope == "" {
			params.Scope = ""
		}
		if tenantParam := strings.TrimSpace(c.Query("tenant_id")); tenantParam != "" {
			tenantUUID, err := uuid.Parse(tenantParam)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant_id"})
				return
			}
			params.TenantID = &tenantUUID
		}
	} else {
		if scope != "" && scope != "tenant" {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}
		if strings.TrimSpace(identity.TenantID) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant context missing"})
			return
		}
		tenantUUID, err := uuid.Parse(identity.TenantID)
		if err != nil {
			s.logger.Error("parse tenant context failed", zapError(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant context"})
			return
		}
		params.Scope = "tenant"
		params.TenantID = &tenantUUID
	}

	roles, total, err := s.roleRepo.ListRoles(c.Request.Context(), params)
	if err != nil {
		s.logger.Error("list roles failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load roles"})
		return
	}

	response := make([]roleResponse, 0, len(roles))
	for _, role := range roles {
		item, err := s.buildRoleResponse(c.Request.Context(), role, includePermissions)
		if err != nil {
			s.logger.Error("build role response failed", zapError(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build role response"})
			return
		}
		response = append(response, item)
	}

	c.JSON(http.StatusOK, listRolesResponse{
		Items:    response,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func (s *Server) handleListRoleMembers(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	roleID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role id"})
		return
	}

	role, err := s.roleRepo.GetRole(c.Request.Context(), roleID)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		s.logger.Error("get role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role"})
		return
	}

	if !s.canManageRole(identity, &role) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for role"})
		return
	}

	page := parsePositiveInt(c.Query("page"), defaultPage)
	pageSize := parsePositiveInt(c.Query("page_size"), defaultRolePageSize)
	if pageSize > maxRolePageSize {
		pageSize = maxRolePageSize
	}
	if page < 1 {
		page = defaultPage
	}

	assignments, total, err := s.roleRepo.ListAssignments(c.Request.Context(), roleID, int32(pageSize), int32((page-1)*pageSize))
	if err != nil {
		s.logger.Error("list role assignments failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role members"})
		return
	}

	items := make([]roleMemberResponse, 0, len(assignments))
	for _, assignment := range assignments {
		items = append(items, mapRoleAssignment(assignment))
	}

	c.JSON(http.StatusOK, listRoleMembersResponse{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func decodeMetadata(raw json.RawMessage) map[string]any {
	if len(raw) == 0 {
		return map[string]any{}
	}
	var result map[string]any
	if err := json.Unmarshal(raw, &result); err != nil {
		return map[string]any{}
	}
	return result
}

func hasAnyRole(ctx *middleware.IdentityContext, allowed ...string) bool {
	if ctx == nil {
		return false
	}
	allowedSet := make(map[string]struct{}, len(allowed))
	for _, candidate := range allowed {
		allowedSet[strings.ToLower(strings.TrimSpace(candidate))] = struct{}{}
	}
	for _, role := range ctx.Roles {
		if _, ok := allowedSet[strings.ToLower(strings.TrimSpace(role))]; ok {
			return true
		}
	}
	return false
}

type rolePayload struct {
	TenantID    *string        `json:"tenant_id"`
	Scope       string         `json:"scope"`
	Code        string         `json:"code"`
	Name        string         `json:"name"`
	Description *string        `json:"description"`
	Permissions []string       `json:"permissions"`
	Metadata    map[string]any `json:"metadata"`
}

func (s *Server) handleCreateRole(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if !isPlatformAdmin(identity) && !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var payload rolePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	scope := strings.ToLower(strings.TrimSpace(payload.Scope))
	if scope != "global" && scope != "tenant" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "scope must be global or tenant"})
		return
	}

	code := strings.TrimSpace(payload.Code)
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	var tenantID *uuid.UUID
	if scope == "global" {
		if !isPlatformAdmin(identity) {
			c.JSON(http.StatusForbidden, gin.H{"error": "only platform admin can create global role"})
			return
		}
		if payload.TenantID != nil && strings.TrimSpace(*payload.TenantID) != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "global roles must not include tenant_id"})
			return
		}
	} else {
		var tenantUUID uuid.UUID
		var ok bool
		tenantCandidate := ""
		if payload.TenantID != nil {
			tenantCandidate = strings.TrimSpace(*payload.TenantID)
		}
		tenantUUID, ok = s.resolveTenantIDForPayload(c, identity, tenantCandidate)
		if !ok {
			return
		}
		tenantID = &tenantUUID
	}

	perms, err := s.normalizePermissions(c.Request.Context(), payload.Permissions, scope)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	metadata, err := encodeMetadata(payload.Metadata)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
		return
	}

	role := storage.Role{
		TenantID:    tenantID,
		Scope:       scope,
		Code:        code,
		Name:        name,
		Description: payload.Description,
		Metadata:    metadata,
		Permissions: perms,
	}

	created, err := s.roleRepo.CreateRole(c.Request.Context(), role)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "role code already exists"})
			return
		}
		s.logger.Error("create role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create role"})
		return
	}

	if err := s.syncRolePermissionBindings(c.Request.Context(), created, nil); err != nil {
		s.logger.Error("sync role permissions failed", zapError(err), zap.String("role", created.Code))
		if delErr := s.roleRepo.DeleteRole(c.Request.Context(), created.ID); delErr != nil {
			s.logger.Error("rollback role creation failed", zapError(delErr), zap.String("role", created.Code))
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to apply role permissions"})
		return
	}

	resp, err := s.buildRoleResponse(c.Request.Context(), created, true)
	if err != nil {
		s.logger.Error("build role response failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build response"})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (s *Server) handleUpdateRole(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if !isPlatformAdmin(identity) && !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	roleID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role id"})
		return
	}

	existing, err := s.roleRepo.GetRole(c.Request.Context(), roleID)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		s.logger.Error("get role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role"})
		return
	}

	if !s.canManageRole(identity, &existing) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for role"})
		return
	}

	var payload rolePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	scope := strings.ToLower(strings.TrimSpace(payload.Scope))
	if scope == "" {
		scope = existing.Scope
	}

	if scope != existing.Scope {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role scope cannot be changed"})
		return
	}

	code := strings.TrimSpace(payload.Code)
	if code == "" {
		code = existing.Code
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		name = existing.Name
	}

	perms, err := s.normalizePermissions(c.Request.Context(), payload.Permissions, scope)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	metadata, err := encodeMetadata(payload.Metadata)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
		return
	}

	role := storage.Role{
		ID:          existing.ID,
		TenantID:    existing.TenantID,
		Scope:       scope,
		Code:        code,
		Name:        name,
		Description: payload.Description,
		Metadata:    metadata,
		Permissions: perms,
	}

	updated, err := s.roleRepo.UpdateRole(c.Request.Context(), role, true)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "role code already exists"})
			return
		}
		s.logger.Error("update role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update role"})
		return
	}

	if err := s.syncRolePermissionBindings(c.Request.Context(), updated, existing.Permissions); err != nil {
		s.logger.Error("sync role permissions failed", zapError(err), zap.String("role", updated.Code))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to apply role permissions"})
		return
	}

	resp, err := s.buildRoleResponse(c.Request.Context(), updated, true)
	if err != nil {
		s.logger.Error("build role response failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build response"})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleDeleteRole(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if !isPlatformAdmin(identity) && !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	roleID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role id"})
		return
	}

	existing, err := s.roleRepo.GetRole(c.Request.Context(), roleID)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		s.logger.Error("get role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role"})
		return
	}

	if !s.canManageRole(identity, &existing) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for role"})
		return
	}

	cleanupRole := existing
	cleanupRole.Permissions = nil
	if err := s.syncRolePermissionBindings(c.Request.Context(), cleanupRole, existing.Permissions); err != nil {
		s.logger.Error("remove role permission bindings failed", zapError(err), zap.String("role", existing.Code))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove role permissions"})
		return
	}

	if err := s.removeRoleMemberships(c.Request.Context(), existing); err != nil {
		s.logger.Error("remove role memberships failed", zapError(err), zap.String("role", existing.Code))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove role memberships"})
		return
	}

	if err := s.roleRepo.DeleteRole(c.Request.Context(), roleID); err != nil {
		s.logger.Error("delete role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete role"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (s *Server) handleAddRoleMembers(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	roleID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role id"})
		return
	}

	role, err := s.roleRepo.GetRole(c.Request.Context(), roleID)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		s.logger.Error("get role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role"})
		return
	}

	if !s.canManageRole(identity, &role) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for role"})
		return
	}

	var payload assignRoleMembersPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if len(payload.Identities) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "identities cannot be empty"})
		return
	}

	identitySet := make(map[uuid.UUID]struct{})
	for _, raw := range payload.Identities {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "identity id cannot be empty"})
			return
		}
		memberID, parseErr := uuid.Parse(trimmed)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid identity id: %s", raw)})
			return
		}
		identitySet[memberID] = struct{}{}
	}

	if len(identitySet) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no valid identity ids provided"})
		return
	}

	var tenantStr string
	if role.TenantID != nil {
		tenantStr = role.TenantID.String()
	}

	assigned := 0
	for memberID := range identitySet {
		if err := s.roleRepo.UpsertAssignment(c.Request.Context(), role.ID, memberID, role.TenantID); err != nil {
			s.logger.Error("upsert role assignment failed", zapError(err), zap.String("role", role.Code), zap.String("member", memberID.String()))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign role"})
			return
		}
		if err := s.ketoClient.AssignRole(c.Request.Context(), tenantStr, role.Code, memberID.String()); err != nil {
			s.logger.Error("assign role in keto failed", zapError(err), zap.String("role", role.Code), zap.String("member", memberID.String()))
			_ = s.roleRepo.DeleteAssignment(c.Request.Context(), role.ID, memberID)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign role"})
			return
		}
		assigned++
	}

	c.JSON(http.StatusOK, gin.H{"assigned": assigned})
}

func (s *Server) handleDeleteRoleMember(c *gin.Context) {
	requester := middleware.IdentityFromContext(c)
	if requester == nil || requester.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	roleID, err := uuid.Parse(strings.TrimSpace(c.Param("id")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role id"})
		return
	}

	memberID, err := uuid.Parse(strings.TrimSpace(c.Param("member")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}

	role, err := s.roleRepo.GetRole(c.Request.Context(), roleID)
	if err != nil {
		if errors.Is(err, storage.ErrRoleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
			return
		}
		s.logger.Error("get role failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load role"})
		return
	}

	if !s.canManageRole(requester, &role) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for role"})
		return
	}

	if err := s.roleRepo.DeleteAssignment(c.Request.Context(), role.ID, memberID); err != nil {
		s.logger.Error("delete role assignment failed", zapError(err), zap.String("role", role.Code), zap.String("member", memberID.String()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove role member"})
		return
	}

	var tenantStr string
	if role.TenantID != nil {
		tenantStr = role.TenantID.String()
	}

	if err := s.ketoClient.RemoveRole(c.Request.Context(), tenantStr, role.Code, memberID.String()); err != nil {
		s.logger.Error("remove role assignment in keto failed", zapError(err), zap.String("role", role.Code), zap.String("member", memberID.String()))
		if rollbackErr := s.roleRepo.UpsertAssignment(c.Request.Context(), role.ID, memberID, role.TenantID); rollbackErr != nil {
			s.logger.Error("rollback role assignment failed", zapError(rollbackErr), zap.String("role", role.Code), zap.String("member", memberID.String()))
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove role member"})
		return
	}

	c.Status(http.StatusNoContent)
}

func mapRoleAssignment(assignment storage.RoleAssignment) roleMemberResponse {
	var tenantStr *string
	if assignment.TenantID != nil {
		id := assignment.TenantID.String()
		tenantStr = &id
	}
	return roleMemberResponse{
		IdentityID: assignment.IdentityID.String(),
		TenantID:   tenantStr,
		AssignedAt: assignment.CreatedAt.Format(time.RFC3339),
	}
}

func (s *Server) buildRoleResponse(ctx context.Context, role storage.Role, includePermissions bool) (roleResponse, error) {
	var tenantStr *string
	if role.TenantID != nil {
		id := role.TenantID.String()
		tenantStr = &id
	}

	item := roleResponse{
		ID:            role.ID.String(),
		TenantID:      tenantStr,
		Scope:         role.Scope,
		Code:          role.Code,
		Name:          role.Name,
		Description:   role.Description,
		Metadata:      decodeMetadata(role.Metadata),
		AssignedCount: role.AssignedCount,
		CreatedAt:     role.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     role.UpdatedAt.Format(time.RFC3339),
		Version:       role.Version,
	}

	if includePermissions {
		perms := role.Permissions
		if len(perms) == 0 {
			fetched, err := s.roleRepo.ListPermissions(ctx, role.ID)
			if err != nil {
				return roleResponse{}, fmt.Errorf("list role permissions: %w", err)
			}
			perms = fetched
		}
		item.Permissions = perms
	}

	return item, nil
}

func (s *Server) normalizePermissions(ctx context.Context, requested []string, scope string) ([]string, error) {
	permissionList, err := s.permissionRepo.ListPermissions(ctx)
	if err != nil {
		return nil, fmt.Errorf("load permissions catalog: %w", err)
	}

	allowed := make(map[string]string, len(permissionList))
	for _, perm := range permissionList {
		allowed[strings.ToLower(strings.TrimSpace(perm.Code))] = perm.Scope
	}

	unique := make([]string, 0, len(requested))
	seen := make(map[string]struct{})
	for _, code := range requested {
		trimmed := strings.ToLower(strings.TrimSpace(code))
		if trimmed == "" {
			continue
		}
		if _, exists := seen[trimmed]; exists {
			continue
		}
		scopeDef, ok := allowed[trimmed]
		if !ok {
			return nil, fmt.Errorf("unknown permission code: %s", code)
		}
		if scope == "global" && scopeDef == "tenant" {
			return nil, fmt.Errorf("permission %s is not allowed for global roles", code)
		}
		if scope == "tenant" && scopeDef == "global" {
			return nil, fmt.Errorf("permission %s is not allowed for tenant roles", code)
		}
		seen[trimmed] = struct{}{}
		unique = append(unique, trimmed)
	}

	return unique, nil
}

func (s *Server) canManageRole(identity *middleware.IdentityContext, role *storage.Role) bool {
	if isPlatformAdmin(identity) {
		if role.Scope == "global" {
			return true
		}

		// Platform admin is currently limited to platform tenant.
		if role.TenantID == nil {
			return false
		}
		return strings.EqualFold(role.TenantID.String(), s.platformTenantID.String())
	}

	if !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		return false
	}

	if role.Scope != "tenant" || role.TenantID == nil {
		return false
	}

	return strings.EqualFold(identity.TenantID, role.TenantID.String())
}

func encodeMetadata(metadata map[string]any) (json.RawMessage, error) {
	if metadata == nil {
		return nil, nil
	}
	if len(metadata) == 0 {
		return json.RawMessage(`{}`), nil
	}
	data, err := json.Marshal(metadata)
	if err != nil {
		return nil, err
	}
	return json.RawMessage(data), nil
}

func (s *Server) syncRolePermissionBindings(ctx context.Context, role storage.Role, previous []string) error {
	newBindings, err := s.buildResolvedBindings(role, role.Permissions)
	if err != nil {
		return err
	}
	oldBindings, err := s.buildResolvedBindings(role, previous)
	if err != nil {
		return err
	}

	if len(newBindings) == 0 && len(oldBindings) == 0 {
		return nil
	}

	namespace := s.bindingNamespace()
	subjectNamespace := namespace
	scopeID, err := roleScopeIdentifier(role)
	if err != nil {
		return err
	}
	subjectObject := fmt.Sprintf("%s:%s", scopeToken(scopeID), role.Code)
	subject := keto.SubjectSet{
		Namespace: subjectNamespace,
		Object:    subjectObject,
		Relation:  s.ketoClient.MembershipRelation(),
	}

	for key, binding := range oldBindings {
		if _, exists := newBindings[key]; exists {
			continue
		}
		if err := s.ketoClient.DeleteSubjectSetRelation(ctx, namespace, binding.Object, binding.Relation, subject); err != nil {
			s.logger.Error("remove role permission binding failed", zapError(err), zap.String("role", role.Code), zap.String("object", binding.Object), zap.String("relation", binding.Relation))
			return err
		}
	}

	for key, binding := range newBindings {
		if _, exists := oldBindings[key]; exists {
			continue
		}
		if err := s.ketoClient.UpsertSubjectSetRelation(ctx, namespace, binding.Object, binding.Relation, subject); err != nil {
			s.logger.Error("add role permission binding failed", zapError(err), zap.String("role", role.Code), zap.String("object", binding.Object), zap.String("relation", binding.Relation))
			return err
		}
	}

	return nil
}

func (s *Server) buildResolvedBindings(role storage.Role, permissions []string) (map[string]resolvedBinding, error) {
	result := make(map[string]resolvedBinding)
	if len(permissions) == 0 {
		return result, nil
	}

	scopeID, err := roleScopeIdentifier(role)
	if err != nil {
		return nil, err
	}
	roleScope := strings.ToLower(strings.TrimSpace(role.Scope))

	for _, perm := range permissions {
		code := strings.ToLower(strings.TrimSpace(perm))
		bindings, ok := permissionBindings[code]
		if !ok {
			continue
		}
		for _, binding := range bindings {
			if binding.Scope != "" && binding.Scope != "any" && binding.Scope != roleScope {
				continue
			}
			object := fmt.Sprintf("%s:%s", scopeToken(scopeID), binding.Object)
			key := binding.Relation + "|" + object
			result[key] = resolvedBinding{Object: object, Relation: binding.Relation}
		}
	}

	return result, nil
}

func (s *Server) bindingNamespace() string {
	if s.namespacePrefix != "" {
		return s.namespacePrefix
	}
	return "Tenant"
}

func roleScopeIdentifier(role storage.Role) (string, error) {
	switch strings.ToLower(strings.TrimSpace(role.Scope)) {
	case "global":
		return "", nil
	case "tenant":
		if role.TenantID == nil {
			return "", fmt.Errorf("tenant role missing tenant_id")
		}
		return role.TenantID.String(), nil
	default:
		return "", fmt.Errorf("unsupported role scope: %s", role.Scope)
	}
}

func (s *Server) removeRoleMemberships(ctx context.Context, role storage.Role) error {
	scopeID, err := roleScopeIdentifier(role)
	if err != nil {
		return err
	}

	const pageSize int32 = 100
	var offset int32

	for {
		assignments, total, err := s.roleRepo.ListAssignments(ctx, role.ID, pageSize, offset)
		if err != nil {
			return fmt.Errorf("list role assignments: %w", err)
		}
		if len(assignments) == 0 {
			break
		}

		for _, assignment := range assignments {
			if err := s.ketoClient.RemoveRole(ctx, scopeID, role.Code, assignment.IdentityID.String()); err != nil {
				s.logger.Error("remove role membership in keto failed",
					zapError(err),
					zap.String("role", role.Code),
					zap.String("member", assignment.IdentityID.String()),
				)
				return err
			}
		}

		offset += pageSize
		if int64(offset) >= total {
			break
		}
	}

	return nil
}
