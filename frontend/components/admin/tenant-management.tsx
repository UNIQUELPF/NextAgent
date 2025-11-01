"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type TenantStatus = "active" | "inactive";

interface TenantRow {
  id: string;
  code: string;
  name: string;
  status: TenantStatus;
  contactName?: string | null;
  contactPhone?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface TenantListResponse {
  items: TenantRow[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_LABELS: Record<TenantStatus, string> = {
  active: "启用",
  inactive: "停用",
};

const PAGE_SIZE = 20;
const CODE_PATTERN = /^[A-Za-z0-9]{1,10}$/;

export function TenantManagement() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | TenantStatus>("");
  const [page, setPage] = useState(1);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);

  const fetchTenants = useCallback(
    async (options?: { signal?: AbortSignal }) => {
      const signal = options?.signal;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
        });
        if (keyword.trim()) {
          params.set("search", keyword.trim());
        }
        if (status) {
          params.set("status", status);
        }
        const data = await apiFetch<TenantListResponse>(`/api/v1/tenants?${params.toString()}`, {
          signal,
        });
        setTenants(data.items);
        setTotal(data.total);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "加载租户失败");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [keyword, page, status],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchTenants({ signal: controller.signal });

    return () => controller.abort();
  }, [fetchTenants, reloadToken]);

  const pageCount = useMemo(() => {
    if (total <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleStatusChange = (value: "" | TenantStatus) => {
    setStatus(value);
    setPage(1);
  };

  const handleCreateSuccess = (tenant: TenantRow) => {
    setShowCreateForm(false);
    setEditingTenant(null);
    setPage(1);
    setReloadToken((token) => token + 1);
    setFeedback(`已创建租户「${tenant.name}」`);
  };

  const handleEditSuccess = (tenant: TenantRow) => {
    setEditingTenant(null);
    setShowCreateForm(false);
    setReloadToken((token) => token + 1);
    setFeedback(`已更新租户「${tenant.name}」`);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border/70 bg-background/70 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">租户列表</h2>
            <p className="text-sm text-muted-foreground">
              支持创建经销商租户、更新联系人、配置权限模板，以便后续通过 Keto 分配角色。
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              导入租户
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingTenant(null);
                setShowCreateForm(true);
                setFeedback(null);
              }}
            >
              新建租户
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">关键词</span>
            <input
              value={keyword}
              onChange={(event) => handleKeywordChange(event.target.value)}
              placeholder="输入租户名称 / 编码 / 联系人"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">状态</span>
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as "" | TenantStatus)}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value="">全部</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </label>
        </div>
      </div>

      {feedback && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      {showCreateForm && (
        <TenantForm
          mode="create"
          onCancel={() => {
            setShowCreateForm(false);
            setFeedback(null);
          }}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingTenant && (
        <TenantForm
          mode="edit"
          initialTenant={editingTenant}
          onCancel={() => {
            setEditingTenant(null);
            setFeedback(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-border/70">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">租户名称</th>
              <th className="px-4 py-3 font-medium">编码</th>
              <th className="px-4 py-3 font-medium">联系人</th>
              <th className="px-4 py-3 font-medium">创建时间</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-background/70">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  正在加载租户...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-6 text-center text-destructive" colSpan={6}>
                  {error}
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  暂无满足条件的租户
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{tenant.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {tenant.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tenant.code}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{tenant.contactName ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">{tenant.contactPhone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(tenant.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {STATUS_LABELS[tenant.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        配置角色
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFeedback(null);
                          setEditingTenant(tenant);
                        }}
                      >
                        编辑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          共 {total} 个租户
        </div>
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
    </section>
  );
}

type TenantFormMode = "create" | "edit";

interface TenantFormProps {
  mode: TenantFormMode;
  initialTenant?: TenantRow;
  onSuccess: (tenant: TenantRow) => void;
  onCancel: () => void;
}

function TenantForm({ mode, initialTenant, onSuccess, onCancel }: TenantFormProps) {
  const [form, setForm] = useState(() => buildInitialForm(initialTenant));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialForm(initialTenant));
    setError(null);
  }, [initialTenant, mode]);

  const handleChange = (field: keyof typeof form, value: string) => {
    if (field === "code") {
      value = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const code = form.code.trim();
    const name = form.name.trim();
    if (!code || !name) {
      setError("租户名称和编码为必填项");
      return;
    }

    if (!CODE_PATTERN.test(code)) {
      setError("租户编码仅支持 1-10 位字母或数字");
      return;
    }

    let metadata: Record<string, unknown> = {};
    if (form.metadata.trim()) {
      try {
        metadata = JSON.parse(form.metadata);
        if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
          throw new Error("metadata must be an object");
        }
      } catch {
        setError("元数据需为合法的 JSON 对象");
        return;
      }
    }

    const payload = {
      code,
      name,
      status: form.status,
      contactName: form.contactName.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      metadata,
    };

    const isEdit = mode === "edit";
    const endpoint = isEdit && initialTenant ? `/api/v1/tenants/${initialTenant.id}` : "/api/v1/tenants";
    const method = isEdit ? "PUT" : "POST";

    if (isEdit && !initialTenant) {
      setError("缺少租户信息，无法编辑");
      return;
    }

    setSubmitting(true);
    try {
      const tenant = await apiFetch<TenantRow>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      onSuccess(tenant);
      if (isEdit) {
        setForm(buildInitialForm(tenant));
      } else {
        setForm(buildInitialForm());
      }
    } catch (err) {
      const defaultMsg = isEdit ? "更新租户失败" : "创建租户失败";
      setError(err instanceof Error ? err.message : defaultMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const heading = mode === "edit" ? "编辑租户" : "新建租户";
  const submitLabel = submitting ? "保存中..." : mode === "edit" ? "保存变更" : "保存租户";
  const helperText =
    mode === "edit"
      ? "更新租户的基本信息。保存后列表会自动刷新。"
      : "填写租户基础信息，保存后可继续配置角色与成员。";

  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-base font-semibold text-foreground">{heading}</h3>
          <p className="text-sm text-muted-foreground">{helperText}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">租户编码 *</span>
            <input
              value={form.code}
              onChange={(event) => handleChange("code", event.target.value)}
              placeholder="例如：dealer001"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              maxLength={10}
              pattern="[A-Za-z0-9]{1,10}"
              title="仅限 1-10 位字母或数字"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">租户名称 *</span>
            <input
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="例如：华东经销商"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">联系人</span>
            <input
              value={form.contactName}
              onChange={(event) => handleChange("contactName", event.target.value)}
              placeholder="联系人姓名"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">联系电话</span>
            <input
              value={form.contactPhone}
              onChange={(event) => handleChange("contactPhone", event.target.value)}
              placeholder="联系人电话"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">状态</span>
            <select
              value={form.status}
              onChange={(event) => handleChange("status", event.target.value)}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">元数据（JSON，可选）</span>
            <textarea
              value={form.metadata}
              onChange={(event) => handleChange("metadata", event.target.value)}
              placeholder='例如：{ "region": "华东" }'
              rows={4}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={submitting}>
            {submitLabel}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}

function buildInitialForm(tenant?: TenantRow) {
  const metadataObj: Record<string, unknown> = tenant?.metadata ?? {};
  return {
    code: tenant?.code ?? "",
    name: tenant?.name ?? "",
    status: (tenant?.status ?? "active") as TenantStatus,
    contactName: tenant?.contactName ?? "",
    contactPhone: tenant?.contactPhone ?? "",
    metadata: Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj, null, 2) : "",
  };
}
