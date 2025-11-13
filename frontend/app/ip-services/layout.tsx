import type { ReactNode } from "react";

import { ProcessNav } from "@/components/ip-services/process-nav";

export default function IPServicesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">商标 · 版权 · 专利运营中心</h1>
                <p className="text-base text-slate-600">
                  管理商标注册、变更、转让、注销等流程，并整合版权登记、专利申请与年费提醒，
                  通过智能代理实现材料生成、进度追踪与风险提示。
                </p>
              </div>
              <div className="mx-auto max-w-5xl">
                <ProcessNav />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
