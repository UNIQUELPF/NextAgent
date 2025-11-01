export interface ApiError extends Error {
  status: number;
  payload?: unknown;
}

function createApiError(status: number, message: string, payload?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  if (payload !== undefined) {
    error.payload = payload;
  }
  return error;
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const config: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  };

  const response = await fetch(input, config);
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json().catch(() => undefined) : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body || response.statusText
        : (body as { error?: { message?: string } })?.error?.message || response.statusText;
    throw createApiError(response.status, message, body);
  }

  return body as T;
}
