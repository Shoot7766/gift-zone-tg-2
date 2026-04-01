import { cn } from "@/lib/cn";

const variants: Record<string, string> = {
  vip: "bg-amber-500/20 text-amber-200 ring-amber-500/30",
  top: "bg-violet-500/20 text-violet-200 ring-violet-500/30",
  trust: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25",
  neutral: "bg-white/10 text-white/90 ring-white/15",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
