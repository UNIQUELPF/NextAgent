"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function BarcodeNav() {
  const pathname = usePathname();
  const href = "/barcodes/overview";
  const isActive = pathname === href;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-base sm:text-lg">
      <Link
        href={href}
        className={cn(
          "rounded-3xl border px-5 py-2.5 text-lg font-semibold transition hover:-translate-y-1",
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
