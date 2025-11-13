"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { FOOD_CATEGORY_LIST } from "@/app/functional-food/categories";
import { cn } from "@/lib/utils";

export function FoodCategoryNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return FOOD_CATEGORY_LIST;
    }
    return FOOD_CATEGORY_LIST.filter((category) =>
      `${category.label}${category.description}${category.highlight}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  }, [query]);

  return (
    <div className="space-y-6 text-base">
      <div className="flex justify-center">
        <div className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="搜索食品品类或关键词..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-white px-11 py-2.5 text-base outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((category) => {
          const href = `/functional-food/${category.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={category.slug}
              href={href}
              className={cn(
                "flex flex-col gap-2 rounded-3xl border p-5 transition hover:-translate-y-1",
                isActive
                  ? "border-secondary/60 bg-secondary/15 shadow-md"
                  : "border-border/70 bg-background/70 hover:border-secondary/40 hover:bg-secondary/10",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-semibold text-foreground">{category.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-base text-muted-foreground">
                  {category.activeCount} 在办
                </span>
              </div>
              <p className="text-base text-muted-foreground">{category.description}</p>
              <span className="text-base font-medium text-secondary">{category.highlight}</span>
            </Link>
          );
        })}
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-base text-muted-foreground">
            未找到相关品类，请调整搜索条件或创建自定义流程。
          </p>
        ) : null}
      </div>
    </div>
  );
}
