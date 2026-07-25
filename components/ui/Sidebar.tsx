"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/blogs", label: "Blogs", icon: "🌐" },
  { href: "/relacionamentos", label: "Relacionamentos", icon: "🔗" },
  { href: "/artigos", label: "Artigos", icon: "📝" },
  { href: "/keywords", label: "Keywords", icon: "🔍" },
  { href: "/links", label: "Links Ativos", icon: "⚡" },
  { href: "/anchors", label: "Anchor Texts", icon: "🎯" },
  { href: "/relatorios", label: "Relatórios", icon: "📈" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/" className="text-xl font-bold text-brand-700">
          LinkFlow
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">LinkFlow v0.1 — Sprint 1</p>
      </div>
    </aside>
  );
}
