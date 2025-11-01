import { apiFetch, type ApiError } from "./api";

export interface CurrentUser {
  subject: string;
  userType: "internal" | "external";
  tenantId: string | null;
  roles: string[];
}

interface MeResponse {
  subject?: string;
  user_type?: string;
  tenant_id?: string;
  roles?: string[];
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const data = await apiFetch<MeResponse>("/api/v1/me", {
      method: "GET",
      cache: "no-store",
    });

    const subject = data.subject ?? "";
    if (!subject) {
      return null;
    }

    const rawType = typeof data.user_type === "string" ? data.user_type : "external";
    const userType: CurrentUser["userType"] =
      rawType === "internal" ? "internal" : "external";

    const roles = Array.isArray(data.roles)
      ? data.roles.filter((role): role is string => typeof role === "string" && role.length > 0)
      : [];

    const tenantId =
      typeof data.tenant_id === "string" && data.tenant_id.trim().length > 0
        ? data.tenant_id
        : null;

    return {
      subject,
      userType,
      tenantId,
      roles,
    };
  } catch (error) {
    const apiError = error as Partial<ApiError>;
    if (apiError.status === 401 || apiError.status === 403) {
      return null;
    }
    throw error;
  }
}

export function hasRole(user: CurrentUser | null, role: string): boolean {
  if (!user || !role) {
    return false;
  }
  return user.roles.some((item) => item === role);
}

export function isInternal(user: CurrentUser | null): boolean {
  return user?.userType === "internal";
}
