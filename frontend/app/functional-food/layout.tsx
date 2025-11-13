import type { ReactNode } from "react";

import { FoodCategoryNav } from "@/components/functional-food/category-nav";

export default function FunctionalFoodLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">药食同源备案作业中心</h1>
                <p className="text-base text-slate-600">
                  针对配制酒、压片糖果、固体饮料、代用茶、谷物等食品品类，自动匹配执行标准、
                  校验原料限量、生成检测委托与备案材料，确保食品标准备案高效通过。
                </p>
              </div>
              <div className="mx-auto max-w-4xl">
                <FoodCategoryNav />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
