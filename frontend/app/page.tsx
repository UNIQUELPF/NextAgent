"use client";

import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

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

const promoSlides = [
  {
    title: "一站式备案加速中心",
    description: "覆盖质检、药监、消字号等 12 类业务场景，自动生成材料清单与审查报告。",
    stats: ["覆盖 31 个省市监管要求", "平均交付周期缩短 42%"],
    image: "/logo.png",
  },
  {
    title: "智能合规双引擎",
    description: "AI 智能代理自动比对法规条款，生成风险提示与整改建议。",
    stats: ["法规库每日自动更新", "比对准确率 97.3%"],
    image: "/logo.png",
  },
  {
    title: "团队协同一体化",
    description: "角色权限、流程看板与签章任务一体化管理，保障过程可追溯。",
    stats: ["多人同步编辑", "全链路留痕"],
    image: "/logo.png",
  },
];

function PromoCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = useMemo(() => promoSlides[active], [active]);

  return (
    <div className="glass relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
      <div className="relative flex h-full flex-col gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border/40 bg-white/90 p-2 dark:bg-slate-900/60">
                <Image
                  src={slide.image}
                  alt="企业宣传"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold lg:text-2xl">{slide.title}</h3>
                <p className="text-sm text-muted-foreground lg:text-base">深度赋能企业数字化合规</p>
              </div>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">{slide.description}</p>
            <div className="space-y-3 text-sm">
              {slide.stats.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/85 px-5 py-3 text-base dark:bg-slate-900/60"
                >
                  <span className="font-medium text-foreground/90">{item}</span>
                  <span className="text-xs text-primary/80">洞察</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {promoSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActive(index)}
                className={
                  index === active
                    ? "h-2.5 w-6 rounded-full bg-primary transition-all"
                    : "h-2.5 w-2.5 rounded-full bg-border transition-all hover:bg-primary/60"
                }
                aria-label={`切换到 ${item.title}`}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" className="group">
            了解更多
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_65%)]" />
        <div className="container flex flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr,1fr] lg:items-center">
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
                一站式企业服务自动化平台，高效完成备案申报与材料处理。
              </motion.h1>
              <motion.p
                className="max-w-3xl text-base text-muted-foreground lg:text-lg"
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
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-lg">
                <h3 className="text-base font-semibold text-foreground/85">今日办理速览</h3>
                <p className="mt-1 text-xs text-muted-foreground">核心业务线自动化进度</p>
                <div className="mt-4 space-y-3 text-sm">
                  {["执行标准备案", "著作权材料装订", "消字号备案", "体系认证"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/85 px-4 py-3 text-sm dark:bg-slate-900/60"
                    >
                      <span className="font-medium text-foreground/90">{item}</span>
                      <span className="text-xs text-primary/80">自动化率 92%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-primary/45 p-4 text-sm">
                  <p className="font-semibold">待人工复核</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    共有 4 个任务等待签章或线下材料上传，请在今日 18:00 前确认。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: "easeOut" }}
          >
            <PromoCarousel />
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
