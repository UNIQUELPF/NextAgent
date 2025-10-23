import type { ReactNode } from "react";

import { FoodCategoryNav } from "@/components/functional-food/category-nav";

export default function FunctionalFoodLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 bg-background/80 py-8">
        <div className="container space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">药食同源备案作业中心</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              针对配制酒、压片糖果、固体饮料、代用茶、谷物等食品品类，自动匹配执行标准、
              校验原料限量、生成检测委托与备案材料，确保食品标准备案高效通过。
            </p>
          </div>
          <FoodCategoryNav />
        </div>
      </section>
      <div className="container pb-16">{children}</div>
    </div>
  );
}
