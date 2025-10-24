package logging

import (
	"fmt"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/laofa009/next-agent-portal/backend/internal/config"
)

// New builds a zap logger according to configuration.
func New(cfg *config.Config) (*zap.Logger, error) {
	level := zapcore.InfoLevel
	if err := level.UnmarshalText([]byte(strings.ToLower(cfg.Logging.Level))); err != nil {
		return nil, fmt.Errorf("parse log level: %w", err)
	}

	zapCfg := zap.NewProductionConfig()
	if cfg.Logging.Development {
		zapCfg = zap.NewDevelopmentConfig()
	}
	zapCfg.Level = zap.NewAtomicLevelAt(level)
	zapCfg.Encoding = "json"

	return zapCfg.Build()
}
