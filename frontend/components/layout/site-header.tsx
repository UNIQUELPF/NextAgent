import Link from "next/link";
import { Menu } from "lucide-react";

import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm font-semibold"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            企标邦
          </Link>
          <div className="hidden lg:block">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            登录
          </Button>
          <Button size="sm">创建任务</Button>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/90 px-4 py-2 lg:hidden">
        <MainNav />
      </div>
    </header>
  );
}
