import type { ReactNode } from "react";

import { CategoryNav } from "@/components/copyright/category-nav";

export default function CopyrightLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-10">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">著作权工作台</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              针对软件、文学、音乐、美术等多类型作品，提供结构化的自动申请流程，
              快速生成材料、管理复核与同步政策更新。
            </p>
          </div>
          <CategoryNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
