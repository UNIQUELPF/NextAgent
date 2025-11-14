import { apiFetch } from "@/lib/api";

const API_PREFIX = "/api/v1/ruanzhu";

export interface RuanzhuConfig {
  id: number;
  config_alias: string;
  model_name: string;
  base_url?: string;
  api_key?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RuanzhuTask {
  task_id: string;
  status: string;
  software_name: string;
  config_id?: number;
  config_alias?: string;
  model_name?: string;
  progress?: number;
  current_stage?: string;
  files?: Record<string, unknown>;
  error?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface RuanzhuCodeFile {
  file_name: string;
  module_id: string;
  module_name: string;
  url: string;
}

export interface RuanzhuStatistics {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  running_tasks: number;
  pending_tasks: number;
  deleted_tasks: number;
  available_tasks: number;
  avg_completion_time: number;
  min_completion_time: number;
  max_completion_time: number;
  total_downloads?: number;
  download_by_type?: Record<string, number>;
  by_model?: Array<{
    config_alias: string;
    model_name: string;
    task_count: number;
    completed_count: number;
    failed_count: number;
    success_rate: number;
    avg_completion_time: number;
  }>;
}

export async function fetchRuanzhuConfigs(signal?: AbortSignal): Promise<RuanzhuConfig[]> {
  const data = await apiFetch<{ configs: RuanzhuConfig[] }>(`${API_PREFIX}/configs`, {
    signal,
  });
  return data.configs ?? [];
}

export async function createRuanzhuConfig(payload: {
  config_alias: string;
  model_name: string;
  base_url: string;
  api_key: string;
}) {
  return apiFetch(`${API_PREFIX}/configs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteRuanzhuConfig(id: number) {
  return apiFetch(`${API_PREFIX}/configs/${id}`, {
    method: "DELETE",
  });
}

export async function fetchRuanzhuTasks(signal?: AbortSignal): Promise<RuanzhuTask[]> {
  const data = await apiFetch<{ items: RuanzhuTask[] }>(`${API_PREFIX}/tasks`, { signal });
  return data.items ?? [];
}

export async function createRuanzhuTask(payload: { software_name: string; config_id: number }) {
  return apiFetch<RuanzhuTask>(`${API_PREFIX}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRuanzhuTaskDetail(taskId: string, signal?: AbortSignal) {
  return apiFetch<RuanzhuTask>(`${API_PREFIX}/tasks/${taskId}`, { signal });
}

export async function removeRuanzhuTask(taskId: string) {
  return apiFetch(`${API_PREFIX}/tasks/${taskId}/remove`, {
    method: "POST",
  });
}

export async function fetchRuanzhuCodeFiles(taskId: string, signal?: AbortSignal) {
  const data = await apiFetch<{ items: RuanzhuCodeFile[] }>(
    `${API_PREFIX}/tasks/${taskId}/code-files`,
    { signal },
  );
  return data.items ?? [];
}

export async function fetchRuanzhuStatistics(signal?: AbortSignal) {
  return apiFetch<RuanzhuStatistics>(`${API_PREFIX}/statistics`, { signal });
}

export async function downloadRuanzhuFile(taskId: string, options: { type: string; filename?: string }) {
  if (typeof window === "undefined") {
    return;
  }
  const params = new URLSearchParams({ type: options.type });
  if (options.filename) {
    params.set("filename", options.filename);
  }
  await performDownload(`${API_PREFIX}/tasks/${taskId}/download?${params.toString()}`);
}

export async function downloadRuanzhuFullTask(taskId: string) {
  if (typeof window === "undefined") {
    return;
  }
  await performDownload(`${API_PREFIX}/tasks/${taskId}/download-full`);
}

async function performDownload(url: string) {
  const response = await fetch(url, {
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "下载失败");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = extractFilename(disposition) || `ruanzhu-${Date.now()}`;

  const link = document.createElement("a");
  const blobUrl = window.URL.createObjectURL(blob);
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

function extractFilename(disposition: string): string | null {
  if (!disposition) {
    return null;
  }
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  if (!match || match.length < 2) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
