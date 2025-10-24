package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

type identityKey string

const (
	// ContextIdentityKey is used to store the identity context in gin.Context.
	ContextIdentityKey identityKey = "portal.identity"
)

// IdentityContext carries authenticated user information forwarded by Oathkeeper.
type IdentityContext struct {
	Subject  string
	UserType string
	TenantID string
	Roles    []string
}

// WithIdentity captures Oathkeeper session headers and exposes them to downstream handlers.
func WithIdentity(identityHeader, roleHeader, userTypeHeader, tenantHeader string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := &IdentityContext{
			Subject:  strings.TrimSpace(c.GetHeader(identityHeader)),
			UserType: strings.TrimSpace(c.GetHeader(userTypeHeader)),
			TenantID: strings.TrimSpace(c.GetHeader(tenantHeader)),
			Roles:    normalizeRoles(c.GetHeader(roleHeader)),
		}
		c.Set(string(ContextIdentityKey), ctx)
		c.Next()
	}
}

// IdentityFromContext extracts the identity context, returning a zero value if absent.
func IdentityFromContext(c *gin.Context) *IdentityContext {
	if v, ok := c.Get(string(ContextIdentityKey)); ok {
		if ctx, ok := v.(*IdentityContext); ok {
			return ctx
		}
	}
	return &IdentityContext{}
}

func normalizeRoles(raw string) []string {
	if raw == "" {
		return []string{}
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	seen := make(map[string]struct{})
	for _, part := range parts {
		normalized := strings.TrimSpace(part)
		if normalized == "" {
			continue
		}
		key := strings.ToLower(normalized)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, normalized)
	}
	return out
}

