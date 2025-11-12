"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, Layers, ShieldCheck, Phone } from "lucide-react";

const DOCK_ITEMS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/executive-standards", label: "备案", icon: Layers },
  { href: "/ip-services", label: "权益", icon: ShieldCheck },
  { href: "/about", label: "联系", icon: Phone },
];

export function MobileDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollRef.current;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const nearBottom = maxScroll - current <= 80;
      if (nearBottom) {
        setVisible(true);
      } else if (visible) {
        setVisible(false);
      }

      lastScrollRef.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-4 z-60 px-4 transition duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <nav className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-2xl border border-border/70 bg-background/95 px-3 py-2 shadow-xl shadow-black/10 backdrop-blur">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
