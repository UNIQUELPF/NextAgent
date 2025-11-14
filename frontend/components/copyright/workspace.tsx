"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createRuanzhuConfig,
  createRuanzhuTask,
  downloadRuanzhuFile,
  downloadRuanzhuFullTask,
  fetchRuanzhuCodeFiles,
  fetchRuanzhuConfigs,
  fetchRuanzhuStatistics,
  fetchRuanzhuTaskDetail,
  fetchRuanzhuTasks,
  removeRuanzhuTask,
  deleteRuanzhuConfig,
} from "@/lib/ruanzhu";
import type {
  RuanzhuCodeFile,
  RuanzhuConfig,
  RuanzhuStatistics,
  RuanzhuTask,
} from "@/lib/ruanzhu";

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

const statusColors: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-200",
  RUNNING: "text-blue-600 bg-blue-50 border-blue-200",
  COMPLETED: "text-green-600 bg-green-50 border-green-200",
  FAILED: "text-red-600 bg-red-50 border-red-200",
};

export function CopyrightWorkspace() {
  const [configs, setConfigs] = useState<RuanzhuConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configForm, setConfigForm] = useState({
    config_alias: "",
    model_name: "",
    base_url: "",
    api_key: "",
  });

  const [tasks, setTasks] = useState<RuanzhuTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    software_name: "",
    config_id: "",
  });

  const [stats, setStats] = useState<RuanzhuStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<RuanzhuTask | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [codeFiles, setCodeFiles] = useState<RuanzhuCodeFile[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);

  const [message, setMessage] = useState<FlashMessage | null>(null);

  const showMessage = useCallback((type: FlashMessage["type"], text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4500);
  }, []);

  const loadConfigs = useCallback(async () => {
    setConfigLoading(true);
    try {
      const data = await fetchRuanzhuConfigs();
      setConfigs(data);
    } catch (error) {
      console.error(error);
      showMessage("error", "加载模型配置失败");
    } finally {
      setConfigLoading(false);
    }
  }, [showMessage]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const data = await fetchRuanzhuTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
      showMessage("error", "加载任务列表失败");
    } finally {
      setTasksLoading(false);
    }
  }, [showMessage]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchRuanzhuStatistics();
      setStats(data);
    } catch (error) {
      console.error(error);
      showMessage("error", "加载统计信息失败");
    } finally {
      setStatsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadConfigs();
    loadTasks();
    loadStats();
  }, [loadConfigs, loadTasks, loadStats]);

  useEffect(() => {
    if (!selectedTaskId) {
      setSelectedTask(null);
      setCodeFiles([]);
      return;
    }
    const controller = new AbortController();
    setDetailLoading(true);
    fetchRuanzhuTaskDetail(selectedTaskId, controller.signal)
      .then((data) => {
        setSelectedTask(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(error);
        showMessage("error", "加载任务详情失败");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      });

    setCodeLoading(true);
    fetchRuanzhuCodeFiles(selectedTaskId, controller.signal)
      .then((data) => setCodeFiles(data))
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(error);
        showMessage("error", "加载代码模块清单失败");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCodeLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedTaskId, showMessage]);

  const statCards = useMemo(
    () => [
      { label: "累计任务", value: stats?.total_tasks ?? 0 },
      { label: "已完成", value: stats?.completed_tasks ?? 0 },
      { label: "执行中", value: stats?.running_tasks ?? 0 },
      { label: "待处理", value: stats?.pending_tasks ?? 0 },
      { label: "失败", value: stats?.failed_tasks ?? 0 },
      { label: "平均时长 (min)", value: stats?.avg_completion_time ?? 0 },
    ],
    [stats],
  );

  const handleConfigSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !configForm.config_alias.trim() ||
      !configForm.model_name.trim() ||
      !configForm.base_url.trim() ||
      !configForm.api_key.trim()
    ) {
      showMessage("error", "请完整填写模型配置信息");
      return;
    }
    try {
      await createRuanzhuConfig(configForm);
      showMessage("success", "模型配置创建成功");
      setConfigForm({
        config_alias: "",
        model_name: "",
        base_url: "",
        api_key: "",
      });
      loadConfigs();
    } catch (error) {
      console.error(error);
      showMessage("error", "创建配置失败，请检查参数");
    }
  };

  const handleDeleteConfig = async (config: RuanzhuConfig) => {
    const confirmed = window.confirm(`确定要删除配置「${config.config_alias}」吗？`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteRuanzhuConfig(config.id);
      showMessage("success", "配置已删除");
      loadConfigs();
    } catch (error) {
      console.error(error);
      showMessage("error", "删除配置失败，可能有任务正在使用");
    }
  };

  const handleTaskSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!taskForm.software_name.trim() || !taskForm.config_id) {
      showMessage("error", "请填写软件名称并选择模型配置");
      return;
    }
    try {
      await createRuanzhuTask({
        software_name: taskForm.software_name.trim(),
        config_id: Number(taskForm.config_id),
      });
      showMessage("success", "任务创建成功");
      setTaskForm((prev) => ({ ...prev, software_name: "" }));
      loadTasks();
    } catch (error) {
      console.error(error);
      showMessage("error", "创建任务失败");
    }
  };

  const handleRemoveTask = async (task: RuanzhuTask) => {
    const confirmed = window.confirm(`确定要删除任务「${task.software_name}」吗？`);
    if (!confirmed) {
      return;
    }
    try {
      await removeRuanzhuTask(task.task_id);
      showMessage("success", "任务已删除");
      if (selectedTaskId === task.task_id) {
        setSelectedTaskId(null);
      }
      loadTasks();
    } catch (error) {
      console.error(error);
      showMessage("error", "删除任务失败");
    }
  };

  const handleRefreshTask = async (taskId: string) => {
    try {
      const detail = await fetchRuanzhuTaskDetail(taskId);
      setTasks((prev) =>
        prev.map((item) => (item.task_id === taskId ? detail : item)),
      );
      if (selectedTaskId === taskId) {
        setSelectedTask(detail);
      }
      showMessage("success", "任务状态已刷新");
    } catch (error) {
      console.error(error);
      showMessage("error", "刷新任务失败");
    }
  };

  const handleRefreshCodeFiles = async () => {
    if (!selectedTaskId) {
      return;
    }
    setCodeLoading(true);
    try {
      const data = await fetchRuanzhuCodeFiles(selectedTaskId);
      setCodeFiles(data);
      showMessage("success", "代码清单已刷新");
    } catch (error) {
      console.error(error);
      showMessage("error", "刷新代码清单失败");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleDownload = async (taskId: string, options: { type: string; filename?: string }) => {
    try {
      await downloadRuanzhuFile(taskId, options);
    } catch (error) {
      console.error(error);
      showMessage("error", "下载文件失败");
    }
  };

  const handleDownloadFull = async (taskId: string) => {
    try {
      await downloadRuanzhuFullTask(taskId);
    } catch (error) {
      console.error(error);
      showMessage("error", "下载任务快照失败");
    }
  };

  return (
    <div className="space-y-10">
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">执行概览</h2>
            <p className="text-sm text-muted-foreground">实时统计任务运行状态与平均耗时。</p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadStats} disabled={statsLoading}>
            {statsLoading ? "刷新中..." : "刷新统计"}
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>
        {stats?.by_model && stats.by_model.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">配置别名</th>
                  <th className="px-2 py-2 font-medium">模型</th>
                  <th className="px-2 py-2 font-medium">任务数</th>
                  <th className="px-2 py-2 font-medium">完成率</th>
                  <th className="px-2 py-2 font-medium">平均时长</th>
                </tr>
              </thead>
              <tbody>
                {stats.by_model.map((item) => (
                  <tr key={item.config_alias} className="border-t border-border/50">
                    <td className="px-2 py-2 font-medium">{item.config_alias}</td>
                    <td className="px-2 py-2">{item.model_name}</td>
                    <td className="px-2 py-2">{item.task_count}</td>
                    <td className="px-2 py-2">{item.success_rate}%</td>
                    <td className="px-2 py-2">{item.avg_completion_time.toFixed(2)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">模型配置</h2>
            <Button variant="ghost" size="sm" onClick={loadConfigs} disabled={configLoading}>
              {configLoading ? "加载中..." : "刷新"}
            </Button>
          </div>
          <form className="mt-4 grid gap-3" onSubmit={handleConfigSubmit}>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">配置别名</label>
              <input
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={configForm.config_alias}
                onChange={(event) =>
                  setConfigForm((prev) => ({ ...prev, config_alias: event.target.value }))
                }
                placeholder="例如：qwen-plus-local"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">模型名称</label>
              <input
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={configForm.model_name}
                onChange={(event) =>
                  setConfigForm((prev) => ({ ...prev, model_name: event.target.value }))
                }
                placeholder="qwen-plus"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">API Base URL</label>
              <input
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={configForm.base_url}
                onChange={(event) =>
                  setConfigForm((prev) => ({ ...prev, base_url: event.target.value }))
                }
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <input
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={configForm.api_key}
                onChange={(event) =>
                  setConfigForm((prev) => ({ ...prev, api_key: event.target.value }))
                }
                placeholder="sk-xxxx"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              保存配置
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            {configs.length === 0 && <p className="text-sm text-muted-foreground">暂无配置</p>}
            {configs.map((config) => (
              <div
                key={config.id}
                className="rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{config.config_alias}</p>
                    <p className="text-xs text-muted-foreground">{config.model_name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config)}>
                    删除
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground break-all">{config.base_url}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">创建任务</h2>
            <Button variant="ghost" size="sm" onClick={loadTasks} disabled={tasksLoading}>
              {tasksLoading ? "加载中..." : "刷新任务"}
            </Button>
          </div>
          <form className="mt-4 space-y-3" onSubmit={handleTaskSubmit}>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">软件名称</label>
              <input
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={taskForm.software_name}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, software_name: event.target.value }))
                }
                placeholder="例如：智能排课系统"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">使用的模型配置</label>
              <select
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                value={taskForm.config_id}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, config_id: event.target.value }))
                }
                required
              >
                <option value="">请选择</option>
                {configs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.config_alias}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              立即创建
            </Button>
          </form>
          <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-4">
            <p className="text-sm font-semibold">操作提示</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· 任务会后台运行，可在列表中查看实时状态</li>
              <li>· 支持批量下载：材料 PDF、代码 HTML、全量 ZIP</li>
              <li>· 如需重新开始任务，可删除后再次创建</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">任务列表</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">软件名称</th>
                <th className="px-3 py-2 font-medium">模型配置</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">进度</th>
                <th className="px-3 py-2 font-medium">更新时间</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    还没有任务，先创建一个试试吧。
                  </td>
                </tr>
              )}
              {tasks.map((task) => {
                const statusClass = statusColors[task.status] ?? "text-slate-600 bg-slate-50 border-slate-200";
                return (
                  <tr
                    key={task.task_id}
                    className={`cursor-pointer border-t border-border/50 transition hover:bg-slate-50 ${
                      selectedTaskId === task.task_id ? "bg-slate-50" : ""
                    }`}
                    onClick={() => setSelectedTaskId(task.task_id)}
                  >
                    <td className="px-3 py-3 font-medium">{task.software_name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{task.config_alias ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">{task.progress ?? 0}%</td>
                    <td className="px-3 py-3">{formatDate(task.updated_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRefreshTask(task.task_id);
                          }}
                        >
                          刷新
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownload(task.task_id, { type: "all-files" });
                          }}
                        >
                          下载材料
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveTask(task);
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTaskId && (
        <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">任务详情</h2>
              <p className="text-sm text-muted-foreground">ID：{selectedTaskId}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTaskId(null)}>
              关闭
            </Button>
          </div>
          {detailLoading && <p className="mt-4 text-sm text-muted-foreground">加载中...</p>}
          {selectedTask && !detailLoading && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatBlock label="软件名称" value={selectedTask.software_name} />
                <StatBlock label="模型配置" value={selectedTask.config_alias ?? "—"} />
                <StatBlock label="状态" value={selectedTask.status} />
                <StatBlock label="进度" value={`${selectedTask.progress ?? 0}%`} />
                <StatBlock label="当前阶段" value={selectedTask.current_stage ?? "—"} />
                <StatBlock label="更新时间" value={formatDate(selectedTask.updated_at)} />
              </div>

              {selectedTask.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-700">
                  <p className="font-medium">异常信息</p>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{selectedTask.error}</pre>
                </div>
              )}

              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-sm font-semibold">材料下载</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button onClick={() => handleDownload(selectedTask.task_id, { type: "manual" })}>
                    用户手册
                  </Button>
                  <Button onClick={() => handleDownload(selectedTask.task_id, { type: "info_form" })}>
                    信息表
                  </Button>
                  <Button onClick={() => handleDownload(selectedTask.task_id, { type: "source_code" })}>
                    源代码 PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadFull(selectedTask.task_id)}>
                    完整目录快照
                  </Button>
                </div>
              </div>

            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  } catch {
    return value;
  }
}
