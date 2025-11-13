"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Filter, Search } from "lucide-react";

import { PROCESS_LIST } from "@/app/ip-services/config";
import { cn } from "@/lib/utils";

export function ProcessNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return PROCESS_LIST;
    }
    return PROCESS_LIST.filter((process) =>
      `${process.label}${process.description}${process.highlight}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  }, [query]);

  return (
    <div className="space-y-6 text-lg">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
        <div className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="搜索业务类型或关键词..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-white px-11 py-2.5 text-lg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-5 py-2.5 text-lg text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <Filter className="h-5 w-5" />
          保存视图
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const href = `/ip-services/${item.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.slug}
              href={href}
              className={cn(
                "flex flex-col gap-2 rounded-3xl border p-5 transition hover:-translate-y-1",
                isActive
                  ? "border-primary/60 bg-primary/10 shadow-md"
                  : "border-border/70 bg-background/70 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  {item.label}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-base text-muted-foreground">
                  {item.highlight}
                </span>
              </div>
              <p className="text-base text-muted-foreground">{item.description}</p>
            </Link>
          );
        })}
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-3xl border border-dashed border-border/60 bg-background/60 p-6 text-lg text-muted-foreground">
            没有匹配的流程类型，请调整搜索条件或创建自定义流程。
          </p>
        ) : null}
      </div>
    </div>
  );
}
