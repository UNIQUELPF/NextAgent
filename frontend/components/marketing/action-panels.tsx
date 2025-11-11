"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Headphones } from "lucide-react";

const actions = [
  {
    title: "创建著作权任务",
    desc: "导入代码仓库，一次生成交付清单与复核节点。",
    href: "/copyright/new",
  },
  {
    title: "质量检测助手",
    desc: "生成测试报告、覆盖矩阵以及比对摘要，支持一键导出。",
    href: "/quality",
  },
  {
    title: "政策洞察",
    desc: "实时同步全国监管政策，按业务线推送提醒。",
    href: "/insights",
  },
];

export function ActionPanels() {
  return (
    <section className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/10 p-6 shadow-[0_30px_80px_rgba(90,104,255,0.15)] backdrop-blur-xl sm:p-8">
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Quick Actions</p>
              <h3 className="text-xl font-semibold text-slate-900">快速入口 · 更贴合触控</h3>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              管理入口
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto pb-2 no-scrollbar sm:mx-0 sm:col-span-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
              {actions.map((action, idx) => (
                <motion.div
                  key={action.href}
                  className="snap-start min-w-[80%] rounded-2xl border border-white/70 bg-white/90 p-5 shadow hover:-translate-y-1 hover:shadow-indigo-500/20 sm:min-w-0"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <p className="text-base font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{action.desc}</p>
                  <Link href={action.href} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#605CFF]">
                    进入
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <motion.div
              className="rounded-2xl border border-dashed border-[#605CFF]/40 bg-white/80 p-5 text-sm text-slate-600 shadow-inner"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex items-center gap-2 text-[#605CFF]">
                <MessageCircle className="h-4 w-4" />
                AI 智能提示
              </div>
              <p className="mt-2">
                根据流程节点自动建议下一步动作，移动端点击可展开详情，桌面端 hover 即显。
              </p>
            </motion.div>
            <motion.div
              className="rounded-2xl border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="flex items-center gap-2 text-[#605CFF]">
                <Headphones className="h-4 w-4" />
                专属顾问
              </div>
              <p className="mt-2">专属顾问 7x12 在线，提供材料复核、监理对接与培训支持。</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
