import type { ReactNode } from "react";

import { DisinfectantNav } from "@/components/cosmetics/disinfectant-nav";

export default function DisinfectantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">消字号批文作业中心</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              管理皮肤消毒、物体表面消毒、空气消毒、织物消毒、医用辅助等产品的消字号批文申请，
              自动校验配方、协调检验、生成材料并追踪审批反馈。
            </p>
          </div>
          <DisinfectantNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
