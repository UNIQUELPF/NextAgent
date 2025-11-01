package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
	"github.com/laofa009/next-agent-portal/backend/internal/storage"
)

const (
	defaultPage     = 1
	defaultPageSize = 20
	maxPageSize     = 100
)

var tenantCodePattern = regexp.MustCompile(`^[A-Za-z0-9]{1,10}$`)

func (s *Server) registerTenantRoutes(group *gin.RouterGroup) {
	group.GET("/tenants", s.handleListTenants)
	group.POST("/tenants", s.handleCreateTenant)
	group.GET("/tenants/:id", s.handleGetTenant)
	group.PUT("/tenants/:id", s.handleUpdateTenant)
	group.DELETE("/tenants/:id", s.handleDeleteTenant)
}

type tenantResponse struct {
	ID           uuid.UUID      `json:"id"`
	Code         string         `json:"code"`
	Name         string         `json:"name"`
	Status       string         `json:"status"`
	ContactName  *string        `json:"contactName,omitempty"`
	ContactPhone *string        `json:"contactPhone,omitempty"`
	Metadata     map[string]any `json:"metadata"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

type listTenantsResponse struct {
	Items    []tenantResponse `json:"items"`
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	PageSize int              `json:"pageSize"`
}

type tenantPayload struct {
	Code         string         `json:"code" binding:"required"`
	Name         string         `json:"name" binding:"required"`
	Status       string         `json:"status"`
	ContactName  *string        `json:"contactName"`
	ContactPhone *string        `json:"contactPhone"`
	Metadata     map[string]any `json:"metadata"`
}

func (s *Server) handleListTenants(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	page := parsePositiveInt(c.Query("page"), defaultPage)
	pageSize := parsePositiveInt(c.Query("page_size"), defaultPageSize)
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}

	search := strings.TrimSpace(c.Query("search"))
	statusParam := strings.ToLower(strings.TrimSpace(c.Query("status")))
	if statusParam != "active" && statusParam != "inactive" {
		statusParam = ""
	}

	items, total, err := s.tenantRepo.ListTenants(
		c.Request.Context(),
		search,
		statusParam,
		int32(pageSize),
		int32((page-1)*pageSize),
	)
	if err != nil {
		s.logger.Error("list tenants failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tenants"})
		return
	}

	c.JSON(http.StatusOK, listTenantsResponse{
		Items:    mapTenants(items),
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func (s *Server) handleCreateTenant(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	var payload tenantPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	code := strings.TrimSpace(payload.Code)
	if !tenantCodePattern.MatchString(code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant code must be 1-10 alphanumeric characters"})
		return
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant name is required"})
		return
	}

	tenant := storage.Tenant{
		Code:         code,
		Name:         name,
		Status:       normalizeStatus(payload.Status),
		ContactName:  payload.ContactName,
		ContactPhone: payload.ContactPhone,
	}

	if len(payload.Metadata) > 0 {
		raw, err := json.Marshal(payload.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
			return
		}
		tenant.Metadata = raw
	}

	created, err := s.tenantRepo.CreateTenant(c.Request.Context(), tenant)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant code already exists"})
			return
		}
		s.logger.Error("create tenant failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tenant"})
		return
	}

	c.JSON(http.StatusCreated, mapTenant(created))
}

func (s *Server) handleGetTenant(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant id"})
		return
	}

	tenant, err := s.tenantRepo.GetTenant(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, storage.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
			return
		}
		s.logger.Error("get tenant failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load tenant"})
		return
	}

	c.JSON(http.StatusOK, mapTenant(tenant))
}

func (s *Server) handleUpdateTenant(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant id"})
		return
	}

	var payload tenantPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	code := strings.TrimSpace(payload.Code)
	if !tenantCodePattern.MatchString(code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant code must be 1-10 alphanumeric characters"})
		return
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tenant name is required"})
		return
	}

	tenant := storage.Tenant{
		ID:           id,
		Code:         code,
		Name:         name,
		Status:       normalizeStatus(payload.Status),
		ContactName:  payload.ContactName,
		ContactPhone: payload.ContactPhone,
	}

	if len(payload.Metadata) > 0 {
		raw, err := json.Marshal(payload.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "metadata must be valid JSON"})
			return
		}
		tenant.Metadata = raw
	}

	updated, err := s.tenantRepo.UpdateTenant(c.Request.Context(), tenant)
	if err != nil {
		if errors.Is(err, storage.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
			return
		}
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant code already exists"})
			return
		}
		s.logger.Error("update tenant failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update tenant"})
		return
	}

	c.JSON(http.StatusOK, mapTenant(updated))
}

func (s *Server) handleDeleteTenant(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tenant id"})
		return
	}

	if err := s.tenantRepo.DeleteTenant(c.Request.Context(), id); err != nil {
		if errors.Is(err, storage.ErrTenantNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
			return
		}
		s.logger.Error("delete tenant failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete tenant"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (s *Server) requireAdmin(c *gin.Context) bool {
	ctx := middleware.IdentityFromContext(c)
	if ctx == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return false
	}
	for _, role := range ctx.Roles {
		switch strings.ToLower(role) {
		case "platform_admin", "platform-admin", "tenant_admin", "tenant-admin":
			return true
		}
	}
	c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	return false
}

func parsePositiveInt(value string, fallback int) int {
	if value == "" {
		return fallback
	}
	v, err := strconv.Atoi(value)
	if err != nil || v <= 0 {
		return fallback
	}
	return v
}

func normalizeStatus(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "inactive":
		return "inactive"
	default:
		return "active"
	}
}

func mapTenants(items []storage.Tenant) []tenantResponse {
	result := make([]tenantResponse, 0, len(items))
	for _, item := range items {
		result = append(result, mapTenant(item))
	}
	return result
}

func mapTenant(t storage.Tenant) tenantResponse {
	var metadata map[string]any
	if len(t.Metadata) > 0 {
		if err := json.Unmarshal(t.Metadata, &metadata); err != nil {
			metadata = map[string]any{}
		}
	} else {
		metadata = map[string]any{}
	}

	return tenantResponse{
		ID:           t.ID,
		Code:         t.Code,
		Name:         t.Name,
		Status:       t.Status,
		ContactName:  t.ContactName,
		ContactPhone: t.ContactPhone,
		Metadata:     metadata,
		CreatedAt:    t.CreatedAt,
		UpdatedAt:    t.UpdatedAt,
	}
}

func zapError(err error) zap.Field {
	return zap.Error(err)
}
