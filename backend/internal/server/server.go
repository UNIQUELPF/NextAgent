package server

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/config"
	"github.com/laofa009/next-agent-portal/backend/internal/keto"
	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
)

// Server bundles the HTTP router and supporting services.
type Server struct {
	router     *gin.Engine
	cfg        *config.Config
	logger     *zap.Logger
	ketoClient *keto.Client
	namespacePrefix string
	webhookUser string
	webhookPass string
}

// New constructs the HTTP server with middleware and routes.
func New(cfg *config.Config, logger *zap.Logger, ketoClient *keto.Client) *Server {
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

	s := &Server{
		router:     router,
		cfg:        cfg,
		logger:     logger,
		ketoClient: ketoClient,
		namespacePrefix: cfg.Keto.NamespacePrefix,
		webhookUser: cfg.Kratos.Webhook.Username,
		webhookPass: cfg.Kratos.Webhook.Password,
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
	s.router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	s.router.GET("/v1/me", func(c *gin.Context) {
		ctx := middleware.IdentityFromContext(c)
		c.JSON(http.StatusOK, gin.H{
			"subject":   ctx.Subject,
			"user_type": ctx.UserType,
			"tenant_id": ctx.TenantID,
			"roles":     ctx.Roles,
		})
	})

	s.router.POST("/v1/authorize", func(c *gin.Context) {
		var payload struct {
			Namespace string `json:"namespace"`
			Object    string `json:"object" binding:"required"`
			Action    string `json:"action" binding:"required"`
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		identity := middleware.IdentityFromContext(c)
		if identity.Subject == "" {
			c.JSON(http.StatusForbidden, gin.H{"allowed": false, "reason": "missing subject"})
			return
		}

		namespace := fmt.Sprintf("%s:global", s.namespacePrefix)
		if identity.TenantID != "" {
			namespace = fmt.Sprintf("%s:%s", s.namespacePrefix, identity.TenantID)
		} else if payload.Namespace != "" {
			namespace = payload.Namespace
		}

		ok, err := s.ketoClient.Check(c.Request.Context(), namespace, payload.Object, payload.Action, identity.Subject)
		if err != nil {
			s.logger.Error("keto check failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "authorization service unavailable"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"allowed": ok})
	})

	s.router.POST("/internal/hooks/kratos/registration",
		s.requireWebhookAuth(),
		s.handleRegistrationHook,
	)
}

func (s *Server) requireWebhookAuth() gin.HandlerFunc {
	expectedUser := s.webhookUser
	expectedPass := s.webhookPass

	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Basic ") {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		decoded, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(auth, "Basic "))
		if err != nil {
			s.logger.Warn("invalid basic auth header", zap.Error(err))
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		parts := strings.SplitN(string(decoded), ":", 2)
		if len(parts) != 2 {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userMatch := subtle.ConstantTimeCompare([]byte(parts[0]), []byte(expectedUser)) == 1
		passMatch := subtle.ConstantTimeCompare([]byte(parts[1]), []byte(expectedPass)) == 1
		if !userMatch || !passMatch {
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
