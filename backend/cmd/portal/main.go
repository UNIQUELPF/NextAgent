package main

import (
	"log"
	"os"

	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/config"
	"github.com/laofa009/next-agent-portal/backend/internal/keto"
	"github.com/laofa009/next-agent-portal/backend/internal/logging"
	"github.com/laofa009/next-agent-portal/backend/internal/server"
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

	srv := server.New(cfg, logger, ketoClient)

	if err := srv.Run(); err != nil {
		logger.Fatal("server stopped with error", zap.Error(err))
	}
}
