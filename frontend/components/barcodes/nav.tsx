"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function BarcodeNav() {
  const pathname = usePathname();
  const href = "/barcodes/overview";
  const isActive = pathname === href;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={href}
        className={cn(
          "rounded-2xl border px-4 py-2 text-sm font-medium transition hover:-translate-y-1",
          isActive
            ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
            : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-primary",
        )}
      >
        条码总览
      </Link>
    </div>
  );
}
