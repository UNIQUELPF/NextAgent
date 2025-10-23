"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  FileSearch,
  Gauge,
  Layers3,
} from "lucide-react";

import type {
  KnowledgeItem,
  PipelineStage,
  SectorConfig,
  StandardItem,
  TaskItem,
} from "@/app/executive-standards/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  config: SectorConfig;
};

export function SectorDashboard({ config }: Props) {
  return (
    <div className="space-y-10">
      <Hero config={config} />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Standards standards={config.standards} />
        <Pipeline stages={config.pipeline} />
      </div>
      <Tasks tasks={config.tasks} />
      <Knowledge knowledge={config.knowledge} />
    </div>
  );
}

function Hero({ config }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-secondary/10 p-8 shadow-sm">
      <div className="pointer-events-none absolute right-12 top-0 hidden h-48 w-48 rounded-full bg-secondary/20 blur-3xl md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
          <Layers3 className="h-3.5 w-3.5" />
          标准适配推荐
        </span>
        <h2 className="text-3xl font-semibold leading-tight">{config.heroTitle}</h2>
        <p className="max-w-3xl text-base text-muted-foreground">
          {config.heroDescription}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="group">
            创建备案任务
            <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" size="lg">
            查看品类分析
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
        <h3 className="text-lg font-semibold">品类指标概览</h3>
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
            className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm"
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

function Standards({ standards }: { standards: StandardItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">常用标准库</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            对比国家标准、行业标准与团体标准差异。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          标准对比
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {standards.map((item, index) => (
          <motion.div
            key={item.code}
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
                    {item.type}
                  </span>
                  <p className="text-xs text-muted-foreground">更新 {item.updatedAt}</p>
                </div>
                <h4 className="mt-2 text-sm font-semibold">
                  {item.code} · {item.name}
                </h4>
              </div>
              <Button variant="outline" size="sm">
                加入组合
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.tip}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">备案流程追踪</h3>
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
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white/65 p-5 dark:bg-slate-900/55"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Gauge className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-secondary/80">{stage.status}</p>
                  <h4 className="mt-1 text-base font-semibold">{stage.title}</h4>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {stage.owner}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stage.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">预计完成：{stage.eta}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const statusColors: Record<TaskItem["status"], string> = {
  待提交: "bg-secondary/20 text-secondary",
  审核中: "bg-primary/15 text-primary",
  待补件: "bg-amber-200/20 text-amber-500",
  已归档: "bg-emerald-200/20 text-emerald-600",
};

function Tasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">在办备案任务</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            导入历史
          </Button>
          <Button variant="outline" size="sm">
            新建
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">产品/项目</th>
              <th className="px-4 py-3 font-medium">采用标准</th>
              <th className="px-4 py-3 font-medium">当前阶段</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.map((task, index) => (
              <motion.tr
                key={task.product}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{task.product}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.standard}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.phase}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.responsible}</td>
                <td className="px-4 py-4 text-muted-foreground">{task.due}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      statusColors[task.status],
                    )}
                  >
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

function Knowledge({ knowledge }: { knowledge: KnowledgeItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">政策更新与知识库</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            实时关注标准更新、驳回案例与最佳实践。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          管理订阅
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
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white/65 p-5 dark:bg-slate-900/55"
          >
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                </div>
                <Button variant="ghost" size="sm">
                  详情
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{item.summary}</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                <BookOpenCheck className="h-4 w-4" />
                {item.impact}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
