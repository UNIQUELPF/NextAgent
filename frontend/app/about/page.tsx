"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Building2, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Sparkles,
    title: "使命愿景",
    description:
      "用 AI Agent 让软件著作权、行业标准、条码注册、消字号批文等合规流程更加透明高效。",
  },
  {
    icon: Building2,
    title: "服务矩阵",
    description:
      "企标邦围绕执行标准备案、知识产权、药食同源、消字号审批、条码注册等场景提供一站式解决方案。",
  },
  {
    icon: Users,
    title: "专家团队",
    description:
      "来自药监、知识产权、标准化、信息化等领域的顾问与工程团队，覆盖政策解读、材料生成与流程协调。",
  },
  {
    icon: ShieldCheck,
    title: "服务保障",
    description:
      "承诺提交前完成智能校验，追踪审批节点，提供风险预警与文档留痕，确保材料合规与数据安全。",
  },
  {
    icon: BadgeCheck,
    title: "技术底座",
    description:
      "基于 Next.js、Framer Motion 与自研 Agent 引擎，支持流程编排、模板生成、渠道联动与实时告警。",
  },
];

const contact = [
  { label: "企业热线", value: "400-800-7988（工作日 9:00-18:30）" },
  { label: "企业微信", value: "扫码添加“企标邦服务顾问”获取对接指引" },
  { label: "客户邮箱", value: "support@qibiaobang.com" },
  { label: "地址", value: "上海市浦东新区张江高科技园区企标邦合规中心" },
];

export default function AboutPage() {
  return (
    <div className="container space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-secondary/15 p-10 shadow-sm">
        <div className="pointer-events-none absolute right-6 top-0 hidden h-52 w-52 rounded-full bg-secondary/20 blur-3xl md:block" />
        <div className="space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
          >
            企标邦 · 关于我们
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.45 }}
            className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
          >
            将复杂的合规工作，交给专业的 Agent 团队。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="max-w-3xl text-base text-muted-foreground md:text-lg"
          >
            我们聚合行业顾问、标准化专家与智能工具，为企业提供执行标准备案、知识产权、药食同源、消字号、商品条码等全链路合规服务。
            企标邦希望让每一个产品都能顺利进入正规渠道、每一份材料都能一次通过。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button size="lg" className="group">
              与我们合作
              <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <Button variant="ghost" size="lg">
              预约顾问演示
            </Button>
          </motion.div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-3xl border border-border/70 bg-background/80 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold">服务流程与保障</h2>
            <p className="text-sm text-muted-foreground">
              企标邦基于行业合规经验打造标准化协同流程，结合 AI Agent 让材料生成、审批追踪、风险提示、渠道对接变得可视化、数据化。
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>· 咨询评估：根据行业与产品特点评估合规路径，生成材料清单与时间表。</li>
              <li>· Agent 协同：使用自研 Agent 引擎完成材料初稿、检测安排与条款比对。</li>
              <li>· 审批追踪：实时同步批文进度、补正反馈与渠道校验结果。</li>
              <li>· 数据安全：所有资料加密存储并支持日志追踪，敏感数据按权限隔离。</li>
            </ul>
          </div>
          <div className="grid w-full max-w-md gap-4 rounded-3xl border border-dashed border-secondary/50 bg-secondary/10 p-6">
            <h3 className="text-lg font-semibold text-secondary">联系我们</h3>
            <ul className="space-y-3 text-sm text-secondary/90">
              {contact.map((item) => (
                <li key={item.label} className="rounded-2xl bg-white/60 p-3 shadow-sm dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary/70">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-secondary">{item.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
