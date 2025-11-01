import type { ReactNode } from "react";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminNav } from "@/components/admin/admin-nav";
import { ADMIN_SECTIONS } from "@/lib/admin-navigation";

export const metadata = {
  title: "管理控制台 - 企标邦",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <section className="border-b border-border/70 bg-background/80 py-8">
          <div className="container space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">管理控制台</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                统一维护租户、组织与角色，确保权限模型与业务架构保持一致。
              </p>
            </div>
            <AdminNav />
            <div className="grid gap-4 md:grid-cols-3">
              {ADMIN_SECTIONS.map((section) => (
                <div
                  key={section.href}
                  className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm"
                >
                  <div className="font-medium text-foreground">{section.label}</div>
                  {section.description ? (
                    <div className="mt-2 text-muted-foreground">{section.description}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="container pb-16">{children}</div>
      </div>
    </AdminGuard>
  );
}
