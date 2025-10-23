import type { ReactNode } from "react";

import { SectorNav } from "@/components/executive-standards/sector-nav";

export default function ExecutiveStandardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">执行标准备案指挥中心</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              按品类快速定位适用的国家标准、行业标准或团体标准，自动分配检测任务、
              生成材料包并跟踪审批链路，帮助企业高效完成备案。
            </p>
          </div>
          <SectorNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
