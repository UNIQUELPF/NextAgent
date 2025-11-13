import type { ReactNode } from "react";

import { BarcodeNav } from "@/components/barcodes/nav";

export default function BarcodeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/10 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">商品条码运营中心</h1>
                <p className="text-base text-slate-600">
                  管理国家授权的商品条码前缀号、批次发放、渠道同步与续费提醒，
                  通过智能 Agent 自动生成条码申请材料、码表与平台校验文件。
                </p>
              </div>
              <div className="mx-auto max-w-3xl">
                <BarcodeNav />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
