"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PipelineProgress } from "@/components/dashboard/pipeline-progress";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";

const quickLinks = [
  {
    title: "创建著作权任务",
    description: "导入源码与研发材料，自动生成交付清单。",
    href: "/copyright/new",
  },
  {
    title: "质量检测助手",
    description: "一键生成测试报告、覆盖矩阵与复核记录。",
    href: "/quality",
  },
  {
    title: "行业政策洞察",
    description: "实时同步各地备案政策与合规要点。",
    href: "/insights",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_65%)]" />
        <div className="container grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                企业合规自动化平台
              </span>
            </motion.div>
            <motion.h1
              className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl xl:text-5xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              一站式 AI Agent 工具链，助力软件著作权与质量材料全流程自动化。
            </motion.h1>
            <motion.p
              className="max-w-2xl text-base text-muted-foreground lg:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
            >
              自定义工作流覆盖执行标准备案、药品食品合规、条形码注册等业务场景，
              将繁琐的材料采集、合规比对与交付封装全部交给智能代理。
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.5 }}
            >
              <Button size="lg" className="group">
                开始创建任务
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button variant="ghost" size="lg">
                查看平台演示
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="glass relative overflow-hidden rounded-3xl p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.16, duration: 0.45, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
            <div className="relative space-y-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                今日流水线速览
              </p>
              <div className="grid gap-3">
                {["执行标准备案", "著作权材料装订", "消字号备案", "体系认证"].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-sm dark:bg-slate-900/60"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  >
                    <span className="font-medium">{item}</span>
                    <span className="text-xs text-muted-foreground">自动化率 92%</span>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-primary/40 p-4 text-sm">
                <p className="font-semibold">待人工复核</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  共有 4 个任务等待签章或线下材料上传，请在今日 18:00 前确认。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container space-y-6">
        <h2 className="text-lg font-semibold">运营指标</h2>
        <SummaryCards />
      </section>

      <section className="container grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <PipelineProgress />
        <ActivityFeed />
      </section>

      <section className="container">
        <div className="rounded-3xl border border-border/70 bg-background/70 p-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold">快速入口</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                常用工作流入口，帮助团队快速发起业务审批。
              </p>
            </div>
            <Button variant="ghost" size="sm">
              管理入口
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="group relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-white/70 p-4 text-left transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:bg-slate-900/50"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35 }}
              >
                <span className="text-sm font-semibold">{link.title}</span>
                <p className="text-xs text-muted-foreground">{link.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                  进入
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
