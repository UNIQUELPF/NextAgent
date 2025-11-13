package server

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net/http"
	"path"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/agents/ruanzhu"
	"github.com/laofa009/next-agent-portal/backend/internal/config"
	"github.com/laofa009/next-agent-portal/backend/internal/keto"
	"github.com/laofa009/next-agent-portal/backend/internal/kratos"
	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
	"github.com/laofa009/next-agent-portal/backend/internal/storage"
)

// Server bundles the HTTP router and supporting services.
type Server struct {
	router           *gin.Engine
	cfg              *config.Config
	logger           *zap.Logger
	ketoClient       *keto.Client
	kratosClient     *kratos.Client
	ruanzhuClient    *ruanzhu.Client
	tenantRepo       *storage.TenantRepository
	groupRepo        *storage.GroupRepository
	roleRepo         *storage.RoleRepository
	permissionRepo   *storage.PermissionRepository
	platformTenantID uuid.UUID
	namespacePrefix  string
	webhookUser      string
	webhookPass      string
}

// New constructs the HTTP server with middleware and routes.
func New(cfg *config.Config, logger *zap.Logger, ketoClient *keto.Client, kratosClient *kratos.Client, ruanzhuClient *ruanzhu.Client, tenantRepo *storage.TenantRepository, groupRepo *storage.GroupRepository, roleRepo *storage.RoleRepository, permissionRepo *storage.PermissionRepository) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.RequestLogger(logger))
	router.Use(middleware.WithIdentity(
		cfg.Oathkeeper.IdentityHeader,
		cfg.Oathkeeper.RolesHeader,
		cfg.Oathkeeper.UserTypeHeader,
		cfg.Oathkeeper.TenantHeader,
	))

	platformTenantID, err := uuid.Parse(strings.TrimSpace(cfg.Platform.TenantID))
	if err != nil {
		logger.Fatal("invalid platform tenant id", zap.Error(err), zap.String("tenant_id", cfg.Platform.TenantID))
	}

	s := &Server{
		router:           router,
		cfg:              cfg,
		logger:           logger,
		ketoClient:       ketoClient,
		kratosClient:     kratosClient,
		ruanzhuClient:    ruanzhuClient,
		tenantRepo:       tenantRepo,
		groupRepo:        groupRepo,
		roleRepo:         roleRepo,
		permissionRepo:   permissionRepo,
		platformTenantID: platformTenantID,
		namespacePrefix:  cfg.Keto.NamespacePrefix,
		webhookUser:      cfg.Kratos.Webhook.Username,
		webhookPass:      cfg.Kratos.Webhook.Password,
	}

	s.registerRoutes()

	return s
}

// Run starts listening for HTTP requests.
func (s *Server) Run() error {
	s.logger.Info("starting http server", zap.String("address", s.cfg.Server.Address))
	return s.router.Run(s.cfg.Server.Address)
}

func (s *Server) registerRoutes() {
	api := s.router.Group("/api")

	api.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	v1 := api.Group("/v1")

	v1.GET("/me", func(c *gin.Context) {
		ctx := middleware.IdentityFromContext(c)
		c.JSON(http.StatusOK, gin.H{
			"subject":   ctx.Subject,
			"user_type": ctx.UserType,
			"tenant_id": ctx.TenantID,
			"roles":     ctx.Roles,
		})
	})

	v1.POST("/authorize", func(c *gin.Context) {
		var payload struct {
			Namespace string `json:"namespace"`
			Object    string `json:"object" binding:"required"`
			Action    string `json:"action" binding:"required"`
			Subject   string `json:"subject"`
			UserType  string `json:"user_type"`
			TenantID  string `json:"tenant_id"`
			RolesCSV  string `json:"roles"`
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload.Object = c.Request.URL.Path
			payload.Action = c.Request.Method
			payload.Namespace = ""
		}

		s.logger.Info("authorize request",
			zap.String("object", payload.Object),
			zap.String("action", payload.Action),
		)

		if payload.Object == "/api/v1/me" && (payload.Action == "" || strings.EqualFold(payload.Action, http.MethodGet)) {
			c.JSON(http.StatusOK, gin.H{"allowed": true})
			return
		}

		identity := middleware.IdentityFromContext(c)
		if identity.Subject == "" {
			identity.Subject = strings.TrimSpace(payload.Subject)
			identity.UserType = strings.TrimSpace(payload.UserType)
			identity.TenantID = strings.TrimSpace(payload.TenantID)
			identity.Roles = parseRolesCSV(payload.RolesCSV)
		}
		if identity.Subject == "" {
			c.JSON(http.StatusForbidden, gin.H{"allowed": false, "reason": "missing subject"})
			return
		}

		if isPlatformAdmin(identity) {
			c.JSON(http.StatusOK, gin.H{"allowed": true})
			return
		}

		namespace, object := resolveNamespaceAndObject(s.namespacePrefix, identity.TenantID, payload.Namespace, payload.Object)

		ok, err := s.ketoClient.Check(c.Request.Context(), namespace, object, payload.Action, identity.Subject)
		if err != nil {
			s.logger.Error("keto check failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "authorization service unavailable"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"allowed": ok})
	})

	api.POST("/internal/hooks/kratos/registration",
		s.requireWebhookAuth(),
		s.handleRegistrationHook,
	)

	s.registerTenantRoutes(v1)
	s.registerGroupRoutes(v1)
	s.registerRoleRoutes(v1)
	s.registerPermissionRoutes(v1)
	s.registerRuanzhuRoutes(v1)
}

func resolveNamespaceAndObject(prefix, tenantID, overrideNamespace, object string) (string, string) {
	ns := prefix
	if ns == "" {
		ns = "Tenant"
	}

	if overrideNamespace != "" {
		return overrideNamespace, normalizeObject(object)
	}

	scope := tenantID
	if scope == "" {
		scope = "global"
	}

	finalObject := normalizeObject(object)

	return ns, fmt.Sprintf("%s:%s", scopeToken(scope), finalObject)
}

var uuidSegmentRegex = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

func normalizeObject(object string) string {
	if object == "" {
		return "/"
	}
	clean := strings.TrimPrefix(path.Clean("/"+object), "/")
	if clean == "" {
		return "/"
	}

	parts := strings.Split(clean, "/")
	for i, segment := range parts {
		if uuidSegmentRegex.MatchString(segment) {
			parts[i] = ":uuid"
		}
	}

	return strings.Join(parts, "/")
}

func isPlatformAdmin(ctx *middleware.IdentityContext) bool {
	if ctx == nil {
		return false
	}
	for _, role := range ctx.Roles {
		switch strings.ToLower(role) {
		case "platform_admin", "platform-admin":
			return true
		}
	}
	return false
}

func scopeToken(scope string) string {
	if scope == "" {
		return "global"
	}
	return scope
}

func parseRolesCSV(raw string) []string {
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

func (s *Server) requireWebhookAuth() gin.HandlerFunc {
	expectedUser := s.webhookUser
	expectedPass := s.webhookPass

	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Basic ") {
			s.logger.Warn("missing or invalid auth header", zap.String("authorization", auth))
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		raw := strings.TrimPrefix(auth, "Basic ")
		decoded, err := base64.StdEncoding.DecodeString(raw)
		if err != nil {
			s.logger.Warn("invalid basic auth header", zap.Error(err), zap.String("authorization", auth), zap.String("raw", raw))
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		parts := strings.SplitN(string(decoded), ":", 2)
		if len(parts) != 2 {
			s.logger.Warn("basic auth parts malformed", zap.String("decoded", string(decoded)))
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userMatch := subtle.ConstantTimeCompare([]byte(parts[0]), []byte(expectedUser)) == 1
		passMatch := subtle.ConstantTimeCompare([]byte(parts[1]), []byte(expectedPass)) == 1
		if !userMatch || !passMatch {
			s.logger.Warn("basic auth credentials mismatch", zap.String("user", parts[0]), zap.String("provided_pass", parts[1]), zap.String("expected_user", expectedUser), zap.String("expected_pass", expectedPass))
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Next()
	}
}

type registrationHookPayload struct {
	Identity struct {
		ID     string `json:"id"`
		Traits struct {
			Phone    string   `json:"phone"`
			UserType string   `json:"user_type"`
			TenantID string   `json:"tenant_id"`
			Roles    []string `json:"roles"`
		} `json:"traits"`
	} `json:"identity"`
}

func (s *Server) handleRegistrationHook(c *gin.Context) {
	var payload registrationHookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		s.logger.Warn("invalid registration payload", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if payload.Identity.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing identity id"})
		return
	}

	roles := payload.Identity.Traits.Roles
	if len(roles) == 0 {
		s.logger.Info("registration hook executed without roles", zap.String("identity", payload.Identity.ID))
		c.Status(http.StatusNoContent)
		return
	}

	for _, role := range roles {
		if role == "" {
			continue
		}
		if err := s.ketoClient.AssignRole(c.Request.Context(), payload.Identity.Traits.TenantID, role, payload.Identity.ID); err != nil {
			s.logger.Error("assign role failed",
				zap.String("identity", payload.Identity.ID),
				zap.String("role", role),
				zap.Error(err),
			)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign role"})
			return
		}
	}

	s.logger.Info("assigned roles for identity",
		zap.String("identity", payload.Identity.ID),
		zap.Strings("roles", roles),
		zap.String("tenant", payload.Identity.Traits.TenantID),
	)
	c.Status(http.StatusNoContent)
}
