"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { CATEGORY_LIST } from "@/app/copyright/categories";

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORY_LIST.map((category) => {
        const href = `/copyright/${category.slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={category.slug}
            href={href}
            className={cn(
              "group relative flex flex-col gap-1 rounded-2xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-3 sm:py-2.5",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
            )}
          >
            <span className="text-sm font-semibold">{category.label}</span>
            <span className="text-xs text-muted-foreground sm:text-[13px] sm:font-normal">
              {category.tagline}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
