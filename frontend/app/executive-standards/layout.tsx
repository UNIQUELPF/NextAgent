import type { ReactNode } from "react";

import { SectorNav } from "@/components/executive-standards/sector-nav";

export default function ExecutiveStandardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-10 text-sm sm:text-base">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white p-8 shadow-[0_30px_90px_rgba(90,104,255,0.12)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">执行标准备案指挥中心</h1>
                <p className="text-base text-slate-600">
                  按品类快速定位适用的国家标准、行业标准或团体标准，自动分配检测任务、
                  生成材料包并跟踪审批链路，帮助企业高效完成备案。
                </p>
              </div>
              <div className="mx-auto max-w-4xl">
                <SectorNav />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
