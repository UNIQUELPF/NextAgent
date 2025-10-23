import type { ReactNode } from "react";

import { ProcessNav } from "@/components/ip-services/process-nav";

export default function IPServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">商标 · 版权 · 专利运营中心</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              管理商标注册、变更、转让、注销等流程，并整合版权登记、专利申请与年费提醒，
              通过智能代理实现材料生成、进度追踪与风险提示。
            </p>
          </div>
          <ProcessNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
