"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Activity, ChevronsDown } from "lucide-react";

import { cn } from "@/lib/utils";

const heroStats = [
  { label: "监管覆盖", value: "31 省市", detail: "实时同步" },
  { label: "交付周期", value: "-42%", detail: "平均缩短" },
  { label: "材料通过率", value: "98%", detail: "风控护航" },
];

const automationItems = ["执行标准备案", "药品合规", "消字号备案"];

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
    <section className="relative -mt-8 overflow-hidden bg-background sm:-mt-10 lg:-mt-12">
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-16 px-6 py-20 sm:px-8 sm:py-28 lg:gap-20 lg:py-36 xl:px-14 xl:py-44">
        <div className="flex flex-col gap-14 text-center lg:min-h-[860px] lg:flex-row lg:items-center lg:gap-24 lg:text-left">
          <div className="flex flex-1 flex-col items-center gap-16 lg:items-start lg:-translate-y-8">
            <motion.span
              className="inline-flex -mt-4 items-center gap-4 rounded-full border border-white/40 bg-white/95 px-6 py-2 text-[0.75rem] font-semibold text-[#4C54FF] sm:-mt-6 sm:text-sm lg:-mt-8 lg:px-7 lg:py-2.5 lg:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              企业自动化合规中枢
            </motion.span>

            <motion.h1
              className="mt-6 w-full max-w-4xl text-[3.1rem] font-semibold tracking-tight text-foreground sm:text-[3.4rem] lg:text-[4rem] lg:leading-[1.05]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="block text-foreground">
                一站式企业服务自动化平台
              </span>
              <span className="mt-5 block text-[1.35rem] font-medium text-slate-900 sm:text-[1.5rem] lg:text-[1.65rem]">
                高效完成备案申报与材料处理
              </span>
            </motion.h1>

            <motion.p
              className="mt-10 w-full max-w-3xl text-base leading-[1.7] text-slate-600 sm:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              批量创建任务、追踪节点、同步监管进度，数据化视图与交互动效同步呈现，营造出同级领先的沉浸体验。
            </motion.p>

            <motion.div
              className="mt-20 flex w-full max-w-3xl flex-col items-center gap-12 sm:flex-row sm:justify-center sm:gap-16"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex w-full flex-col items-center justify-center gap-12 sm:flex-row sm:gap-20">
                <Link
                  href="/auth/login"
                  className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#5A68FF] via-[#7EC8FF] to-[#54F3FF] px-16 py-6 text-[1.4rem] font-semibold tracking-wide text-white shadow-[0_30px_70px_rgba(94,112,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-[1.05] before:absolute before:-inset-x-1 before:-inset-y-0.5 before:-z-10 before:rounded-full before:bg-gradient-to-r before:from-[#5A68FF] before:via-[#7EC8FF] before:to-[#54F3FF]"
                >
                  即刻体验
                  <ArrowRight className="ml-4 h-8 w-8" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/95 px-16 py-6 text-[1.25rem] font-semibold tracking-wide text-slate-900 shadow-[0_20px_48px_rgba(99,102,241,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#5A68FF]/70 hover:text-[#5A68FF]"
                >
                  预约顾问
                </Link>
              </div>
            </motion.div>

          </div>

          <motion.div
            className="flex w-full justify-center lg:w-[42%] lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <HeroMetricsCard />
          </motion.div>
        </div>

        <div className="flex flex-col gap-12">
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
        </div>
      </div>
    </section>
  );
}

function HeroMetricsCard() {
  return (
    <div className="w-full max-w-[540px] rounded-[42px] border border-white/70 bg-gradient-to-br from-white/95 to-[#F5FAFF] p-8 shadow-[0_35px_110px_rgba(74,110,255,0.15)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">实时指标</p>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-[#5A68FF]">
            即时刷新
          </p>
        </div>
        <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1 text-xs font-semibold text-[#5A68FF] shadow-sm">
          LIVE
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[28px] border border-white/70 bg-white px-5 py-4 shadow-[0_15px_40px_rgba(93,115,255,0.12)]"
          >
            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-[11px] text-[#5A68FF]">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_60px_rgba(74,110,255,0.15)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">今日自动化处理</p>
            <p className="text-[2.6rem] font-semibold leading-tight text-slate-900">
              48 条任务
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <Activity className="h-4 w-4" />
            实时刷新
          </span>
        </div>

        <div className="mt-6 space-y-3 text-sm text-slate-600">
          {automationItems.map((item, idx) => (
            <div
              key={item}
              className="rounded-[999px] bg-white/90 p-3 shadow-[0_10px_26px_rgba(93,115,255,0.12)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{item}</span>
                <span className="text-xs text-slate-500">自动化率 9{idx + 1}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5A68FF] to-[#7EE0FF]"
                  style={{ width: `${80 + idx * 6}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
