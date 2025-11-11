"use client";

import { motion } from "framer-motion";
import { Layers, GitBranch, ShieldCheck, PenTool } from "lucide-react";

const features = [
  {
    title: "多流程管控",
    desc: "将执行标准备案、药食同源备案、条码注册等 12 条业务线统一在一个可视化面板里调度。",
    icon: Layers,
  },
  {
    title: "智能材料工坊",
    desc: "根据法规模板自动生成/复核材料，减少重复操作，按钮区域集中在卡片底部方便触控。",
    icon: PenTool,
  },
  {
    title: "风控哨兵",
    desc: "法规库 + 案例库交叉比对，自动推送整改建议，动画从下向上进入更符合眼动轨迹。",
    icon: ShieldCheck,
  },
  {
    title: "协作工作台",
    desc: "权限、批注与节点提醒集成，桌面端 3 列栅格、移动端横向滑动，满足不同设备节奏。",
    icon: GitBranch,
  },
];

export function FeatureShowcase() {
  return (
    <section className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
      <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/10 p-8 shadow-[0_35px_90px_rgba(90,104,255,0.18)] backdrop-blur-xl sm:p-10">
        <div className="relative">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Capabilities</p>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">核心能力矩阵</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-white/70 bg-white/65 p-6 text-left shadow-[0_20px_60px_rgba(90,104,255,0.12)] backdrop-blur-xl"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div>
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner shadow-white/40">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#5A68FF]">
                    <span>了解详情</span>
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
