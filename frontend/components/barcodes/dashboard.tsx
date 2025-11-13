"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart4,
  BookText,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Tags,
} from "lucide-react";

import type { BarcodeConfig, ReminderItem } from "@/app/barcodes/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  config: BarcodeConfig;
};

export function BarcodeDashboard({ config }: Props) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <Hero />
      <Metrics config={config} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Prefixes prefixes={config.prefixes} />
        <Reminders reminders={config.reminders} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <Batches batches={config.batches} />
        <Workflow stages={config.workflow} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Items items={config.items} />
        <Materials materials={config.materials} />
      </div>
      <Knowledge knowledge={config.knowledge} />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/10 p-8 shadow-sm">
      <div className="pointer-events-none absolute right-10 top-0 hidden h-48 w-48 rounded-full bg-primary/20 blur-3xl md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-base font-medium text-primary">
          <Tags className="h-3.5 w-3.5" />
          商品条码运营中心
        </span>
        <h2 className="text-4xl font-semibold leading-tight">
          管理 GS1 前缀申请、批次发放和渠道同步，让条码成为产品通行证。
        </h2>
        <p className="max-w-3xl text-lg text-muted-foreground">
          自动生成条码申请材料、批次码表与平台校验文件，提醒续费和同步风险，保障商品进入正规流通。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="group">
            新建条码批次
            <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" size="lg">
            续费前缀
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
        <h3 className="text-xl font-semibold">关键指标</h3>
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
            <p className="text-base text-muted-foreground">{metric.title}</p>
            <p className="mt-3 text-4xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-base font-medium text-primary">{metric.trend}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Prefixes({ prefixes }: { prefixes: BarcodeConfig["prefixes"] }) {
  return (
    <section className="space-y-4 rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">条码前缀状态</h3>
          <p className="mt-1 text-base text-muted-foreground">
            跟踪前缀有效期、续费状态与使用配额。
          </p>
        </div>
        <Button variant="ghost" size="sm">
          管理前缀
        </Button>
      </div>
      <div className="space-y-4">
        {prefixes.map((prefix, index) => (
          <motion.div
            key={prefix.prefix}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className={cn(
              "rounded-2xl border p-5 shadow-sm",
              prefix.status === "正常"
                ? "border-emerald-300/60 bg-emerald-200/20"
                : prefix.status === "待续费"
                  ? "border-amber-300/60 bg-amber-200/25"
                  : "border-rose-300/60 bg-rose-200/25",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xl font-semibold">前缀 {prefix.prefix}</h4>
                <p className="text-base text-muted-foreground">{prefix.region}</p>
              </div>
              <span className="rounded-full bg-white/50 px-3 py-1 text-base font-medium">
                {prefix.status}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <p className="text-base text-muted-foreground">有效期至 {prefix.validUntil}</p>
              <p className="text-base text-muted-foreground">
                配额 {prefix.quota.used.toLocaleString()} /
                {prefix.quota.total.toLocaleString()}
              </p>
              <Button variant="outline" size="sm">
                查看明细
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const reminderColors: Record<ReminderItem["type"], string> = {
  续费: "border-amber-300/60 bg-amber-200/20 text-amber-700",
  校验: "border-primary/50 bg-primary/15 text-primary",
  平台: "border-sky-300/60 bg-sky-200/25 text-sky-700",
};

function Reminders({ reminders }: { reminders: ReminderItem[] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">续费与渠道提醒</h3>
          <p className="mt-1 text-base text-muted-foreground">保持前缀有效和渠道同步。</p>
        </div>
        <Button variant="ghost" size="sm">
          配置提醒
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {reminders.map((reminder, index) => (
          <motion.div
            key={reminder.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-3 text-base transition",
              reminderColors[reminder.type],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {reminder.title}
              </span>
              <span className="text-base font-medium">截止 {reminder.due}</span>
            </div>
            <p className="text-base">{reminder.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Batches({ batches }: { batches: BarcodeConfig["batches"] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">条码批次管理</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            导入批次
          </Button>
          <Button variant="outline" size="sm">
            新建批次
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-base">
          <thead className="bg-muted/50 text-left text-base uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">批次名称</th>
              <th className="px-4 py-3 font-medium">编码范围</th>
              <th className="px-4 py-3 font-medium">产品数量</th>
              <th className="px-4 py-3 font-medium">负责人</th>
              <th className="px-4 py-3 font-medium">渠道</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {batches.map((batch, index) => (
              <motion.tr
                key={batch.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{batch.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{batch.range}</td>
                <td className="px-4 py-4 text-muted-foreground">{batch.products}</td>
                <td className="px-4 py-4 text-muted-foreground">{batch.owner}</td>
                <td className="px-4 py-4 text-muted-foreground">{batch.channel}</td>
                <td className="px-4 py-4 text-muted-foreground">{batch.status}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Workflow({ stages }: { stages: BarcodeConfig["workflow"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">申请与续费流程</h3>
          <p className="mt-1 text-base text-muted-foreground">追踪申请、续费和渠道同步节点。</p>
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
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-medium text-primary/70">{stage.status}</p>
                  <h4 className="mt-1 text-lg font-semibold">{stage.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-base text-muted-foreground">
                    {stage.owner}
                  </span>
                  <span className="text-base text-muted-foreground">ETA {stage.eta}</span>
                </div>
              </div>
              <p className="mt-2 text-base text-muted-foreground">{stage.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Items({ items }: { items: BarcodeConfig["items"] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">条码明细与渠道同步</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            导出码表
          </Button>
          <Button variant="outline" size="sm">
            同步渠道
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-base">
          <thead className="bg-muted/50 text-left text-base uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">产品</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">条码</th>
              <th className="px-4 py-3 font-medium">前缀</th>
              <th className="px-4 py-3 font-medium">渠道</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item, index) => (
              <motion.tr
                key={item.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.28 }}
                className="bg-background/80"
              >
                <td className="px-4 py-4 font-medium">{item.product}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.sku}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.code}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.prefix}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.channel}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-base font-medium",
                      item.status === "已同步"
                        ? "bg-emerald-200/25 text-emerald-700"
                        : item.status === "未同步"
                          ? "bg-secondary/20 text-secondary"
                          : "bg-amber-200/25 text-amber-700",
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
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

function Materials({ materials }: { materials: BarcodeConfig["materials"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">材料与模板中心</h3>
          <p className="mt-1 text-base text-muted-foreground">
            自动生成申请材料或下载导入模板，确保条码资料完整。
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
              {material.type === "external" ? (
                <Download className="h-5 w-5" />
              ) : material.type === "upload" ? (
                <FileSpreadsheet className="h-5 w-5" />
              ) : (
                <BarChart4 className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold">{material.title}</h4>
                  <p className="text-base uppercase tracking-wide text-muted-foreground">
                    {material.type === "agent"
                      ? "智能生成"
                      : material.type === "upload"
                        ? "人工上传"
                        : "外部模板"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {material.action}
                </Button>
              </div>
              <p className="text-base text-muted-foreground">{material.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Knowledge({ knowledge }: { knowledge: BarcodeConfig["knowledge"] }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/75 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">政策与知识库</h3>
          <p className="mt-1 text-base text-muted-foreground">
            关注 GS1 规则、电商平台要求与自检指南。
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
            className="rounded-2xl border border-border/60 bg-white/65 p-4 text-base shadow-sm dark:bg-slate-900/55"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-base uppercase tracking-wide text-muted-foreground">
                {item.timestamp}
              </p>
              <span className="inline-flex items-center gap-2 text-base text-primary">
                <BookText className="h-3.5 w-3.5" />
                建议：{item.suggestion}
              </span>
            </div>
            <h4 className="mt-1 text-base font-semibold">{item.title}</h4>
            <p className="mt-2 text-muted-foreground">{item.summary}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
