"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  BadgeCheck,
  Beaker,
  ClipboardList,
  FileText,
  Microscope,
  ShieldCheck,
} from "lucide-react";

import type {
  AlertItem,
  ComplianceCheck,
  DisinfectantConfig,
  MaterialTemplate,
} from "@/app/cosmetics/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  config: DisinfectantConfig;
};

export function DisinfectantDashboard({ config }: Props) {
  return (
    <div className="space-y-10">
      <Hero config={config} />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Approvals config={config} />
        <Compliance checks={config.compliance} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Pipeline stages={config.pipeline} />
        <Materials materials={config.materials} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Cases config={config} />
        <Alerts alerts={config.alerts} />
      </div>
      <Knowledge knowledge={config.knowledge} />
    </div>
  );
}

function Hero({ config }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/15 p-8 shadow-sm">
      <div className="pointer-events-none absolute right-10 top-0 hidden h-48 w-48 rounded-full bg-primary/20 blur-3xl md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Archive className="h-3.5 w-3.5" />
          消字号审批指挥
        </span>
        <h2 className="text-3xl font-semibold leading-tight">{config.heroTitle}</h2>
        <p className="max-w-3xl text-base text-muted-foreground">
          {config.heroDescription}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="group">
            发起批文申请
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
            <p className="mt-2 text-xs font-medium text-primary">{metric.trend}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Approvals({ config }: Props) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">批文要件清单</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            按国家/省级药监局要求自动列出必需材料。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          下载清单
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {config.approvals.map((item, index) => (
          <motion.div
            key={item.document}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="rounded-2xl border border-border/60 bg-white/65 p-5 dark:bg-slate-900/55"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.authority}
                </span>
                <h4 className="mt-2 text-sm font-semibold">{item.document}</h4>
              </div>
              <span className="text-xs text-muted-foreground">更新 {item.updatedAt}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.requirement}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const complianceColor: Record<ComplianceCheck["status"], string> = {
  合规: "border-emerald-300/60 bg-emerald-200/20 text-emerald-700",
  需补充: "border-amber-300/60 bg-amber-200/20 text-amber-700",
  风险: "border-rose-300/60 bg-rose-200/20 text-rose-700",
};

function Compliance({ checks }: { checks: ComplianceCheck[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">合规审查面板</h3>
          <p className="mt-1 text-sm text-muted-foreground">监控重点合规项，自动提示风险。</p>
        </div>
        <Button variant="ghost" size="sm">
          导出检查表
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {checks.map((check, index) => (
          <motion.div
            key={check.item}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition",
              complianceColor[check.status],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                {check.item}
              </span>
              <span className="text-xs font-medium">{check.status}</span>
            </div>
            <p className="text-xs">{check.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pipeline({ stages }: { stages: DisinfectantConfig["pipeline"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">审批流水线</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            追踪检验、资料、提交等关键节点的进度。
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
              <Microscope className="h-5 w-5" />
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

function Materials({ materials }: { materials: MaterialTemplate[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">材料与模板中心</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            调用 Agent 生成说明书、申请表或上传检验报告。
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

const statusColor: Record<DisinfectantConfig["cases"][number]["status"], string> = {
  资料准备: "bg-secondary/20 text-secondary",
  检验中: "bg-primary/15 text-primary",
  补正中: "bg-amber-200/25 text-amber-700",
  审批中: "bg-sky-200/25 text-sky-700",
  已获批: "bg-emerald-200/25 text-emerald-700",
};

function Cases({ config }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">在办批文案件</h3>
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
              <th className="px-4 py-3 font-medium">产品</th>
              <th className="px-4 py-3 font-medium">类别</th>
              <th className="px-4 py-3 font-medium">批次编号</th>
              <th className="px-4 py-3 font-medium">责任人</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {config.cases.map((item, index) => (
              <motion.tr
                key={item.product}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{item.product}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.classification}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.batch}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.owner}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.due}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      statusColor[item.status],
                    )}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
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

const alertColor: Record<AlertItem["type"], string> = {
  补正: "border-amber-300/60 bg-amber-200/25 text-amber-700",
  检验: "border-primary/50 bg-primary/15 text-primary",
  审批: "border-sky-300/60 bg-sky-200/25 text-sky-700",
  复检: "border-emerald-300/60 bg-emerald-200/25 text-emerald-700",
};

function Alerts({ alerts }: { alerts: AlertItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">风险与时间节点</h3>
          <p className="mt-1 text-sm text-muted-foreground">补正、检验、审批等关键提醒。</p>
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

function Knowledge({ knowledge }: { knowledge: DisinfectantConfig["knowledge"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">政策与案例洞察</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            实时关注药监局政策、补正案例、审批趋势。
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
              <span className="inline-flex items-center gap-2 text-xs text-primary">
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
