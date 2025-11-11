"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Activity, ChevronsDown } from "lucide-react";

import { cn } from "@/lib/utils";

const heroStats = [
  { label: "监管覆盖", value: "31 省市", detail: "实时同步" },
  { label: "交付周期", value: "-42%", detail: "平均缩短" },
  { label: "材料通过率", value: "98%", detail: "风控护航" },
];

const heroPills = [
  "执行标准备案",
  "药食同源",
  "条形码注册",
  "著作权材料",
  "合规风险扫描",
];

const mobileCards = [
  { title: "自动化任务", desc: "AI 生成清单与节点提示" },
  { title: "智能复核", desc: "法规库 x 案例库交叉校验" },
  { title: "全链路可视", desc: "关键信息一屏掌握" },
];

type HeroSectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function HeroSection({ expanded, onToggle }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto flex max-w-[1500px] flex-col gap-14 px-6 py-16 sm:py-20 lg:py-28">
        <div className="flex flex-col items-center gap-14 text-center">
          <motion.span
            className="inline-flex items-center gap-5 rounded-full border border-white/40 bg-white/95 px-7 py-3 text-lg font-semibold text-[#4C54FF]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="h-6 w-6" />
            企业自动化合规中枢
          </motion.span>

          <motion.h1
            className="w-full max-w-6xl text-[3rem] font-semibold tracking-tight text-foreground sm:text-[3.2rem] lg:text-[3.8rem] lg:leading-[1.05]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
            <span className="block text-foreground">
              企业备案与材料交付全程自动化
            </span>
          </motion.h1>

          <motion.p
            className="w-full max-w-4xl text-sm leading-[1.65] text-slate-600 sm:text-base sm:leading-[1.55]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            批量创建任务、追踪节点、同步监管进度，数据化视图与交互动效同步呈现，营造出同级领先的沉浸体验。
          </motion.p>

          <motion.div
            className="flex w-full max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5A68FF] via-[#7EC8FF] to-[#54F3FF] px-12 py-4 text-lg font-semibold tracking-wide text-white shadow-[0_20px_50px_rgba(94,112,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-[1.05]"
            >
              即刻体验
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/95 px-10 py-3.5 text-base font-semibold tracking-wide text-slate-900 shadow-[0_10px_30px_rgba(99,102,241,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#5A68FF]/70 hover:text-[#5A68FF]"
            >
              预约顾问
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex flex-wrap justify-center gap-4 px-4">
            {heroPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/60 bg-pure-white px-5 py-1.5 text-sm font-medium text-slate-600 sm:text-base"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={onToggle}
              className="group inline-flex items-center gap-4 rounded-full border border-white/70 bg-white/85 px-11 py-4 text-lg font-semibold uppercase tracking-[0.4em] text-slate-500 shadow-md transition hover:border-[#5A68FF]/60 hover:text-[#5A68FF]"
            >
              {expanded ? "收起" : "展开"}
              <ChevronsDown
                className={cn(
                  "h-6 w-6 text-[#5A68FF] transition",
                  expanded ? "-scale-y-100" : "translate-y-0.5",
                )}
              />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                key="hero-expanded"
                className="rounded-[48px] border border-white/60 bg-white/90 p-8 shadow-[0_40px_120px_rgba(15,16,26,0.12)] backdrop-blur"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-slate-500">实时指标</p>
                    <div className="space-y-4">
                      {heroStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-sm">
                          <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <p className="text-[11px] text-[#5A68FF]">{stat.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-inner">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">今日自动化处理</p>
                          <p className="text-4xl font-semibold text-slate-900">48 条任务</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                          <Activity className="h-4 w-4" />
                          实时刷新
                        </span>
                      </div>

                      <div className="mt-6 space-y-3 text-sm text-slate-600">
                        {["执行标准备案", "药品合规", "消字号备案"].map((item, idx) => (
                          <div key={item} className="rounded-2xl border border-white/80 bg-pure-white px-4 py-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{item}</span>
                              <span className="text-xs text-slate-500">自动化率 9{idx + 1}%</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-700"
                                style={{ width: `${80 + idx * 6}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {mobileCards.map((card) => (
                          <div
                            key={card.title}
                            className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-sm backdrop-blur"
                          >
                            <ShieldCheck className="mb-3 h-5 w-5 text-[#5A68FF]" />
                            <p className="text-base font-semibold text-slate-900">{card.title}</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
