import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  badge?: {
    text: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
  };
}

export function StatCard({ title, value, icon: Icon, subtitle, badge }: StatCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          {title}
        </span>
        <div className="p-2.5 rounded-lg bg-surface border border-surface-border text-emerald-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}
