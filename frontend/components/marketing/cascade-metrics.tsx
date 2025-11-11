"use client";

import { motion } from "framer-motion";
import { ChartNoAxesCombined, Clock, FileCheck2 } from "lucide-react";

const metrics = [
  { label: "备案自动化率", value: "92%", detail: "AI 审核加速" },
  { label: "材料准确率", value: "98%", detail: "智能纠错" },
  { label: "节省工时", value: "36h", detail: "平均单项目" },
  { label: "满意度", value: "4.9/5", detail: "客户反馈" },
];

const timeline = [
  { title: "任务创建", desc: "预置模板校验资料", time: "T+0" },
  { title: "材料整备", desc: "自动生成清单与版本对比", time: "T+1" },
  { title: "监管对接", desc: "API 级别短信/函件跟踪", time: "T+3" },
];

export function CascadeMetrics() {
  return (
    <section className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
      <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/10 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl lg:p-10">
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.div
            className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-xl shadow-indigo-500/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <ChartNoAxesCombined className="h-5 w-5 text-[#605CFF]" />
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Metrics</p>
                <h3 className="text-lg font-semibold text-slate-900">运营指标 · 即时刷新</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="text-xs text-[#605CFF]">{metric.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-xl shadow-indigo-500/10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#605CFF]" />
                按阶段节奏优化
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs text-slate-500">滚动带出</span>
            </div>
            <div className="mt-6 space-y-4">
              {timeline.map((item, idx) => (
                <motion.div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/80 p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-[#605CFF]">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
