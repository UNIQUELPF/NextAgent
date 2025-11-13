CREATE ROLE kratos LOGIN PASSWORD 'kratos';
CREATE ROLE keto LOGIN PASSWORD 'keto';
CREATE ROLE portal LOGIN PASSWORD 'portal';

CREATE DATABASE kratos OWNER kratos;
CREATE DATABASE keto OWNER keto;
CREATE DATABASE portal OWNER portal;

DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ruanzhu'
   ) THEN
      CREATE ROLE ruanzhu LOGIN PASSWORD 'ruanzhu';
   END IF;
END
$$;

SELECT 'CREATE DATABASE ruanzhu OWNER ruanzhu'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'ruanzhu'
);
\gexec

\connect ruanzhu ruanzhu

ALTER SCHEMA public OWNER TO ruanzhu;
GRANT ALL ON SCHEMA public TO ruanzhu;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ruanzhu;

BEGIN;

DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS model_configs CASCADE;

CREATE TABLE IF NOT EXISTS model_configs (
    id SERIAL PRIMARY KEY,
    config_alias TEXT NOT NULL,
    model_name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_model_configs_alias ON model_configs(config_alias);

CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    software_name TEXT NOT NULL,
    config_id INTEGER REFERENCES model_configs(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING',
    current_stage TEXT,
    progress INTEGER DEFAULT 0,
    files JSONB,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_config_id ON tasks(config_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

COMMIT;
