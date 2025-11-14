"use client";

import { useEffect, useState } from "react";

import { fetchRuanzhuStatistics } from "@/lib/ruanzhu";

type PulseStats = {
  completed: number;
  pending: number;
  running: number;
  downloads: number;
};

const emptyStats: PulseStats = {
  completed: 0,
  pending: 0,
  running: 0,
  downloads: 0,
};

export function DailyPulseCard() {
  const [stats, setStats] = useState<PulseStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchRuanzhuStatistics();
        if (!active) {
          return;
        }
        setStats({
          completed: data.completed_tasks ?? 0,
          pending: data.pending_tasks ?? 0,
          running: data.running_tasks ?? 0,
          downloads: data.total_downloads ?? 0,
        });
      } catch {
        if (active) {
          setStats(emptyStats);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const targetCount = 25;
  const progress = Math.min(100, (stats.completed / targetCount) * 100);

  const highlights = [
    { label: "待校验", value: stats.pending, accent: "#305CFF" },
    { label: "补正提醒", value: stats.running, accent: "#FF7A45" },
    { label: "证书下载", value: stats.downloads, accent: "#1AA784" },
  ];

  return (
    <div className="rounded-[32px] border border-[#E1E6F5] bg-white">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#6F7BFF]">Daily Pulse</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">今日进度播报</h2>
          </div>
          <span className="text-xs text-slate-400">{loading ? "同步中" : "数据已更新"}</span>
        </div>

        <div className="rounded-[28px] border border-[#E4E8F6] bg-[#F8FAFF] p-5">
          <p className="text-sm font-medium text-slate-500">今日已完成备案</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-semibold text-slate-900">{loading ? "--" : stats.completed}</span>
            <span className="text-lg font-medium text-slate-500">件</span>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-[#E5E8F5]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4568FF] to-[#3CD0FF]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">目标 {targetCount} 件</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-[22px] border border-[#ECEFF6] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: item.accent }}>
                {loading ? "--" : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
