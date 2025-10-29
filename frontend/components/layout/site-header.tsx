"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@ory/client";

import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHeaderVisibility } from "@/components/providers/header-visibility";
import { ory } from "@/lib/ory";

export function SiteHeader() {
  const { visible } = useHeaderVisibility();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const { data } = await ory.toSession();
        if (!cancelled) {
          setSession(data);
        }
      } catch (_err) {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
      }
    }
    // Lazily load once the header becomes visible to avoid unnecessary requests.
    if (visible) {
      loadSession();
    }
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  const displayLabel = useMemo(() => {
    if (!session) {
      return "";
    }
    const traits = (session.identity?.traits as Record<string, unknown>) ?? {};
    const username = typeof traits.username === "string" ? traits.username : "";
    const rawNickname = typeof traits.nickname === "string" ? traits.nickname : "";
    const rawUsername = username || "";
    const phone = typeof traits.phone === "string" ? traits.phone : "";
    const fallback = session.identity?.id ?? "";

    const base =
      rawNickname ||
      rawUsername ||
      (phone ? phone.replace("+86", "") : "") ||
      fallback;

    if (!base) {
      return "";
    }

    const glyphs = Array.from(base);
    if (glyphs.length <= 4) {
      return base;
    }

    return glyphs.slice(0, 4).join("") + "…";
  }, [session]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      const { data } = await ory.createBrowserLogoutFlow({ returnTo: "http://localhost:4456/" });
      if (data.logout_token && !data.logout_url) {
        await ory.updateLogoutFlow({ token: data.logout_token });
        setSession(null);
        window.location.href = "/";
        return;
      }
      if (data.logout_url) {
        window.location.href = data.logout_url;
        return;
      }
    } catch (err) {
      console.error("logout failed", err);
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  if (!visible) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-1.5"
          >
            <Image
              src="/logo.png"
              alt="企标邦"
              priority
              width={112}
              height={32}
              className="h-6 w-auto"
            />
          </Link>
          <div className="hidden lg:block">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsMenuOpen((open) => !open)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                >
                  <UserRound className="h-4 w-4" />
                  {displayLabel || "账户"}
                </button>
                {isMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-md border border-border/80 bg-popover shadow-lg focus:outline-none"
                  >
                    <Link
                      role="menuitem"
                      href="/account/settings?section=profile"
                      className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      个人信息
                    </Link>
                    <Link
                      role="menuitem"
                      href="/account/settings?section=password"
                      className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      更改密码
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? "退出中..." : "退出登录"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                "hidden md:inline-flex",
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-muted hover:text-foreground"
              )}
            >
              登录
            </Link>
          )}
          <Button size="sm">创建任务</Button>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/90 px-4 py-2 lg:hidden">
        <MainNav />
        {session ? (
          <div className="mt-2 flex flex-col gap-2">
            <Link
              href="/account/settings?section=profile"
              className="inline-flex w-full items-center justify-start rounded-md border border-border px-3 py-2 text-sm font-medium"
            >
              个人信息
            </Link>
            <Link
              href="/account/settings?section=password"
              className="inline-flex w-full items-center justify-start rounded-md border border-border px-3 py-2 text-sm font-medium"
            >
              更改密码
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "退出中..." : "退出登录"}
            </Button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium"
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
