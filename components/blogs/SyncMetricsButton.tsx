"use client";

import { useTransition } from "react";
import { syncRealSeoMetrics } from "@/app/(dashboard)/blogs/actions";

export default function SyncMetricsButton() {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncRealSeoMetrics();
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {isPending ? "Sincronizando..." : "Sincronizar Métricas de SEO"}
    </button>
  );
}
