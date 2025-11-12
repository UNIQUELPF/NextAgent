"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-[85vw] px-4 pb-24 2xl:max-w-[1600px]">
      <motion.div
        className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/10 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Contact</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">仍有问题？随时找到我们</h3>
              <p className="mt-2 text-sm text-slate-600">
                轻盈的留白与渐变按钮延续页面节奏，移动端组件垂直堆叠，触控半径更友好。
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
            >
              预约演示
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Mail, label: "邮箱", value: "hello@nextagent.com" },
              { icon: Phone, label: "电话", value: "+86 138 0000 0000" },
              { icon: MapPin, label: "地址", value: "上海 · 张江 AI 峰谷" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/90 p-4 text-sm text-slate-600 shadow">
                  <div className="flex items-center gap-2 text-[#605CFF]">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 border-t border-white/60 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} 保留所有权利。</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[#605CFF]">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:text-[#605CFF]">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
