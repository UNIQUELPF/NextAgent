"use client";
import { motion } from "framer-motion";
import { BadgeCheck, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

const CARDS = [
  {
    title: "待处理工单",
    value: "12",
    delta: "+3 本周",
    icon: Sparkles,
    gradient: "from-primary/80 via-primary/60 to-primary/30",
  },
  {
    title: "著作权材料生成",
    value: "38",
    delta: "98% 自动化率",
    icon: FileCheck2,
    gradient: "from-secondary/80 via-secondary/60 to-secondary/30",
  },
  {
    title: "质量检测通过",
    value: "24",
    delta: "4 件待复核",
    icon: BadgeCheck,
    gradient: "from-emerald-500/80 via-emerald-400/60 to-emerald-300/30",
  },
  {
    title: "行业合规任务",
    value: "8",
    delta: "涵盖四大版块",
    icon: ShieldCheck,
    gradient: "from-amber-400/80 via-amber-300/60 to-amber-200/30",
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card, index) => (
        <motion.div
          key={card.title}
          className="group relative overflow-hidden rounded-2xl border border-border/70 bg-background/60 p-6 shadow-sm transition hover:shadow-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
        >
          <div
            className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${card.gradient} opacity-10`}
          />
          <card.icon className="mb-4 h-6 w-6 text-primary" />
          <p className="text-sm text-muted-foreground">{card.title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {card.value}
            </span>
            <span className="text-xs font-medium text-primary">{card.delta}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
