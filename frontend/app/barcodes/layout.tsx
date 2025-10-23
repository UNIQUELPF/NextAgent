import type { ReactNode } from "react";

import { BarcodeNav } from "@/components/barcodes/nav";

export default function BarcodeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">商品条码运营中心</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              管理国家授权的商品条码前缀号、批次发放、渠道同步与续费提醒，
              通过智能 Agent 自动生成条码申请材料、码表与平台校验文件。
            </p>
          </div>
          <BarcodeNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
