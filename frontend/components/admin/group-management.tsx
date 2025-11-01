"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useCurrentUser } from "@/components/providers/current-user-provider";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api";
import { hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface GroupNode {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order: number;
  member_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  children?: GroupNode[];
}

interface GroupMember {
  identity_id: string;
  display_name: string;
  phone: string;
  title?: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupsResponse {
  items: GroupNode[];
}

interface GroupMembersResponse {
  items: GroupMember[];
  total: number;
  page: number;
  page_size: number;
}

const MEMBER_PAGE_SIZE = 20;
const GROUP_CODE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export function GroupManagement() {
  const { user } = useCurrentUser();
  const [groups, setGroups] = useState<GroupNode[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupsReloadKey, setGroupsReloadKey] = useState(0);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    name: "",
    description: "",
    parentId: "",
    sortOrder: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    description: "",
    parentId: "",
    sortOrder: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberPage, setMemberPage] = useState(1);
  const [membersReloadKey, setMembersReloadKey] = useState(0);

const [showCreateMemberForm, setShowCreateMemberForm] = useState(false);
const [creatingMember, setCreatingMember] = useState(false);
const [memberForm, setMemberForm] = useState({
  displayName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  title: "",
});
const [memberError, setMemberError] = useState<string | null>(null);

  const [moveMemberState, setMoveMemberState] = useState<{
    member: GroupMember;
    targetGroupId: string;
  } | null>(null);
  const [moveMemberError, setMoveMemberError] = useState<string | null>(null);
  const [movingMember, setMovingMember] = useState(false);

  const tenantId = user?.tenantId ?? null;
  const canManage =
    user != null &&
    (hasRole(user, "platform_admin") ||
      hasRole(user, "tenant_admin") ||
      hasRole(user, "organization_manager"));
  const showTenantLabel = hasRole(user ?? null, "platform_admin");
  const flattenedGroups = useMemo(() => flattenGroupsWithDepth(groups), [groups]);
  const parentOptions = useMemo(
    () =>
      flattenedGroups.map(({ group, depth }) => ({
        id: group.id,
        label: depth > 0 ? `${"— ".repeat(depth)}${group.name}` : group.name,
      })),
    [flattenedGroups],
  );
  const editParentOptions = useMemo(() => {
    if (!editingGroupId) {
      return parentOptions;
    }
    const exclusions = collectDescendantIDs(groups, editingGroupId);
    exclusions.add(editingGroupId);
    return parentOptions.filter((option) => !exclusions.has(option.id));
  }, [parentOptions, groups, editingGroupId]);

  const moveMemberOptions = useMemo(() => {
    if (!selectedGroupId) {
      return parentOptions;
    }
    return parentOptions.filter((option) => option.id !== selectedGroupId);
  }, [parentOptions, selectedGroupId]);

  const openCreateForm = () => {
    setCreateForm({
      code: "",
      name: "",
      description: "",
      parentId: selectedGroupId ?? "",
      sortOrder: "",
    });
    setCreateError(null);
    setShowCreateForm(true);
  };

  const handleCreateInput = (field: keyof typeof createForm, value: string) => {
    if (field === "code") {
      value = value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32);
    }
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating) {
      return;
    }

    const code = createForm.code.trim();
    const name = createForm.name.trim();
    if (!code || !name) {
      setCreateError("部门编码和名称为必填项");
      return;
    }

    if (!GROUP_CODE_PATTERN.test(code)) {
      setCreateError("部门编码仅支持 1-32 位字母、数字、下划线或短横线");
      return;
    }

    const payload: Record<string, unknown> = {
      code,
      name,
    };

    const description = createForm.description.trim();
    if (description) {
      payload.description = description;
    }

    if (createForm.parentId) {
      payload.parent_id = createForm.parentId;
    }

    if (createForm.sortOrder.trim()) {
      const sortValue = Number.parseInt(createForm.sortOrder.trim(), 10);
      if (Number.isNaN(sortValue)) {
        setCreateError("排序值需为数字");
        return;
      }
      payload.sort_order = sortValue;
    }

    if (!showTenantLabel && tenantId) {
      payload.tenant_id = tenantId;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const created = await apiFetch<GroupNode>("/api/v1/groups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowCreateForm(false);
      setCreating(false);
      setCreateForm({ code: "", name: "", description: "", parentId: "", sortOrder: "" });
      setPendingGroupId(created.id);
      setGroupsReloadKey((prev) => prev + 1);
      setMemberPage(1);
    } catch (error) {
      setCreating(false);
      const apiError = error as Partial<ApiError>;
      const message = extractApiErrorMessage(apiError);
      setCreateError(message ?? "创建部门失败");
    }
  };

  const handleCancelCreate = () => {
    if (creating) {
      return;
    }
    setShowCreateForm(false);
    setCreateError(null);
  };

  const openEditForm = () => {
    if (!selectedGroup) {
      return;
    }
    setEditingGroupId(selectedGroup.id);
    setEditForm({
      code: selectedGroup.code,
      name: selectedGroup.name,
      description: selectedGroup.description ?? "",
      parentId: selectedGroup.parent_id ?? "",
      sortOrder: selectedGroup.sort_order ? String(selectedGroup.sort_order) : "",
    });
    setEditError(null);
    setShowEditForm(true);
  };

  const handleEditInput = (field: keyof typeof editForm, value: string) => {
    if (field === "code") {
      value = value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32);
    }
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingEdit || !editingGroupId) {
      return;
    }

    const code = editForm.code.trim();
    const name = editForm.name.trim();
    if (!code || !name) {
      setEditError("部门编码和名称为必填项");
      return;
    }

    if (!GROUP_CODE_PATTERN.test(code)) {
      setEditError("部门编码仅支持 1-32 位字母、数字、下划线或短横线");
      return;
    }

    const payload: Record<string, unknown> = {
      code,
      name,
    };

    const description = editForm.description.trim();
    payload["description"] = description;

    if (editForm.parentId) {
      payload["parent_id"] = editForm.parentId;
    } else {
      payload["parent_id"] = null;
    }

    if (editForm.sortOrder.trim()) {
      const sortValue = Number.parseInt(editForm.sortOrder.trim(), 10);
      if (Number.isNaN(sortValue)) {
        setEditError("排序值需为数字");
        return;
      }
      payload["sort_order"] = sortValue;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await apiFetch<GroupNode>(`/api/v1/groups/${editingGroupId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setShowEditForm(false);
      setSavingEdit(false);
      setPendingGroupId(updated.id);
      setGroupsReloadKey((prev) => prev + 1);
    } catch (error) {
      setSavingEdit(false);
      const apiError = error as Partial<ApiError>;
      const message = extractApiErrorMessage(apiError);
      setEditError(message ?? "更新部门失败");
    }
  };

  const handleCancelEdit = () => {
    if (savingEdit) {
      return;
    }
    setShowEditForm(false);
    setEditError(null);
    setEditingGroupId(null);
  };

  const openCreateMemberForm = () => {
    if (!selectedGroupId) {
      return;
    }
    setMemberForm({ displayName: "", phone: "", password: "", confirmPassword: "", title: "" });
    setMemberError(null);
    setShowCreateMemberForm(true);
  };

  const handleMemberInput = (field: keyof typeof memberForm, value: string) => {
    if (field === "phone") {
      value = value.replace(/[^0-9+]/g, "");
    }
    setMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creatingMember || !selectedGroupId) {
      return;
    }

    const displayName = memberForm.displayName.trim();
    const phone = normalizePhoneInput(memberForm.phone);
    const password = memberForm.password;
    const confirmPassword = memberForm.confirmPassword;

    if (!displayName || !phone || !password || !confirmPassword) {
      setMemberError("姓名、手机号和密码为必填项");
      return;
    }

    if (password !== confirmPassword) {
      setMemberError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setMemberError("密码长度至少 6 位");
      return;
    }

    const payload: Record<string, unknown> = {
      display_name: displayName,
      phone,
      password,
    };
    if (memberForm.title.trim()) {
      payload.title = memberForm.title.trim();
    }

    setCreatingMember(true);
    setMemberError(null);
    try {
      await apiFetch<GroupMember>(`/api/v1/groups/${selectedGroupId}/members`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowCreateMemberForm(false);
      setCreatingMember(false);
      setMemberForm({ displayName: "", phone: "", password: "", confirmPassword: "", title: "" });
      setMemberPage(1);
      setMembersReloadKey((key) => key + 1);
      setGroupsReloadKey((key) => key + 1);
    } catch (error) {
      setCreatingMember(false);
      const apiError = error as Partial<ApiError>;
      const message = extractApiErrorMessage(apiError);
      setMemberError(message ?? "新增成员失败");
    }
  };

  const handleCancelMember = () => {
    if (creatingMember) {
      return;
    }
    setShowCreateMemberForm(false);
    setMemberError(null);
  };

  const openMoveMemberForm = (member: GroupMember) => {
    if (!selectedGroupId) {
      return;
    }
    const firstOption = moveMemberOptions[0];
    setMoveMemberState({ member, targetGroupId: firstOption ? firstOption.id : "" });
    setMoveMemberError(null);
  };

  const handleMoveMemberChange = (value: string) => {
    setMoveMemberState((prev) => (prev ? { ...prev, targetGroupId: value } : prev));
  };

  const handleMoveMemberSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!moveMemberState || movingMember || !selectedGroupId) {
      return;
    }

    const targetGroupId = moveMemberState.targetGroupId.trim();
    if (!targetGroupId) {
      setMoveMemberError("请选择目标部门");
      return;
    }

    setMovingMember(true);
    setMoveMemberError(null);
    try {
      await apiFetch<GroupMember>(
        `/api/v1/groups/${selectedGroupId}/members/${moveMemberState.member.identity_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ target_group_id: targetGroupId }),
        },
      );

      setMoveMemberState(null);
      setMovingMember(false);
      setPendingGroupId(targetGroupId);
      setGroupsReloadKey((key) => key + 1);
      setMembersReloadKey((key) => key + 1);
    } catch (error) {
      setMovingMember(false);
      const apiError = error as Partial<ApiError>;
      const message = extractApiErrorMessage(apiError);
      setMoveMemberError(message ?? "移动成员失败");
    }
  };

  const handleCancelMoveMember = () => {
    if (movingMember) {
      return;
    }
    setMoveMemberState(null);
    setMoveMemberError(null);
  };

  const handleDeleteMember = async (member: GroupMember) => {
    if (!selectedGroupId) {
      return;
    }
    if (!window.confirm(`确认将 ${member.display_name} 移出当前部门？`)) {
      return;
    }

    try {
      await apiFetch(`/api/v1/groups/${selectedGroupId}/members/${member.identity_id}`, {
        method: "DELETE",
      });
      setMembersReloadKey((key) => key + 1);
      setGroupsReloadKey((key) => key + 1);
    } catch (error) {
      const apiError = error as Partial<ApiError>;
      const message = extractApiErrorMessage(apiError);
      setMembersError(message ?? "移除成员失败");
    }
  };

  useEffect(() => {
    if (!tenantId && !hasRole(user, "platform_admin")) {
      setGroups([]);
      setGroupsError("未检测到租户上下文，请重新登录或联系管理员");
      return;
    }

    const controller = new AbortController();

    async function fetchGroups() {
      setGroupsLoading(true);
      setGroupsError(null);
      try {
        const params = new URLSearchParams();
        if (tenantId) {
          params.set("tenant_id", tenantId);
        }
        const query = params.toString();
        const url = query ? `/api/v1/groups?${query}` : "/api/v1/groups";
        const data = await apiFetch<GroupsResponse>(url, { signal: controller.signal });
        const items = data.items ?? [];
        setGroups(items);

        if (items.length === 0) {
          setSelectedGroupId(null);
          setPendingGroupId(null);
        } else {
          if (pendingGroupId) {
            const match = findGroupById(items, pendingGroupId);
            if (match) {
              setSelectedGroupId(pendingGroupId);
              setPendingGroupId(null);
            } else {
              setSelectedGroupId((previous) => {
                if (previous && findGroupById(items, previous)) {
                  return previous;
                }
                return items[0].id;
              });
            }
          } else {
            setSelectedGroupId((previous) => {
              if (previous && findGroupById(items, previous)) {
                return previous;
              }
              return items[0].id;
            });
          }
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        const apiError = error as Partial<ApiError>;
        const message =
          apiError?.payload && typeof apiError.payload === "object"
            ? (apiError.payload as { error?: { message?: string } })?.error?.message
            : undefined;
        setGroupsError(message || (error instanceof Error ? error.message : "加载组织结构失败"));
        setGroups([]);
        setSelectedGroupId(null);
        setPendingGroupId(null);
      } finally {
        setGroupsLoading(false);
      }
    }

    void fetchGroups();

    return () => controller.abort();
  }, [tenantId, user, groupsReloadKey, pendingGroupId]);

  useEffect(() => {
    if (!selectedGroupId) {
      setMembers([]);
      setMembersTotal(0);
      return;
    }

    const controller = new AbortController();

    async function fetchMembers() {
      setMembersLoading(true);
      setMembersError(null);
      try {
        const params = new URLSearchParams({
          page: String(memberPage),
          page_size: String(MEMBER_PAGE_SIZE),
        });
        const data = await apiFetch<GroupMembersResponse>(
          `/api/v1/groups/${selectedGroupId}/members?${params.toString()}`,
          { signal: controller.signal },
        );
        setMembers(data.items ?? []);
        setMembersTotal(typeof data.total === "number" ? data.total : 0);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        const apiError = error as Partial<ApiError>;
        const message =
          apiError?.payload && typeof apiError.payload === "object"
            ? (apiError.payload as { error?: { message?: string } })?.error?.message
            : undefined;
        setMembersError(message || (error instanceof Error ? error.message : "加载成员失败"));
        setMembers([]);
        setMembersTotal(0);
      } finally {
        setMembersLoading(false);
      }
    }

    void fetchMembers();

    return () => controller.abort();
  }, [selectedGroupId, memberPage, membersReloadKey]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) {
      return null;
    }
    return findGroupById(groups, selectedGroupId);
  }, [groups, selectedGroupId]);

  const memberPageCount = useMemo(() => {
    if (membersTotal <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(membersTotal / MEMBER_PAGE_SIZE));
  }, [membersTotal]);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setMemberPage(1);
  };

  const canNavigateMembers = membersTotal > MEMBER_PAGE_SIZE;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-lg border border-border/70 bg-background/70 p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">组织结构</h2>
            <Button
              size="sm"
              variant="outline"
              disabled={!canManage}
              title={canManage ? "" : "暂无权限"}
              onClick={canManage ? () => openCreateForm() : undefined}
            >
              新建部门
            </Button>
        </header>
        {groupsLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">正在加载组织结构...</div>
        ) : groupsError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-4 text-sm text-destructive">
            {groupsError}
          </div>
        ) : groups.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">暂无部门数据</div>
        ) : (
          <div className="space-y-1 text-sm">
            {groups.map((group) => (
              <GroupTree
                key={group.id}
                group={group}
                selectedId={selectedGroupId ?? ""}
                onSelect={handleSelectGroup}
                depth={0}
                showTenant={showTenantLabel}
              />
            ))}
          </div>
        )}
      </section>
      <section className="space-y-6">
        {showCreateForm && canManage ? (
          <CreateGroupForm
            form={createForm}
            onChange={handleCreateInput}
            onSubmit={handleCreateSubmit}
            onCancel={handleCancelCreate}
            creating={creating}
            error={createError}
            parentOptions={parentOptions}
            showTenantLabel={showTenantLabel}
          />
        ) : null}
        {showEditForm && canManage && editingGroupId ? (
          <EditGroupForm
            form={editForm}
            onChange={handleEditInput}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
            saving={savingEdit}
            error={editError}
            parentOptions={editParentOptions}
          />
        ) : null}
        {showCreateMemberForm && canManage && selectedGroup ? (
          <CreateMemberForm
            form={memberForm}
            onChange={handleMemberInput}
            onSubmit={handleMemberSubmit}
            onCancel={handleCancelMember}
            creating={creatingMember}
            error={memberError}
            groupName={selectedGroup.name}
          />
        ) : null}
        {moveMemberState && canManage ? (
          <MoveMemberForm
            member={moveMemberState.member}
            targetGroupId={moveMemberState.targetGroupId}
            onChange={handleMoveMemberChange}
            onSubmit={handleMoveMemberSubmit}
            onCancel={handleCancelMoveMember}
            saving={movingMember}
            error={moveMemberError}
            options={moveMemberOptions}
          />
        ) : null}
        <div className="rounded-lg border border-border/70 bg-background/70 p-6">
          {selectedGroup ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedGroup.name}
                  {showTenantLabel ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (租户 {selectedGroup.tenant_id})
                    </span>
                  ) : null}
                </h2>
                <p className="text-sm text-muted-foreground">
                  直属成员 {selectedGroup.member_count} 人，部门编码 {selectedGroup.code}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canManage || !selectedGroup}
                  title={canManage ? "" : "暂无权限"}
                  onClick={canManage ? openEditForm : undefined}
                >
                  编辑部门
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canManage || !selectedGroup}
                  title={canManage ? "" : "暂无权限"}
                  onClick={canManage ? openEditForm : undefined}
                >
                  调整上级
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={!canManage || !selectedGroupId}
                  title={canManage ? "" : "暂无权限"}
                  onClick={canManage ? openCreateMemberForm : undefined}
                >
                  新增成员
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">请选择左侧的部门以查看详情。</div>
          )}
        </div>
        <div className="rounded-lg border border-border/70 bg-background/70">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
            <h3 className="text-sm font-medium text-foreground">成员列表</h3>
            <Button size="sm" variant="outline" disabled={!canManage} title={canManage ? "" : "暂无权限"}>
              批量导入
            </Button>
          </header>
          {selectedGroupId ? (
            <div className="divide-y divide-border/60 text-sm">
              {membersLoading ? (
                <div className="px-6 py-8 text-center text-muted-foreground">正在加载成员...</div>
              ) : membersError ? (
                <div className="px-6 py-8 text-center text-destructive">{membersError}</div>
              ) : members.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">暂无成员</div>
              ) : (
                members.map((member) => (
                  <div key={member.identity_id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="font-medium text-foreground">{member.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.title ?? "—"} · {member.identity_id}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{member.phone}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canManage || moveMemberOptions.length === 0}
                          title={canManage ? "" : "暂无权限"}
                          onClick={canManage ? () => openMoveMemberForm(member) : undefined}
                        >
                          移动部门
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canManage}
                          title={canManage ? "" : "暂无权限"}
                          onClick={canManage ? () => handleDeleteMember(member) : undefined}
                        >
                          移除
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-muted-foreground">请选择一个部门以查看成员。</div>
          )}
          {selectedGroupId && canNavigateMembers && (
            <footer className="flex items-center justify-between border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
              <span>
                共 {membersTotal} 人 | 第 {memberPage} / {memberPageCount} 页
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMemberPage((prev) => Math.max(1, prev - 1))}
                  disabled={memberPage <= 1 || membersLoading}
                >
                  上一页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMemberPage((prev) => (prev < memberPageCount ? prev + 1 : prev))}
                  disabled={memberPage >= memberPageCount || membersLoading}
                >
                  下一页
                </Button>
              </div>
            </footer>
          )}
        </div>
      </section>
    </div>
  );
}

function findGroupById(groups: GroupNode[], id: string): GroupNode | null {
  for (const group of groups) {
    if (group.id === id) {
      return group;
    }
    if (group.children?.length) {
      const match = findGroupById(group.children, id);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

function flattenGroupsWithDepth(groups: GroupNode[], depth = 0): Array<{ group: GroupNode; depth: number }> {
  const result: Array<{ group: GroupNode; depth: number }> = [];
  for (const group of groups) {
    result.push({ group, depth });
    if (group.children?.length) {
      result.push(...flattenGroupsWithDepth(group.children, depth + 1));
    }
  }
  return result;
}

function collectDescendantIDs(groups: GroupNode[], groupId: string): Set<string> {
  const result = new Set<string>();
  const target = findGroupById(groups, groupId);
  if (!target) {
    return result;
  }
  const stack = [...(target.children ?? [])];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (result.has(current.id)) {
      continue;
    }
    result.add(current.id);
    if (current.children?.length) {
      stack.push(...current.children);
    }
  }
  return result;
}

function normalizePhoneInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  if (trimmed.startsWith("86")) {
    return "+" + trimmed;
  }
  const withoutLeadingZeros = trimmed.replace(/^0+/, "");
  return "+86" + (withoutLeadingZeros || trimmed);
}

function extractApiErrorMessage(error: Partial<ApiError>): string | undefined {
  if (!error) {
    return undefined;
  }

  const payload = error.payload;
  if (payload) {
    if (typeof payload === "string") {
      return payload;
    }
    if (typeof payload === "object") {
      const innerError = (payload as { error?: unknown }).error;
      if (typeof innerError === "string") {
        return innerError;
      }
      if (
        innerError &&
        typeof innerError === "object" &&
        typeof (innerError as { message?: unknown }).message === "string"
      ) {
        return (innerError as { message: string }).message;
      }
    }
  }

  if (error.message && error.message.trim().length > 0) {
    return error.message;
  }

  return undefined;
}

function GroupTree({
  group,
  selectedId,
  onSelect,
  depth,
  showTenant,
}: {
  group: GroupNode;
  selectedId: string;
  onSelect: (id: string) => void;
  depth: number;
  showTenant: boolean;
}) {
  const isActive = selectedId === group.id;
  return (
    <div>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors",
          "hover:bg-muted/80",
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => onSelect(group.id)}
      >
        <span className="truncate">
          {group.name}
          {showTenant && depth === 0 ? (
            <span className="ml-1 text-xs text-muted-foreground">[{group.tenant_id}]</span>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground">{group.member_count}</span>
      </button>
      {group.children?.map((child) => (
        <GroupTree
          key={child.id}
          group={child}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth + 1}
          showTenant={showTenant}
        />
      ))}
    </div>
  );
}

interface ParentOption {
  id: string;
  label: string;
}

interface CreateGroupFormProps {
  form: {
    code: string;
    name: string;
    description: string;
    parentId: string;
    sortOrder: string;
  };
  onChange: (field: keyof CreateGroupFormProps["form"], value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  creating: boolean;
  error: string | null;
  parentOptions: ParentOption[];
  showTenantLabel: boolean;
}

function CreateGroupForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  creating,
  error,
  parentOptions,
  showTenantLabel,
}: CreateGroupFormProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <h3 className="text-base font-semibold text-foreground">新建部门</h3>
          <p className="text-sm text-muted-foreground">
            填写部门基础信息。保存后可在组织树中看到新部门并继续配置成员与角色。
            {showTenantLabel ? "（平台管理员仅能创建平台内部部门）" : ""}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">部门编码 *</span>
            <input
              value={form.code}
              onChange={(event) => onChange("code", event.target.value)}
              placeholder="例如：team-ops"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              maxLength={32}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">部门名称 *</span>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="请输入部门名称"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">上级部门</span>
            <select
              value={form.parentId}
              onChange={(event) => onChange("parentId", event.target.value)}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value="">顶级部门</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">排序值</span>
            <input
              value={form.sortOrder}
              onChange={(event) => onChange("sortOrder", event.target.value)}
              placeholder="数字越小越靠前"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              inputMode="numeric"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">说明</span>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="可选：描述部门职责"
              rows={3}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={creating}>
            {creating ? "保存中..." : "保存部门"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={creating} onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}

interface EditGroupFormProps {
  form: {
    code: string;
    name: string;
    description: string;
    parentId: string;
    sortOrder: string;
  };
  onChange: (field: keyof EditGroupFormProps["form"], value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  parentOptions: ParentOption[];
}

function EditGroupForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  error,
  parentOptions,
}: EditGroupFormProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <h3 className="text-base font-semibold text-foreground">编辑部门</h3>
          <p className="text-sm text-muted-foreground">更新部门基础信息并调整所属层级。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">部门编码 *</span>
            <input
              value={form.code}
              onChange={(event) => onChange("code", event.target.value)}
              placeholder="例如：team-ops"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              maxLength={32}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">部门名称 *</span>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="请输入部门名称"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">上级部门</span>
            <select
              value={form.parentId}
              onChange={(event) => onChange("parentId", event.target.value)}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value="">顶级部门</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">排序值</span>
            <input
              value={form.sortOrder}
              onChange={(event) => onChange("sortOrder", event.target.value)}
              placeholder="数字越小越靠前"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              inputMode="numeric"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">说明</span>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="可选：描述部门职责"
              rows={3}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "保存中..." : "保存变更"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}

interface CreateMemberFormProps {
  form: {
    displayName: string;
    phone: string;
    password: string;
    confirmPassword: string;
    title: string;
  };
  onChange: (field: keyof CreateMemberFormProps["form"], value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  creating: boolean;
  error: string | null;
  groupName: string;
}

function CreateMemberForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  creating,
  error,
  groupName,
}: CreateMemberFormProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <h3 className="text-base font-semibold text-foreground">新增成员</h3>
          <p className="text-sm text-muted-foreground">为「{groupName}」创建新成员账号。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted-foreground">姓名 *</span>
            <input
              value={form.displayName}
              onChange={(event) => onChange("displayName", event.target.value)}
              placeholder="请输入姓名"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">手机号 *</span>
            <input
              value={form.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              placeholder="请输入手机号"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">职位</span>
            <input
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="可选：职位名称"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">初始密码 *</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="至少 6 位"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">确认密码 *</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => onChange("confirmPassword", event.target.value)}
              placeholder="再次输入密码"
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={creating}>
            {creating ? "保存中..." : "保存成员"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={creating} onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MoveMemberFormProps {
  member: GroupMember;
  targetGroupId: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  options: ParentOption[];
}

function MoveMemberForm({
  member,
  targetGroupId,
  onChange,
  onSubmit,
  onCancel,
  saving,
  error,
  options,
}: MoveMemberFormProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <h3 className="text-base font-semibold text-foreground">移动成员</h3>
          <p className="text-sm text-muted-foreground">选择新的部门以移动成员。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted-foreground">成员</span>
            <input
              value={`${member.display_name}（${member.phone}）`}
              disabled
              className="rounded-md border border-border/70 bg-muted px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="text-muted-foreground">目标部门 *</span>
            <select
              value={targetGroupId}
              onChange={(event) => onChange(event.target.value)}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">请选择部门</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "移动中..." : "确定移动"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
