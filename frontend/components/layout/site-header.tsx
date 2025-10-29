"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHeaderVisibility } from "@/components/providers/header-visibility";

export function SiteHeader() {
  const { visible } = useHeaderVisibility();
  if (!visible) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-1.5"
          >
            <Image
              src="/logo.png"
              alt="企标邦"
              priority
              width={112}
              height={32}
              className="h-6 w-auto"
            />
          </Link>
          <div className="hidden lg:block">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className={cn(
              "hidden md:inline-flex",
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground"
            )}
          >
            登录
          </Link>
          <Button size="sm">创建任务</Button>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/90 px-4 py-2 lg:hidden">
        <MainNav />
        <Link
          href="/auth/login"
          className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium"
        >
          登录
        </Link>
      </div>
    </header>
  );
}
