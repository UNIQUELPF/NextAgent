DROP INDEX IF EXISTS tenants_created_at_idx;
DROP INDEX IF EXISTS tenants_name_idx;
DROP TRIGGER IF EXISTS trigger_set_tenants_updated_at ON tenants;
DROP FUNCTION IF EXISTS set_updated_at;
DROP TABLE IF EXISTS tenants;
