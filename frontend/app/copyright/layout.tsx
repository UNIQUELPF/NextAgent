import type { ReactNode } from "react";
import { FileText, PenSquare, ShieldCheck, Sparkles } from "lucide-react";

import { DailyPulseCard } from "@/components/copyright/daily-pulse-card";

const heroStats = [
  { label: "作品类型", value: "12+", detail: "软件 / 文学 / 音频等", accent: "#1B62FF" },
  { label: "材料准确率", value: "98%", detail: "AI 智能校验", accent: "#0F8B8D" },
  { label: "审批周期", value: "-35%", detail: "流程压缩", accent: "#FF7A45" },
];

const serviceHighlights = [
  {
    icon: ShieldCheck,
    title: "一键生成材料包",
    desc: "按企标邦服务规范输出封面、声明、代码打印件等完整模板。",
    accent: "#1B62FF",
  },
  {
    icon: FileText,
    title: "全流程节点监控",
    desc: "受理、补正、核准节点透明可查，异常节点即时推送。",
    accent: "#0F8B8D",
  },
  {
    icon: PenSquare,
    title: "多作品并行",
    desc: "文学、美术、音乐、摄影等作品可批量导入，系统自动归档。",
    accent: "#FF7A45",
  },
];

function hexToRgba(hex: string, alpha: number) {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const value = Number.parseInt(sanitized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CopyrightLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <section className="py-10">
        <div className="mx-auto max-w-[90vw] px-4 2xl:max-w-[1600px]">
          <div className="relative rounded-[40px] border border-white/70 bg-gradient-to-br from-[#F5FAFF] via-[#EEF6FF] to-[#E1F0FF] p-8 shadow-[0_35px_90px_rgba(74,110,255,0.16)] lg:p-12">
            <div className="absolute inset-y-0 right-10 hidden w-64 rounded-full bg-[#5A68FF]/15 blur-3xl lg:block" />
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#376BFF] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  企标邦 · 版权合规体验
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight lg:text-[2.9rem]">
                    著作权工作台
                  </h1>
                  <p className="text-base text-slate-600">
                    针对软件、文学、音乐、美术等多类型作品，提供企标邦式的稳健体验——
                    结构化申请流程、材料自动生成、节点可视化监控，确保一次提交即可通过。
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center justify-center rounded-full bg-[#1B62FF] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#1B62FF]/30 transition hover:-translate-y-0.5">
                    立即创建作品
                  </button>
                  <button className="inline-flex items-center justify-center rounded-full border border-[#1B62FF]/30 bg-white/90 px-8 py-3 text-base font-semibold text-[#1B62FF] shadow-sm transition hover:border-[#1B62FF]/60">
                    下载材料指南
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border bg-white/90 p-4 text-left shadow-sm transition"
                      style={{
                        borderColor: hexToRgba(stat.accent, 0.35),
                        background: `linear-gradient(140deg, ${hexToRgba(stat.accent, 0.08)}, #ffffff)`,
                      }}
                    >
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="mt-1 text-2xl font-semibold" style={{ color: stat.accent }}>
                        {stat.value}
                      </p>
                      <p className="text-xs" style={{ color: stat.accent }}>
                        {stat.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 lg:mt-0 lg:translate-y-6">
                <DailyPulseCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[90vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>

      <section className="pb-12">
        <div className="mx-auto max-w-[90vw] px-4 2xl:max-w-[1600px]">
          <div className="grid gap-6 lg:grid-cols-3">
            {serviceHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[32px] border border-[#E3E6F2] bg-white p-6 transition"
                style={{
                  backgroundImage: `radial-gradient(circle at 120% -20%, ${hexToRgba(item.accent, 0.12)}, transparent 55%)`,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F0F2FB]"
                  style={{
                    backgroundColor: hexToRgba(item.accent, 0.1),
                    color: item.accent,
                  }}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-base text-slate-600">{item.desc}</p>
                </div>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#E2E6F5] to-transparent" />
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>企标邦</span>
                  <span>版权服务</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
