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
    <section className="mx-auto max-w-[95vw] px-4 py-10 sm:px-6 2xl:max-w-[1600px]">
      <div className="relative overflow-hidden rounded-[32px] border border-[#dfe6f5] bg-gradient-to-br from-white via-white to-[#f4f7fb] p-6 shadow-[0_35px_90px_rgba(9,29,72,0.12)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#5a6785]">Quick Actions</p>
            <h3 className="text-xl font-semibold text-[#0f1f3f]">快速入口 · 更贴合触控</h3>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#0085ff] px-4 py-2 text-sm font-semibold text-[#0d2b63] shadow-[0_12px_28px_rgba(9,34,82,0.12)] transition hover:-translate-y-0.5 hover:bg-[#f1f6ff]"
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
                className="snap-start min-w-[78%] rounded-2xl border border-[#e1e8f6] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(9,26,60,0.12)] transition hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(0,133,255,0.2)] sm:min-w-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.05 }}
              >
                <p className="text-base font-semibold text-[#0e1f3a]">{action.title}</p>
                <p className="mt-2 text-sm text-[#5a6278]">{action.desc}</p>
                <Link
                  href={action.href}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0085ff]"
                >
                  进入
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <motion.div
            className="rounded-2xl border border-dashed border-[#8ebdff] bg-white/92 p-5 text-sm text-[#556078] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-center gap-2 text-[#0085ff]">
              <MessageCircle className="h-4 w-4" />
              AI 智能提示
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              根据流程节点自动建议下一步动作，移动端点击可展开详情，桌面端 hover 即显。
            </p>
          </motion.div>
          <motion.div
            className="rounded-2xl border border-[#e1e9f5] bg-white/95 p-5 text-sm text-[#556078] shadow-[0_18px_40px_rgba(8,23,58,0.12)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-center gap-2 text-[#0085ff]">
              <Headphones className="h-4 w-4" />
              专属顾问
            </div>
            <p className="mt-2 text-sm leading-relaxed">专属顾问 7x12 在线，提供材料复核、监理对接与培训支持。</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
