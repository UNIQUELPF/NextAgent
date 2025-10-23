"use client";

import { motion } from "framer-motion";
import {
  AlarmClock,
  Archive,
  ArrowUpRight,
  BookText,
  CalendarClock,
  ClipboardList,
  FileText,
  Info,
} from "lucide-react";
import { type ReactNode } from "react";

import type {
  AlertItem,
  CaseItem,
  MaterialTemplate,
  ProcessConfig,
  WorkflowStage,
} from "@/app/ip-services/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  config: ProcessConfig;
};

export function ProcessDashboard({ config }: Props) {
  return (
    <div className="space-y-10">
      <Hero config={config} />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Workflow stages={config.workflow} />
        <Materials materials={config.materials} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Cases cases={config.cases} />
        <Alerts alerts={config.alerts} />
      </div>
      <Insights insights={config.insights} />
    </div>
  );
}

function Hero({ config }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/15 p-8 shadow-sm">
      <div className="pointer-events-none absolute right-8 top-0 hidden h-48 w-48 rounded-full bg-primary/20 blur-3xl md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Archive className="h-3.5 w-3.5" />
          知识产权流程指挥
        </span>
        <h2 className="text-3xl font-semibold leading-tight">{config.heroTitle}</h2>
        <p className="max-w-3xl text-base text-muted-foreground">
          {config.heroDescription}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="group">
            发起新流程
            <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" size="lg">
            查看全部案件
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
            <p className="mt-2 text-xs font-medium text-primary">{metric.trend}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Workflow({ stages }: { stages: WorkflowStage[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">流程追踪</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            查看节点状态、责任人与预计完成时间。
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-primary/70">{stage.status}</p>
                  <h4 className="mt-1 text-base font-semibold">{stage.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {stage.owner}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ETA {stage.eta}
                  </span>
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

function Materials({ materials }: { materials: MaterialTemplate[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">材料与模板中心</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            一键生成申请书、说明书、转让协议等材料。
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {materials.map((material, index) => (
          <motion.div
            key={material.title}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="group flex items-start gap-4 rounded-2xl border border-dashed border-primary/40 p-4 transition hover:border-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <FileText className="h-5 w-5" />
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

const statusMap: Record<CaseItem["status"], string> = {
  待提交: "bg-secondary/20 text-secondary",
  审核中: "bg-primary/15 text-primary",
  待补正: "bg-amber-200/20 text-amber-500",
  公告中: "bg-sky-200/20 text-sky-600",
  已核准: "bg-emerald-200/20 text-emerald-600",
};

function Cases({ cases }: { cases: CaseItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">在办案件</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            导入历史
          </Button>
          <Button variant="outline" size="sm">
            新建案件
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">名称/标识</th>
              <th className="px-4 py-3 font-medium">类别</th>
              <th className="px-4 py-3 font-medium">流程</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {cases.map((item, index) => (
              <motion.tr
                key={`${item.name}-${item.process}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{item.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.category}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.process}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.owner}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.deadline}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      statusMap[item.status],
                    )}
                  >
                    <Info className="h-3.5 w-3.5" />
                    {item.status}
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

function Alerts({ alerts }: { alerts: AlertItem[] }) {
  const typeToColor: Record<AlertItem["type"], string> = {
    补正期限: "bg-amber-200/25 text-amber-600 border-amber-300/60",
    公告期: "bg-sky-200/25 text-sky-600 border-sky-300/60",
    续展提醒: "bg-emerald-200/25 text-emerald-600 border-emerald-300/60",
  };

  const typeToIcon: Record<AlertItem["type"], ReactNode> = {
    补正期限: <AlarmClock className="h-4 w-4" />,
    公告期: <ClipboardList className="h-4 w-4" />,
    续展提醒: <CalendarClock className="h-4 w-4" />,
  };

  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">期限与公告提醒</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            跟踪补正、公告与续展等关键节点。
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
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition",
              typeToColor[alert.type],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-semibold">
                {typeToIcon[alert.type]}
                {alert.title}
              </span>
              <span className="text-xs font-medium">截止 {alert.due}</span>
            </div>
            <p className="text-xs text-muted-foreground">{alert.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Insights({ insights }: { insights: ProcessConfig["insights"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">政策与案例洞察</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            获取最新政策、审查趋势及驳回案例分析。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          管理订阅
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.32 }}
            className="rounded-2xl border border-border/60 bg-white/65 p-4 text-sm shadow-sm dark:bg-slate-900/55"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {insight.timestamp}
              </p>
              {insight.link ? (
                <a
                  href={insight.link}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  查看原文
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
            <h4 className="mt-1 text-sm font-semibold">{insight.title}</h4>
            <p className="mt-2 text-muted-foreground">{insight.summary}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
