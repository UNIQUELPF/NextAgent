"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Session } from "@ory/client";

import { MainNav } from "./main-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHeaderVisibility } from "@/components/providers/header-visibility";
import { ory } from "@/lib/ory";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { hasRole, isInternal } from "@/lib/auth";
import { ADMIN_ACCESS_ROLES, ADMIN_SECTIONS } from "@/lib/admin-navigation";

const MOBILE_SCROLL_RETRIES = 3;

export function SiteHeader() {
  const { visible } = useHeaderVisibility();
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const adminMenuRef = useRef<HTMLDivElement | null>(null);
  const pendingMobileScrollAttemptsRef = useRef(0);
  const pathname = usePathname();

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const root = document.scrollingElement || document.documentElement || document.body;
    if (root) {
      root.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

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
    setIsMobileNavOpen(false);
    if (pendingMobileScrollAttemptsRef.current > 0) {
      pendingMobileScrollAttemptsRef.current -= 1;
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          scrollToTop();
          window.requestAnimationFrame(scrollToTop);
        });
      } else {
        scrollToTop();
      }
    }
  }, [pathname, scrollToTop]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isMenuOpen && !isAdminMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (isAdminMenuOpen && adminMenuRef.current && !adminMenuRef.current.contains(target)) {
        setIsAdminMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen, isAdminMenuOpen]);

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

  const handleMobileNavigate = useCallback(() => {
    pendingMobileScrollAttemptsRef.current = MOBILE_SCROLL_RETRIES;
    setIsMobileNavOpen(false);
  }, []);

  const canAccessAdminMenu = true;

  if (!visible) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="relative overflow-visible border-b border-border/60 bg-pure-white shadow-[0_12px_35px_rgba(17,17,17,0.08)]">
        <div className="mx-auto flex w-full max-w-[3600px] items-center justify-center gap-14 px-12 py-4 lg:px-16">
          <div className="flex flex-[0.4] items-center justify-start gap-2 pr-6 lg:justify-end">
            <Link
              href="/"
              className="logo-soft-shadow relative flex items-center rounded-2xl border border-white/50 bg-pure-white-soft px-3 py-1.5 shadow-inner shadow-white/40"
            >
              <Image
                src="/logo.png"
                alt="企标邦"
                priority
                width={180}
                height={56}
                className="h-11 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="hidden flex-[1.2] justify-center px-12 lg:flex lg:justify-center lg:ml-12 lg:mr-0">
            <MainNav className="w-full max-w-[2350px] shrink-0" />
          </div>
          <div className="flex flex-[0.6] items-center justify-end gap-3 px-6 lg:justify-center lg:pl-4">
            {canAccessAdminMenu ? (
              <div className="relative hidden md:flex z-50" ref={adminMenuRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-full border border-slate-200/60 px-5 text-base font-semibold text-slate-900 transition hover:border-[#5A68FF]/60 hover:text-[#5A68FF]"
                  )}
                  onClick={() => setIsAdminMenuOpen((open) => !open)}
                  aria-expanded={isAdminMenuOpen}
                  aria-haspopup="menu"
                  aria-label="管理控制台"
                >
                  <Settings className="h-5 w-5" />
                  控制台
                </button>
                <AnimatePresence>
                  {isAdminMenuOpen ? (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-[calc(100%+8px)] z-60 w-48 rounded-2xl border border-white/80 bg-pure-white p-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-[#5A68FF]/15"
                    >
                      {ADMIN_SECTIONS.map((item) => (
                        <Link
                          key={item.href}
                          role="menuitem"
                          href={item.href}
                          className="block rounded-xl px-3 py-2 hover:bg-slate-100"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
            {session ? (
              <div className="relative hidden items-center md:flex z-50" ref={menuRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-full border border-slate-200/60 px-5 text-base font-semibold text-slate-900 transition hover:border-[#5A68FF]/60 hover:text-[#5A68FF]"
                  )}
                  onClick={() => setIsMenuOpen((open) => !open)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                >
                  <UserRound className="h-5 w-5" />
                  {displayLabel || "账户"}
                </button>
                <AnimatePresence>
                  {isMenuOpen ? (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-[calc(100%+8px)] z-60 w-48 rounded-2xl border border-white/80 bg-pure-white p-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-[#5A68FF]/15"
                    >
                      <Link
                        role="menuitem"
                        href="/account/settings?section=profile"
                        className="block rounded-xl px-3 py-2 hover:bg-slate-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        个人信息
                      </Link>
                      <Link
                        role="menuitem"
                        href="/account/settings?section=password"
                        className="block rounded-xl px-3 py-2 hover:bg-slate-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        更改密码
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full rounded-xl px-3 py-2 text-left text-destructive hover:bg-red-50"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? "退出中..." : "退出登录"}
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden rounded-full border border-slate-200/60 px-5 py-2.5 text-base font-semibold text-slate-900 transition hover:border-[#5A68FF]/60 hover:text-[#5A68FF] md:inline-flex"
              >
                登录
              </Link>
            )}
            <Button
              size="lg"
              className="hidden rounded-full bg-primary px-6 py-2.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/25 lg:inline-flex transition hover:bg-primary/90"
            >
              创建任务
            </Button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-pure-white-soft text-slate-700 shadow-lg shadow-slate-300/50 transition hover:text-[#605CFF] lg:hidden"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              aria-label="打开菜单"
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 top-[82px] z-60 lg:hidden border-b border-white/60 bg-pure-white px-4 pb-6 pt-4 shadow-2xl shadow-indigo-500/10"
          >
            <MainNav direction="column" className="gap-3" onNavigate={handleMobileNavigate} />
            {canAccessAdminMenu ? (
              <div className="mt-4 space-y-2">
                {ADMIN_SECTIONS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-2xl border border-slate-200/70 bg-pure-white px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={handleMobileNavigate}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              {session ? (
                <>
                  <Link
                    href="/account/settings?section=profile"
                    className="block rounded-2xl border border-slate-200/70 bg-pure-white px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={handleMobileNavigate}
                  >
                    个人信息
                  </Link>
                  <Link
                    href="/account/settings?section=password"
                    className="block rounded-2xl border border-slate-200/70 bg-pure-white px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={handleMobileNavigate}
                  >
                    更改密码
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200/80"
                    onClick={() => {
                      handleMobileNavigate();
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "退出中..." : "退出登录"}
                  </Button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block rounded-2xl border border-slate-200/70 bg-pure-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
                  onClick={handleMobileNavigate}
                >
                  登录
                </Link>
              )}
              <Button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90">
                创建任务
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
