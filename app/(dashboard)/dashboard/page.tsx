import React from "react";
import Link from "next/link";
import {
  Globe,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await dataStore.getDashboardStats();
  const sites = await dataStore.getSites();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-card via-surface to-surface-card border border-surface-border">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Central de Controle Editorial
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visão consolidada da sua rede de blogs, pautas e esteira de artigos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pautas"
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-slate-800 text-slate-200 border border-surface-border rounded-xl text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Nova Pauta</span>
          </Link>
          <Link
            href="/artigos"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Artigo</span>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Blogs Ativos"
          value={stats.sitesCount}
          icon={Globe}
          subtitle="Rede monitorada"
        />
        <StatCard
          title="Pautas em Fila"
          value={stats.topicsCount}
          icon={Compass}
          subtitle="Planejamento de SEO"
        />
        <StatCard
          title="Em Produção"
          value={stats.articlesInProductionCount}
          icon={FileText}
          subtitle="Rascunhos abertos"
        />
        <StatCard
          title="Para Revisão"
          value={stats.articlesReviewingCount}
          icon={Clock}
          subtitle="Aguardando validação"
          badge={
            stats.articlesReviewingCount > 0
              ? { text: "Revisar", variant: "warning" }
              : undefined
          }
        />
        <StatCard
          title="Aprovados"
          value={stats.articlesApprovedCount}
          icon={CheckCircle2}
          subtitle="Prontos para publicação"
        />
        <StatCard
          title="Publicados"
          value={stats.publicationsCount}
          icon={Send}
          subtitle="Artigos no ar"
        />
      </div>

      {/* Seção Inferior: Blogs Ativos & Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Rápida de Blogs */}
        <div className="lg:col-span-1 bg-surface-card border border-surface-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Blogs Monitorados
            </h3>
            <Link
              href="/blogs"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Gerenciar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="p-3.5 rounded-xl bg-surface border border-surface-border flex items-center justify-between hover:border-slate-600 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{site.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{site.domain}</p>
                </div>
                <Badge variant={site.is_active ? "success" : "default"}>
                  {site.is_active ? "Ativo" : "Pausado"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Registro de Atividades Recentes */}
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Atividades Recentes do Sistema
            </h3>
            <Link
              href="/historico"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Ver Todas
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Nenhuma atividade recente registrada.
              </p>
            ) : (
              stats.recentActivities.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-200">{log.action}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.user_email} • Entidade: {log.entity_type}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
