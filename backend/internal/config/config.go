package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/knadh/koanf"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/file"
)

const (
	envPrefix     = "PORTAL"
	envDelimiter  = "__"
	defaultConfig = "configs/app.yaml"
)

// Config contains runtime settings loaded from file and environment variables.
type Config struct {
	Server struct {
		Address string `koanf:"address"`
	} `koanf:"server"`

	Platform struct {
		TenantID   string `koanf:"tenant_id"`
		TenantCode string `koanf:"tenant_code"`
	} `koanf:"platform"`

	Logging struct {
		Level       string `koanf:"level"`
		Development bool   `koanf:"development"`
	} `koanf:"logging"`

	Oathkeeper struct {
		IdentityHeader string `koanf:"identity_header"`
		RolesHeader    string `koanf:"roles_header"`
		UserTypeHeader string `koanf:"user_type_header"`
		TenantHeader   string `koanf:"tenant_header"`
	} `koanf:"oathkeeper"`

	Database struct {
		DSN             string        `koanf:"dsn"`
		MaxOpenConns    int           `koanf:"max_open_conns"`
		MaxIdleConns    int           `koanf:"max_idle_conns"`
		ConnMaxLifetime time.Duration `koanf:"conn_max_lifetime"`
	} `koanf:"database"`

	Keto struct {
		ReadRemote         string        `koanf:"read_remote"`
		WriteRemote        string        `koanf:"write_remote"`
		NamespacePrefix    string        `koanf:"namespace_prefix"`
		PermissionRelation string        `koanf:"permission_relation"`
		MembershipRelation string        `koanf:"membership_relation"`
		RequestTimeout     time.Duration `koanf:"request_timeout"`
	} `koanf:"keto"`

	Kratos struct {
		AdminURL  string        `koanf:"admin_url"`
		PublicURL string        `koanf:"public_url"`
		SchemaID  string        `koanf:"schema_id"`
		Timeout   time.Duration `koanf:"timeout"`
		Webhook   struct {
			Username string `koanf:"username"`
			Password string `koanf:"password"`
		} `koanf:"webhook"`
	} `koanf:"kratos"`

	Agents struct {
		Ruanzhu struct {
			BaseURL  string        `koanf:"base_url"`
			APIToken string        `koanf:"api_token"`
			Timeout  time.Duration `koanf:"timeout"`
		} `koanf:"ruanzhu"`
	} `koanf:"agents"`
}

// Load reads configuration from disk and overlays environment variables.
func Load(paths ...string) (*Config, error) {
	k := koanf.New(envDelimiter)

	filename := resolveConfigPath(paths)

	if err := k.Load(file.Provider(filename), yaml.Parser()); err != nil {
		return nil, fmt.Errorf("load config file: %w", err)
	}

	envProvider := env.Provider(envPrefix, envDelimiter, func(s string) string {
		path := strings.TrimPrefix(s, envPrefix+envDelimiter)
		path = strings.ReplaceAll(path, envDelimiter, ".")
		path = strings.ReplaceAll(path, "_", "-")
		return strings.ToLower(path)
	})

	if err := k.Load(envProvider, nil); err != nil {
		return nil, fmt.Errorf("load env overrides: %w", err)
	}

	var cfg Config
	if err := k.Unmarshal("", &cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	return &cfg, nil
}

func resolveConfigPath(paths []string) string {
	if len(paths) > 0 && paths[0] != "" {
		return paths[0]
	}
	if fromEnv := os.Getenv(envPrefix + envDelimiter + "CONFIG" + envDelimiter + "FILE"); fromEnv != "" {
		return fromEnv
	}
	return defaultConfig
}
