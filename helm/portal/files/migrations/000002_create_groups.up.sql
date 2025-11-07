CREATE TABLE tenant_groups (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID,
    sort_order INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tenant_groups_unique_code UNIQUE (tenant_id, code),
    CONSTRAINT tenant_groups_parent_fk FOREIGN KEY (parent_id) REFERENCES tenant_groups(id) ON DELETE RESTRICT
);

CREATE INDEX tenant_groups_tenant_idx ON tenant_groups (tenant_id);
CREATE INDEX tenant_groups_parent_idx ON tenant_groups (parent_id);

CREATE TRIGGER trigger_set_tenant_groups_updated_at
BEFORE UPDATE ON tenant_groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE group_members (
    group_id UUID NOT NULL REFERENCES tenant_groups(id) ON DELETE CASCADE,
    identity_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    title TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, identity_id)
);

CREATE INDEX group_members_tenant_idx ON group_members (tenant_id);
CREATE INDEX group_members_identity_idx ON group_members (identity_id);
CREATE INDEX group_members_display_name_idx ON group_members (tenant_id, lower(display_name));
CREATE INDEX group_members_phone_idx ON group_members (tenant_id, phone);

CREATE TRIGGER trigger_set_group_members_updated_at
BEFORE UPDATE ON group_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
