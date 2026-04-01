import { cn } from "@/lib/cn";

export function EmptyState({
  emoji,
  title,
  hint,
  className,
}: {
  emoji: string;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-gz-border bg-gz-surface/60 px-6 py-12 text-center",
        className
      )}
    >
      <span className="text-4xl">{emoji}</span>
      <p className="mt-3 text-base font-semibold text-white">{title}</p>
      {hint ? <p className="mt-2 max-w-xs text-sm text-gz-muted">{hint}</p> : null}
    </div>
  );
}
