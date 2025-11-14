import type { ReactNode } from "react";

export default function CopyrightLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-10 text-base sm:text-lg">
      <section className="py-8">
        <div className="mx-auto max-w-[85vw] px-4 2xl:max-w-[1600px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/10 p-8 shadow-[0_30px_90px_rgba(90,104,255,0.16)] backdrop-blur-xl">
            <div className="relative space-y-6 text-center">
<<<<<<< HEAD
              <div className="mx-auto max-w-3xl space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">著作权工作台</h1>
                <p className="text-base text-slate-600">
                  针对软件、文学、音乐、美术等多类型作品，提供结构化的自动申请流程，
                  快速生成材料、管理复核与同步政策更新。
=======
              <div className="mx-auto max-w-3xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">软件著作权生成工作台</h1>
                <p className="text-sm text-slate-600">
                  调用柔筑智能体，统一管理模型配置、任务生成与材料下载，保障本地开发与生产环境流程一致。
>>>>>>> 0556f4793d24dfaedd2132a2c049cad6565cc0b5
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[85vw] px-4 pb-16 2xl:max-w-[1600px]">{children}</div>
    </div>
  );
}
