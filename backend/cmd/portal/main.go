package main

import (
	"context"
	"log"
	"os"

	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/config"
	"github.com/laofa009/next-agent-portal/backend/internal/keto"
	"github.com/laofa009/next-agent-portal/backend/internal/kratos"
	"github.com/laofa009/next-agent-portal/backend/internal/logging"
	"github.com/laofa009/next-agent-portal/backend/internal/server"
	"github.com/laofa009/next-agent-portal/backend/internal/storage"
	"github.com/laofa009/next-agent-portal/backend/internal/storage/sqldb"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logger, err := logging.New(cfg)
	if err != nil {
		log.Fatalf("init logger: %v", err)
	}
	defer func(l *zap.Logger) {
		_ = l.Sync()
	}(logger)

	ketoClient, err := keto.NewClient(keto.Options{
		ReadRemote:         cfg.Keto.ReadRemote,
		WriteRemote:        cfg.Keto.WriteRemote,
		PermissionRelation: cfg.Keto.PermissionRelation,
		MembershipRelation: cfg.Keto.MembershipRelation,
		NamespacePrefix:    cfg.Keto.NamespacePrefix,
		Timeout:            cfg.Keto.RequestTimeout,
	}, logger)
	if err != nil {
		logger.Fatal("init keto client", zap.Error(err))
		os.Exit(1)
	}

	kratosClient, err := kratos.NewClient(kratos.Options{
		AdminURL:  cfg.Kratos.AdminURL,
		PublicURL: cfg.Kratos.PublicURL,
		SchemaID:  cfg.Kratos.SchemaID,
		Timeout:   cfg.Kratos.Timeout,
	}, logger)
	if err != nil {
		logger.Fatal("init kratos client", zap.Error(err))
		os.Exit(1)
	}

	ctx := context.Background()
	pool, err := storage.NewPool(ctx, storage.PoolConfig{
		DSN:             cfg.Database.DSN,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
	})
	if err != nil {
		logger.Fatal("init postgres pool", zap.Error(err))
		os.Exit(1)
	}
	defer pool.Close()

	queries := sqldb.New(pool)
	tenantRepo := storage.NewTenantRepository(queries)
	groupRepo := storage.NewGroupRepository(queries)
	roleRepo := storage.NewRoleRepository(pool, queries)
	permissionRepo := storage.NewPermissionRepository(queries)

	srv := server.New(cfg, logger, ketoClient, kratosClient, tenantRepo, groupRepo, roleRepo, permissionRepo)

	if err := srv.Run(); err != nil {
		logger.Fatal("server stopped with error", zap.Error(err))
	}
}
