"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const STAGES = [
  {
    title: "需求采集",
    description: "智能问卷收集企业基础信息，自动完成字段校验。",
    status: "完成",
    icon: CheckCircle2,
  },
  {
    title: "证据整理",
    description: "Agent 根据行业规范生成研发、测试、上线材料。",
    status: "进行中",
    icon: Loader2,
  },
  {
    title: "合规比对",
    description: "对接官方文库完成条款比对，生成差异报告。",
    status: "排队",
    icon: ArrowRight,
  },
  {
    title: "交付输出",
    description: "输出打包材料并生成交付清单与风险提醒。",
    status: "待启动",
    icon: Sparkles,
  },
];

export function PipelineProgress() {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">AI 工具链流水线</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            监控软件著作权与质量检测材料的自动化生产情况。
          </p>
        </div>
        <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary">
          当前阶段：证据整理
        </span>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {STAGES.map((stage, index) => (
          <motion.div
            key={stage.title}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/40 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:bg-slate-900/40"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1, duration: 0.45 }}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <stage.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stage.status}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {stage.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
