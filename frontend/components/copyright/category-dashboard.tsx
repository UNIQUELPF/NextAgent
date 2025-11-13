"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock4,
  FileText,
  Lightbulb,
} from "lucide-react";

import type {
  CategoryConfig,
  InsightItem,
  PipelineStage,
  TaskItem,
  TemplateItem,
} from "@/app/copyright/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryDashboardProps = {
  config: CategoryConfig;
};

export function CategoryDashboard({ config }: CategoryDashboardProps) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <Hero config={config} />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <Pipeline stages={config.pipeline} />
        <Templates templates={config.templates} />
      </div>
      <Tasks tasks={config.tasks} />
      <Insights insights={config.insights} />
    </div>
  );
}

function Hero({ config }: CategoryDashboardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/10 p-8 shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl space-y-4"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-base font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          著作权智能代理
        </span>
        <h1 className="text-4xl font-semibold leading-tight">{config.heroTitle}</h1>
        <p className="text-lg text-muted-foreground">{config.heroDescription}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">
            创建新申请
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="lg">
            查看流程配置
          </Button>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute right-6 top-6 hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl md:block" />
    </section>
  );
}

function Metrics({ config }: CategoryDashboardProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">核心指标</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {config.metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm"
          >
            <p className="text-base text-muted-foreground">{metric.title}</p>
            <p className="mt-3 text-4xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-base font-medium text-primary">{metric.trend}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">自动化流水线</h2>
          <p className="mt-1 text-base text-muted-foreground">
            追踪当前阶段与待处理事项。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          流水线设置
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white/60 p-5 dark:bg-slate-900/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock4 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-medium text-primary/70">{stage.status}</p>
              <h3 className="mt-1 text-lg font-semibold">{stage.title}</h3>
              <p className="mt-2 text-base text-muted-foreground">{stage.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Templates({ templates }: { templates: TemplateItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">智能模版与材料</h2>
          <p className="mt-1 text-base text-muted-foreground">
            调用 Agent 自动生成核心材料。
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {templates.map((template, index) => (
          <motion.div
            key={template.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="group flex items-start gap-4 rounded-2xl border border-dashed border-primary/40 p-4 transition hover:border-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{template.title}</h3>
                <Button variant="outline" size="sm">
                  {template.action}
                </Button>
              </div>
              <p className="text-base text-muted-foreground">{template.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Tasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">在办申请</h2>
        <Button variant="ghost" size="sm">
          查看全部
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-base">
          <thead className="bg-muted/50 text-left text-base uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">申请项目</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">进度</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.map((task, index) => (
              <motion.tr
                key={task.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.25 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{task.title}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.owner}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-4 text-muted-foreground">{task.due}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.progress}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const statusStyles: Record<TaskItem["status"], string> = {
  待提交: "bg-secondary/20 text-secondary",
  审核中: "bg-primary/15 text-primary",
  待补充: "bg-amber-200/20 text-amber-500",
  已完成: "bg-emerald-200/20 text-emerald-600",
};

function StatusBadge({ status }: { status: TaskItem["status"] }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-base font-medium", statusStyles[status])}>
      {status}
    </span>
  );
}

function Insights({ insights }: { insights: InsightItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">政策与知识库</h2>
          <p className="mt-1 text-base text-muted-foreground">
            实时同步政策变更与最佳实践提示。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          管理知识库
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.08 * index, duration: 0.3 }}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/60 p-4 dark:bg-slate-900/50"
          >
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-base text-muted-foreground">{insight.timestamp}</p>
              <h3 className="mt-1 text-base font-semibold">{insight.title}</h3>
              <p className="mt-1 text-base text-muted-foreground">{insight.summary}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
