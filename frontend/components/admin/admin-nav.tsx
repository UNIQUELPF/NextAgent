"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_SECTIONS } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {ADMIN_SECTIONS.map((section) => {
        const isActive =
          section.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(section.href);
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "rounded-md border border-border/60 px-3 py-1.5 text-sm transition-colors",
              "hover:border-primary/80 hover:bg-primary/5 hover:text-primary",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
