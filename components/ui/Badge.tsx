import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-950/70 text-emerald-400 border-emerald-800/80",
    warning: "bg-amber-950/70 text-amber-400 border-amber-800/80",
    danger: "bg-rose-950/70 text-rose-400 border-rose-800/80",
    info: "bg-sky-950/70 text-sky-400 border-sky-800/80",
    purple: "bg-purple-950/70 text-purple-400 border-purple-800/80",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
