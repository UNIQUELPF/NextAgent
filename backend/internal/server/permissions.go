package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
)

type permissionResponse struct {
	Code        string `json:"code"`
	Scope       string `json:"scope"`
	Description string `json:"description"`
}

func (s *Server) registerPermissionRoutes(group *gin.RouterGroup) {
	group.GET("/permissions", s.handleListPermissions)
}

func (s *Server) handleListPermissions(c *gin.Context) {
	identity := middleware.IdentityFromContext(c)
	if identity == nil || identity.Subject == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	if !isPlatformAdmin(identity) && !hasAnyRole(identity, "tenant_admin", "tenant-admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	perms, err := s.permissionRepo.ListPermissions(c.Request.Context())
	if err != nil {
		s.logger.Error("list permissions failed", zapError(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load permissions"})
		return
	}

	response := make([]permissionResponse, 0, len(perms))
	for _, perm := range perms {
		response = append(response, permissionResponse{
			Code:        perm.Code,
			Scope:       perm.Scope,
			Description: perm.Description,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": response})
}
