import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...p }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-glow",
        variant === "secondary" &&
          "border border-gz-border bg-gz-elevated text-white hover:bg-white/5",
        variant === "ghost" && "text-gz-accent2 hover:bg-white/5",
        className
      )}
      {...p}
    />
  );
}
