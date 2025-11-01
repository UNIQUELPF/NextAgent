"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type RoleScope = "global" | "tenant";

interface RoleRow {
  id: string;
  tenantId?: string | null;
  scope: RoleScope;
  code: string;
  name: string;
  description?: string | null;
  metadata: Record<string, unknown>;
  permissions: string[];
  assignedCount: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface RoleListResponse {
  items: RoleRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface PermissionDictItem {
  code: string;
  scope: string;
  description: string;
}

interface PermissionListResponse {
  items: PermissionDictItem[];
}

interface RoleMember {
  identityId: string;
  tenantId?: string | null;
  assignedAt: string;
}

interface RoleMemberListResponse {
  items: RoleMember[];
  total: number;
  page: number;
  pageSize: number;
}

type RoleFormMode = "create" | "edit";

export function RoleManagement() {
  const [scopeFilter, setScopeFilter] = useState<"" | RoleScope>("");
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [permissionDict, setPermissionDict] = useState<PermissionDictItem[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<RoleFormMode>("create");
  const [activeRole, setActiveRole] = useState<RoleRow | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);

  const [memberRole, setMemberRole] = useState<RoleRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRoles = useCallback(
    async (options?: { signal?: AbortSignal }) => {
      const signal = options?.signal;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          include: "permissions",
          page: "1",
          page_size: "100",
        });
        if (scopeFilter) {
          params.set("scope", scopeFilter);
        }

        const data = await apiFetch<RoleListResponse>(`/api/v1/roles?${params.toString()}`, {
          signal,
        });

        setRoles(data.items);
        setTotal(data.total);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "加载角色失败");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [scopeFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRoles({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchRoles, reloadToken]);

  useEffect(() => {
    const controller = new AbortController();
    setPermissionError(null);
    apiFetch<PermissionListResponse>("/api/v1/permissions", { signal: controller.signal })
      .then((data) => {
        setPermissionDict(data.items);
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") {
          return;
        }
        setPermissionError(err instanceof Error ? err.message : "加载权限字典失败");
      });
    return () => controller.abort();
  }, []);

  const availableRoles = useMemo(() => roles, [roles]);

  const handleOpenCreate = () => {
    setFormMode("create");
    setActiveRole(null);
    setShowRoleForm(true);
  };

  const handleOpenEdit = (role: RoleRow) => {
    setFormMode("edit");
    setActiveRole(role);
    setShowRoleForm(true);
  };

  const handleOpenMembers = (role: RoleRow) => {
    setMemberRole(role);
  };

  const handleFormSuccess = () => {
    setShowRoleForm(false);
    setActiveRole(null);
    setReloadToken((token) => token + 1);
  };

  const handleDelete = async (role: RoleRow) => {
    const confirmed = window.confirm(`确定要删除角色「${role.code}」吗？`);
    if (!confirmed) {
      return;
    }
    setDeletingId(role.id);
    try {
      await apiFetch<void>(`/api/v1/roles/${role.id}`, {
        method: "DELETE",
      });
      setReloadToken((token) => token + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除角色失败");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMembersChanged = () => {
    setReloadToken((token) => token + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border/70 bg-background/70 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">角色定义</h2>
            <p className="text-sm text-muted-foreground">
              使用 Keto 维护角色与权限关系，支持租户维度自定义与平台统一模板。
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadToken((token) => token + 1)}
              disabled={loading}
            >
              刷新数据
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              新建角色
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">作用域</span>
            <select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value as RoleScope | "")}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value="">全部</option>
              <option value="global">平台级</option>
              <option value="tenant">租户级</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-border/70">
          {error ? (
            <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <table className="min-w-full divide-y divide-border/60 text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">角色标识</th>
                <th className="px-4 py-3 font-medium">描述</th>
                <th className="px-4 py-3 font-medium">作用域</th>
                <th className="px-4 py-3 font-medium">权限点</th>
                <th className="px-4 py-3 font-medium text-right">已分配</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-background/70">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                    正在加载角色...
                  </td>
                </tr>
              ) : availableRoles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                    暂无角色
                  </td>
                </tr>
              ) : (
                availableRoles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{role.code}</div>
                      <div className="text-xs text-muted-foreground">ID: {role.id}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {role.description ?? "--"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {role.scope === "global" ? "平台级" : "租户级"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">暂无</span>
                        ) : (
                          role.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                            >
                              {perm}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {role.assignedCount} 人
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenMembers(role)}
                        >
                          成员管理
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(role)}>
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(role)}
                          disabled={deletingId === role.id}
                        >
                          {deletingId === role.id ? "删除中..." : "删除"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <aside className="space-y-4 rounded-lg border border-border/70 bg-background/70 p-4 text-sm">
          <div className="text-xs text-muted-foreground">共 {total} 条记录</div>
          <div>
            <h3 className="text-sm font-medium text-foreground">权限字典</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              后端可通过 Keto relation tuples 建模，前端使用该字典渲染标签。
            </p>
          </div>
          {permissionError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {permissionError}
            </div>
          ) : (
            <ul className="space-y-3">
              {permissionDict.map((item) => (
                <li key={item.code} className="rounded-md border border-border/50 p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-primary">
                    {item.code}
                    <span className="ml-2 rounded bg-muted px-1.5 py-px text-[10px] uppercase text-muted-foreground">
                      {item.scope === "global"
                        ? "平台"
                        : item.scope === "tenant"
                          ? "租户"
                          : item.scope}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground">{item.description}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {showRoleForm ? (
        <RoleForm
          mode={formMode}
          role={formMode === "edit" ? activeRole : null}
          permissions={permissionDict}
          onCancel={() => {
            setShowRoleForm(false);
            setActiveRole(null);
          }}
          onSuccess={handleFormSuccess}
        />
      ) : null}

      {memberRole ? (
        <RoleMemberPanel
          role={memberRole}
          onClose={() => setMemberRole(null)}
          onChanged={handleMembersChanged}
        />
      ) : null}
    </section>
  );
}

interface RoleFormProps {
  mode: RoleFormMode;
  role: RoleRow | null;
  permissions: PermissionDictItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

function RoleForm({ mode, role, permissions, onSuccess, onCancel }: RoleFormProps) {
  const [scope, setScope] = useState<RoleScope>(role?.scope ?? "tenant");
  const [tenantId, setTenantId] = useState(role?.tenantId ?? "");
  const [code, setCode] = useState(role?.code ?? "");
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [metadata, setMetadata] = useState(() =>
    role?.metadata && Object.keys(role.metadata).length
      ? JSON.stringify(role.metadata, null, 2)
      : "",
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScope(role?.scope ?? "tenant");
    setTenantId(role?.tenantId ?? "");
    setCode(role?.code ?? "");
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setMetadata(
      role?.metadata && Object.keys(role.metadata).length
        ? JSON.stringify(role.metadata, null, 2)
        : "",
    );
    setSelectedPermissions(role?.permissions ?? []);
    setError(null);
  }, [role, mode]);

  const allowedPermissions = useMemo(() => {
    const scopeKey = scope;
    return permissions.filter(
      (item) =>
        item.scope === "any" ||
        item.scope === "" ||
        item.scope === scopeKey ||
        (scopeKey === "global" && item.scope === "global"),
    );
  }, [permissions, scope]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDictItem[]> = {};
    allowedPermissions.forEach((item) => {
      const key =
        item.scope === "global"
          ? "平台级"
          : item.scope === "tenant"
            ? "租户级"
            : item.scope || "其他";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [allowedPermissions]);

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    if (!trimmedCode) {
      setError("角色编码为必填项");
      return;
    }
    if (!trimmedName) {
      setError("角色名称为必填项");
      return;
    }
    if (scope === "tenant" && !tenantId.trim()) {
      setError("租户角色需要填写 tenantId");
      return;
    }

    let metadataObj: Record<string, unknown> = {};
    if (metadata.trim()) {
      try {
        const parsed = JSON.parse(metadata);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("metadata must be json object");
        }
        metadataObj = parsed as Record<string, unknown>;
      } catch (err) {
        setError(err instanceof Error ? err.message : "metadata 需为合法 JSON 对象");
        return;
      }
    }

    const payload: Record<string, unknown> = {
      scope,
      code: trimmedCode,
      name: trimmedName,
      description: description.trim() || undefined,
      permissions: selectedPermissions,
      metadata: metadataObj,
    };
    if (scope === "tenant") {
      payload.tenant_id = tenantId.trim();
    }

    const isEdit = mode === "edit" && role;
    const endpoint = isEdit ? `/api/v1/roles/${role!.id}` : "/api/v1/roles";
    const method = isEdit ? "PUT" : "POST";

    setSubmitting(true);
    try {
      await apiFetch<RoleRow>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存角色失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {mode === "create" ? "新建角色" : `编辑角色：${role?.code ?? ""}`}
          </h3>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
              取消
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">作用域</span>
            <select
              value={scope}
              onChange={(event) => {
                const nextScope = event.target.value as RoleScope;
                setScope(nextScope);
                if (nextScope === "global") {
                  setTenantId("");
                }
                setSelectedPermissions((prev) =>
                  prev.filter((perm) =>
                    permissions.some(
                      (item) =>
                        item.code === perm &&
                        (item.scope === "any" ||
                          item.scope === "" ||
                          item.scope === nextScope),
                    ),
                  ),
                );
              }}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              disabled={mode === "edit"}
            >
              <option value="tenant">租户级</option>
              <option value="global">平台级</option>
            </select>
          </label>
          {scope === "tenant" ? (
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Tenant ID</span>
              <input
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                placeholder="租户 ID（UUID）"
                className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
                disabled={mode === "edit"}
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">角色编码</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="如 tenant_admin"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              disabled={mode === "edit"}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">角色名称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="角色显示名称"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">描述</span>
          <textarea
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            placeholder="角色的用途说明"
          />
        </label>

        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">权限点</div>
          {groupedPermissions.length === 0 ? (
            <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              暂无可用权限，请联系平台管理员配置。
            </div>
          ) : (
            groupedPermissions.map(([groupName, items]) => (
              <fieldset key={groupName} className="space-y-2 rounded-md border border-border/50 p-3">
                <legend className="px-1 text-xs font-semibold uppercase text-muted-foreground">
                  {groupName}
                </legend>
                <div className="grid gap-2 md:grid-cols-2">
                  {items.map((perm) => (
                    <label key={perm.code} className="flex items-start gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedPermissions.includes(perm.code)}
                        onChange={() => togglePermission(perm.code)}
                      />
                      <span>
                        <span className="font-medium text-foreground">{perm.code}</span>
                        <span className="block text-muted-foreground">{perm.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))
          )}
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">扩展信息（metadata）</span>
          <textarea
            value={metadata}
            onChange={(event) => setMetadata(event.target.value)}
            rows={4}
            className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm font-mono"
            placeholder='例如 {"category":"default"}'
          />
        </label>
      </form>
    </div>
  );
}

interface RoleMemberPanelProps {
  role: RoleRow;
  onClose: () => void;
  onChanged: () => void;
}

function RoleMemberPanel({ role, onClose, onChanged }: RoleMemberPanelProps) {
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberInput, setMemberInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchMembers = useCallback(
    async (options?: { signal?: AbortSignal }) => {
      const signal = options?.signal;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: "100",
        });
        const data = await apiFetch<RoleMemberListResponse>(
          `/api/v1/roles/${role.id}/members?${params.toString()}`,
          { signal },
        );
        setMembers(data.items);
        setTotal(data.total);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "加载成员失败");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, role.id],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchMembers({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchMembers]);

  const handleAddMembers = async () => {
    const raw = memberInput
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (raw.length === 0) {
      setError("请输入至少一个 Identity ID");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<{ assigned: number }>(`/api/v1/roles/${role.id}/members`, {
        method: "POST",
        body: JSON.stringify({ identities: raw }),
      });
      setMemberInput("");
      setPage(1);
      await fetchMembers();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加成员失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (identityId: string) => {
    setRemovingId(identityId);
    setError(null);
    try {
      await apiFetch<void>(`/api/v1/roles/${role.id}/members/${identityId}`, {
        method: "DELETE",
      });
      await fetchMembers();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "移除成员失败");
    } finally {
      setRemovingId(null);
    }
  };

  const pageCount = useMemo(() => {
    if (total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / 100));
  }, [total]);

  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            成员管理：{role.code}（{role.assignedCount} 人）
          </h3>
          <p className="text-xs text-muted-foreground">
            输入 Identity ID（Kratos 用户 ID），支持一次添加多个，使用空格或逗号分隔。
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          关闭
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
        <textarea
          value={memberInput}
          onChange={(event) => setMemberInput(event.target.value)}
          rows={3}
          placeholder="例如：0b1f... 3c2d..."
          className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm font-mono"
        />
        <Button onClick={handleAddMembers} disabled={submitting} className="md:self-start">
          {submitting ? "添加中..." : "添加成员"}
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Identity</th>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">加入时间</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-background/70">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                  正在加载成员...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                  暂无成员
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.identityId}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{member.identityId}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.tenantId ?? "--"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(member.assignedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveMember(member.identityId)}
                      disabled={removingId === member.identityId}
                    >
                      {removingId === member.identityId ? "移除中..." : "移除"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {total} 人</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
          >
            上一页
          </Button>
          <span>
            第 {page} / {pageCount} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => (prev < pageCount ? prev + 1 : prev))}
            disabled={page >= pageCount || loading}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
