"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { DISINFECTANT_LIST } from "@/app/cosmetics/config";
import { cn } from "@/lib/utils";

export function DisinfectantNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return DISINFECTANT_LIST;
    }
    return DISINFECTANT_LIST.filter((item) =>
      `${item.label}${item.description}${item.highlight}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="搜索消毒产品类别或关键词..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-border/70 bg-background px-10 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const href = `/cosmetics/${item.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.slug}
              href={href}
              className={cn(
                "flex flex-col gap-1 rounded-2xl border p-4 transition hover:-translate-y-1",
                isActive
                  ? "border-primary/60 bg-primary/10 shadow-md"
                  : "border-border/70 bg-background/70 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.activeCount} 在办
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <span className="text-xs font-medium text-primary">{item.highlight}</span>
            </Link>
          );
        })}
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
            未找到相关类别，请调整搜索条件或创建自定义流程。
          </p>
        ) : null}
      </div>
    </div>
  );
}
