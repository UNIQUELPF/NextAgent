CREATE TABLE permissions (
    code        TEXT PRIMARY KEY,
    scope       TEXT NOT NULL CHECK (scope IN ('global', 'tenant', 'any')),
    description TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_set_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

INSERT INTO permissions (code, scope, description) VALUES
    ('tenant.manage', 'global', '创建、编辑、停用租户'),
    ('tenant.view', 'global', '查看租户列表与详情'),
    ('role.manage', 'tenant', '管理角色定义与权限集'),
    ('role.assign', 'tenant', '为成员分配 / 取消角色'),
    ('role.view', 'tenant', '查看角色列表与详情'),
    ('group.manage', 'tenant', '维护组织架构与部门属性'),
    ('group.view', 'tenant', '查看组织架构与成员列表'),
    ('group.member.manage', 'tenant', '调整部门成员、设置主职'),
    ('user.invite', 'tenant', '邀请或创建内部成员'),
    ('user.disable', 'tenant', '停用 / 启用内部成员'),
    ('user.view', 'tenant', '查看内部成员信息')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE roles (
    id          UUID PRIMARY KEY,
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    scope       TEXT NOT NULL CHECK (scope IN ('global', 'tenant')),
    code        TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version     INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT roles_scope_tenant_check
        CHECK (
            (scope = 'tenant' AND tenant_id IS NOT NULL)
            OR (scope = 'global' AND tenant_id IS NULL)
        )
);

CREATE UNIQUE INDEX roles_unique_global_code
    ON roles (code)
    WHERE tenant_id IS NULL;

CREATE UNIQUE INDEX roles_unique_tenant_code
    ON roles (tenant_id, code);

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_code)
);

CREATE TABLE role_assignments (
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    identity_id UUID NOT NULL,
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, identity_id)
);

CREATE INDEX role_assignments_identity_idx
    ON role_assignments (identity_id);

CREATE TRIGGER trigger_set_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
