"use client";

import React from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail = "admin@centraleditorial.privado" }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
  };

  return (
    <header className="h-16 bg-surface/70 backdrop-blur-md border-b border-surface-border px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Painel Operacional
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-300">
          <div className="w-6 h-6 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-slate-300">{userEmail}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Encerrar sessão"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-surface-border hover:border-rose-900/60 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
