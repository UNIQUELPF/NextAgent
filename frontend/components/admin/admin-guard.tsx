"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useCurrentUser } from "@/components/providers/current-user-provider";
import { ADMIN_ACCESS_ROLES } from "@/lib/admin-navigation";
import { hasRole, isInternal } from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = useMemo(() => {
    if (!user) {
      return false;
    }
    if (isInternal(user)) {
      return true;
    }
    return ADMIN_ACCESS_ROLES.some((role) => hasRole(user, role));
  }, [user]);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace("/auth/login?return_to=" + encodeURIComponent(pathname || "/"));
    }
  }, [allowed, loading, pathname, router]);

  if (loading) {
    return (
      <div className="container py-12 text-center text-sm text-muted-foreground">
        正在校验权限...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="container py-12 text-center text-sm text-muted-foreground">
        无访问权限，即将跳转到登录页面。
      </div>
    );
  }

  return <>{children}</>;
}
