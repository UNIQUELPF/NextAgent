import type { ReactNode } from "react";

import { DisinfectantNav } from "@/components/cosmetics/disinfectant-nav";

export default function DisinfectantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/10 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">消字号批文作业中心</h1>
                <p className="text-sm text-slate-600">
                  管理皮肤消毒、物体表面消毒、空气消毒、织物消毒、医用辅助等产品的消字号批文申请，
                  自动校验配方、协调检验、生成材料并追踪审批反馈。
                </p>
              </div>
              <div className="mx-auto max-w-4xl">
                <DisinfectantNav />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
