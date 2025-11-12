"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/executive-standards", label: "执行标准备案" },
  { href: "/ip-services", label: "商标版权专利" },
  { href: "/functional-food", label: "药食同源备案" },
  { href: "/cosmetics", label: "消字号备案" },
  { href: "/barcodes", label: "条形码注册" },
  { href: "/copyright", label: "著作权" },
  { href: "/skills", label: "技能证书" },
  { href: "/systems", label: "体系认证" },
  { href: "/about", label: "关于我们" },
];

type MainNavProps = {
  direction?: "row" | "column";
  className?: string;
  onNavigate?: () => void;
};

const SEGMENTED_COUNT = 6;
const NAV_TYPOGRAPHY = "text-[0.9rem] font-semibold tracking-tight sm:text-[0.95rem] lg:text-base";
const NAV_ACTIVE_TEXT = "text-primary";
const NAV_MUTED_TEXT = "text-muted-foreground group-hover:text-foreground";

export function MainNav({ direction = "row", className, onNavigate }: MainNavProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.slice(0, SEGMENTED_COUNT);
  const overflowItems = NAV_ITEMS.slice(SEGMENTED_COUNT);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setMoreOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  return (
    <nav
      className={cn(
        "relative flex min-h-[48px] gap-2 rounded-2xl border border-white/70",
        direction === "column"
          ? "flex-col bg-pure-white p-4 shadow-lg"
          : "w-full items-center justify-center bg-pure-white-muted p-1",
        className,
      )}
    >
      {direction === "column" ? (
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => renderListLink({ item, pathname, onNavigate }))}
        </div>
      ) : (
        <div className="flex w-full max-w-[1200px] items-center justify-center gap-2">
          <div className="flex w-full items-center gap-1 rounded-full bg-pure-white-ghost px-2.5 py-1.5 text-slate-600">
            {visibleItems.map((item) => renderSegment({ item, pathname, onNavigate }))}
          </div>
          {overflowItems.length > 0 ? (
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-pure-white-soft text-slate-700 shadow-sm transition",
                  moreOpen ? "text-[#5A68FF]" : "hover:text-[#5A68FF]",
                )}
                onClick={() => setMoreOpen((prev) => !prev)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {moreOpen ? (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-60 w-56 rounded-2xl border border-white/80 bg-pure-white p-2 shadow-2xl shadow-[#5A68FF]/15"
                >
                  {overflowItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        onNavigate?.();
                        setMoreOpen(false);
                      }}
                className={cn(
                  "block rounded-xl px-2.5 py-1.5 text-sm transition",
                  pathname.startsWith(item.href)
                    ? "bg-[#EEF0FF] font-semibold text-[#3940FF]"
                    : "text-slate-600 hover:bg-pure-white-soft",
                )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}

function renderSegment({
  item,
  pathname,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex-1 overflow-hidden rounded-full px-4 py-1.5 text-center transition-all duration-300",
        isActive
          ? "bg-pure-white shadow-[0_20px_35px_-22px_rgba(90,96,255,0.85)] ring-1 ring-[#96B0FF]/60"
          : "bg-pure-white-faint hover:bg-pure-white-muted",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-pure-white px-2.5 py-0.5 shadow-sm",
          NAV_TYPOGRAPHY,
          isActive ? NAV_ACTIVE_TEXT : NAV_MUTED_TEXT,
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

function renderListLink({
  item,
  pathname,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group rounded-2xl border px-3.5 py-2 transition-all duration-300",
        isActive
          ? "border-[#5A68FF]/60 bg-pure-white-soft shadow-lg shadow-[#5A68FF]/20"
          : "border-border/70 bg-pure-white-muted text-slate-600 hover:border-[#5A68FF]/40 hover:bg-pure-white-soft",
      )}
    >
      <span className={cn("inline-flex items-center", NAV_TYPOGRAPHY, isActive ? NAV_ACTIVE_TEXT : NAV_MUTED_TEXT)}>
        {item.label}
      </span>
    </Link>
  );
}
