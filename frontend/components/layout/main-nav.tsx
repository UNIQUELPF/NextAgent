"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
