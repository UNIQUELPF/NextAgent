"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Beaker,
  CalendarClock,
  ClipboardCheck,
  FlaskConical,
  Microscope,
  UtensilsCrossed,
} from "lucide-react";

import type {
  AlertItem,
  FoodCategoryConfig,
  IngredientRule,
  MaterialTemplate,
  StandardItem,
} from "@/app/functional-food/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  config: FoodCategoryConfig;
};

export function FunctionalFoodDashboard({ config }: Props) {
  return (
    <div className="space-y-10">
      <Hero config={config} />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Standards standards={config.standards} ingredients={config.ingredients} />
        <Pipeline stages={config.pipeline} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Tasks config={config} />
        <Materials materials={config.materials} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <Alerts alerts={config.alerts} />
        <Knowledge knowledge={config.knowledge} />
      </div>
    </div>
  );
}

function Hero({ config }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/10 p-8 shadow-sm">
      <div className="pointer-events-none absolute right-10 top-0 hidden h-48 w-48 rounded-full bg-secondary/20 blur-3xl md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          食品标准智能代理
        </span>
        <h2 className="text-3xl font-semibold leading-tight">{config.heroTitle}</h2>
        <p className="max-w-3xl text-base text-muted-foreground">{config.heroDescription}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="group">
            发起备案
            <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" size="lg">
            查看检测排期
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

function Metrics({ config }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">关键指标</h3>
        <Button variant="ghost" size="sm">
          导出报表
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {config.metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="rounded-2xl border border-border/70 bg-background/75 p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{metric.title}</p>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-xs font-medium text-secondary">{metric.trend}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Standards({
  standards,
  ingredients,
}: {
  standards: StandardItem[];
  ingredients: IngredientRule[];
}) {
  return (
    <section className="space-y-6 rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">标准匹配与原料限量</h3>
          <p className="mt-1 text-sm text-muted-foreground">自动推荐标准组合并提示原料合规性。</p>
        </div>
        <Button variant="ghost" size="sm">
          管理标准库
        </Button>
      </div>
      <div className="space-y-4">
        {standards.map((standard, index) => (
          <motion.div
            key={standard.code}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="rounded-2xl border border-border/60 bg-white/65 p-5 dark:bg-slate-900/55"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                    {standard.type}
                  </span>
                  <p className="text-xs text-muted-foreground">更新 {standard.updatedAt}</p>
                </div>
                <h4 className="mt-2 text-sm font-semibold">
                  {standard.code} · {standard.name}
                </h4>
              </div>
              <Button variant="outline" size="sm">
                加入组合
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{standard.note}</p>
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-secondary/50 bg-secondary/10 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-secondary">原料限量对照</h4>
          <Button variant="ghost" size="sm">
            导出对照表
          </Button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {ingredients.map((item, index) => (
            <motion.div
              key={item.ingredient}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className={cn(
                "rounded-xl border bg-background/80 p-3 text-sm shadow-sm",
                item.status === "合规"
                  ? "border-emerald-300/60"
                  : item.status === "需提示"
                    ? "border-amber-300/60"
                    : "border-rose-300/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.ingredient}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.status === "合规"
                      ? "bg-emerald-200/30 text-emerald-600"
                      : item.status === "需提示"
                        ? "bg-amber-200/30 text-amber-600"
                        : "bg-rose-200/30 text-rose-600",
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">限量：{item.limit}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.remark}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pipeline({ stages }: { stages: FoodCategoryConfig["pipeline"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">备案流水线</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            查看各节点责任人、状态与预计完成时间。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          管理流程
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.32 }}
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white/65 p-5 dark:bg-slate-900/55"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Microscope className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-secondary/70">{stage.status}</p>
                  <h4 className="mt-1 text-base font-semibold">{stage.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {stage.owner}
                  </span>
                  <span className="text-xs text-muted-foreground">ETA {stage.eta}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stage.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const statusStyles: Record<FoodCategoryConfig["tasks"][number]["status"], string> = {
  待提交: "bg-secondary/20 text-secondary",
  检测中: "bg-primary/15 text-primary",
  待补正: "bg-amber-200/25 text-amber-600",
  评审中: "bg-sky-200/25 text-sky-600",
  已报送: "bg-emerald-200/25 text-emerald-600",
};

function Tasks({ config }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">在办备案任务</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            导入历史
          </Button>
          <Button variant="outline" size="sm">
            新建任务
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">产品名称</th>
              <th className="px-4 py-3 font-medium">品类</th>
              <th className="px-4 py-3 font-medium">执行标准</th>
              <th className="px-4 py-3 font-medium">当前阶段</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {config.tasks.map((task, index) => (
              <motion.tr
                key={task.product}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{task.product}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.category}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.standard}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.phase}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.owner}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.due}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      statusStyles[task.status],
                    )}
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {task.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Materials({ materials }: { materials: MaterialTemplate[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">材料与模板中心</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            调用 Agent 生成申请材料或导出模板。
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {materials.map((material, index) => (
          <motion.div
            key={material.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="group flex items-start gap-4 rounded-2xl border border-dashed border-secondary/40 p-4 transition hover:border-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">{material.title}</h4>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {material.type === "agent"
                      ? "智能生成"
                      : material.type === "upload"
                        ? "人工上传"
                        : "外部接口"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {material.action}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{material.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const alertColor: Record<AlertItem["type"], string> = {
  补正: "border-amber-300/60 bg-amber-200/25 text-amber-700",
  检测: "border-primary/50 bg-primary/15 text-primary",
  评审: "border-sky-300/60 bg-sky-200/25 text-sky-700",
  提交: "border-emerald-300/60 bg-emerald-200/25 text-emerald-700",
};

function Alerts({ alerts }: { alerts: AlertItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">风险与进度提醒</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            补正、检测、评审等关键节点提醒。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          配置提醒
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition",
              alertColor[alert.type],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {alert.title}
              </span>
              <span className="text-xs font-medium">截止 {alert.due}</span>
            </div>
            <p className="text-xs">{alert.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Knowledge({ knowledge }: { knowledge: FoodCategoryConfig["knowledge"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">政策与知识库</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            关注最新政策、驳回案例与最佳实践。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          订阅更新
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {knowledge.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.32 }}
            className="rounded-2xl border border-border/60 bg-white/65 p-4 text-sm shadow-sm dark:bg-slate-900/55"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.timestamp}
              </p>
              <span className="inline-flex items-center gap-2 text-xs text-secondary">
                <Beaker className="h-3.5 w-3.5" />
                建议：{item.suggestion}
              </span>
            </div>
            <h4 className="mt-1 text-sm font-semibold">{item.title}</h4>
            <p className="mt-2 text-muted-foreground">{item.summary}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
