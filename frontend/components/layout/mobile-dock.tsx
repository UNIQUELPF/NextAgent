"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, Layers, ShieldCheck, Phone } from "lucide-react";

const DOCK_ITEMS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/copyright#copyright-workbench", label: "软件著作", icon: Layers },
  { href: "/knowledge-graph", label: "知识图谱", icon: ShieldCheck },
  { href: "/about", label: "联系", icon: Phone },
];

export function MobileDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleScroll = () => {
      const current = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const distance = maxScroll - current;
      const shouldShow = distance <= 120;
      const shouldHide = distance > 240;

      if (shouldShow) {
        setVisible(true);
      } else if (visible && shouldHide) {
        setVisible(false);
      }

      lastScrollRef.current = current;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  const dockStateClass = visible
    ? "pointer-events-auto translate-y-0 opacity-100"
    : "pointer-events-none translate-y-20 opacity-0";

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-[9999] px-4 transition duration-300 md:hidden ${dockStateClass}`}
    >
      <nav className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-2xl border border-border/70 bg-background/95 px-3 py-2 shadow-xl shadow-black/10 backdrop-blur">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const basePath = item.href.split("#")[0] || "/";
          const active = pathname === basePath || pathname.startsWith(basePath);
          return (
            <button
              type="button"
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label={item.label}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
