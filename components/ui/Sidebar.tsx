"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Compass,
  FileText,
  History,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meus Blogs", href: "/blogs", icon: Globe },
  { name: "Pautas", href: "/pautas", icon: Compass },
  { name: "Artigos", href: "/artigos", icon: FileText },
  { name: "Histórico & Logs", href: "/historico", icon: History },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-surface border-r border-surface-border flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border gap-3 bg-surface/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-black text-sm tracking-tighter">
          LF
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
            LinkFlow
          </h1>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
            Central Editorial
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Módulos
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-hover"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security Status Footer */}
      <div className="p-4 border-t border-surface-border bg-surface/50">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-card border border-surface-border">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-300">Ambiente Seguro</p>
            <p className="text-[11px] text-slate-500">RLS & Sessão Ativa</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
