"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { usePathname } from "next/navigation";

import { CurrentUser, getCurrentUser } from "@/lib/auth";

interface CurrentUserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentUser();
      setUser(result);
    } catch (err) {
      console.error("加载当前用户失败", err);
      setError(err instanceof Error ? err.message : "加载当前用户失败");
      setUser(null);
    } finally {
      lastFetchRef.current = Date.now();
      setLoading(false);
    }
  }, []);

  const ensureFresh = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1500) {
      return;
    }
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ensureFresh();
      }
    };

    const onFocus = () => {
      ensureFresh();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [ensureFresh]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user,
      loading,
      error,
      refresh: load,
    }),
    [user, loading, error, load],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser 必须在 CurrentUserProvider 内部使用");
  }
  return context;
}
