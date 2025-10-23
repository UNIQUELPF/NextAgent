"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, FileType, GraduationCap, Stamp } from "lucide-react";

const ACTIVITIES = [
  {
    title: "智汇科技 · 软件著作权",
    description: "Agent 已生成 12 份模块说明与测试用例。",
    time: "5 分钟前",
    icon: ClipboardCheck,
  },
  {
    title: "星耀生物 · 药食同源备案",
    description: "完成原料标准匹配，生成差异比对报告。",
    time: "18 分钟前",
    icon: FileType,
  },
  {
    title: "逐梦制造 · 体系认证",
    description: "质量手册草稿待审核，预计 2 小时内完成。",
    time: "1 小时前",
    icon: Stamp,
  },
  {
    title: "光年教育 · 技能证书",
    description: "AI 生成讲师履历与教案模版，等待客户确认。",
    time: "2 小时前",
    icon: GraduationCap,
  },
];

export function ActivityFeed() {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">实时动态</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            追踪关键行业任务的自动化执行与人工复核节点。
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          同步时间：12:30
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {ACTIVITIES.map((activity, index) => (
          <motion.div
            key={activity.title}
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white/60 p-5 dark:bg-slate-900/50"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold leading-6">{activity.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
