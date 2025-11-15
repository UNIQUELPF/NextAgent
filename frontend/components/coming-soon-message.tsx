import { cn } from "@/lib/utils";

interface ComingSoonMessageProps {
  className?: string;
}

export function ComingSoonMessage({ className }: ComingSoonMessageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] items-center justify-center px-6 py-24",
        className,
      )}
    >
      <div className="rounded-[32px] border border-[#DCE1FF] bg-white/80 px-8 py-12 text-center shadow-[0_25px_60px_rgba(90,104,255,0.15)] backdrop-blur">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">
          功能还在开发中，敬请期待…如需办理，请联系人工客服。
        </p>
      </div>
    </div>
  );
}
