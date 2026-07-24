"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Início", icon: "📊" },
  { href: "/blogs", label: "Blogs", icon: "🌐" },
  { href: "/artigos", label: "Artigos", icon: "📝" },
  { href: "/links", label: "Links", icon: "⚡" },
  { href: "/relatorios", label: "Relatórios", icon: "📈" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-slate-200 bg-white md:hidden">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
              active ? "text-brand-700" : "text-slate-500"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
