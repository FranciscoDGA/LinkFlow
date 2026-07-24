"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Alerta {
  tipo: "rascunho_antigo" | "capacidade_disponivel" | "baixa_performance";
  titulo: string;
  descricao: string;
  acao?: { label: string; href: string };
  severidade: "info" | "warning" | "danger";
}

export default function AlertasWidget() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const listaAlertas: Alerta[] = [];
      const agora = new Date();
      const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Alerta 1: Artigos em rascunho há mais de 7 dias
      const { data: rasculhoAntigos } = await supabase
        .from("artigos")
        .select("id, titulo, criado_em")
        .eq("user_id", user.id)
        .eq("status", "rascunho")
        .lt("criado_em", seteDiasAtras.toISOString());

      if (rasculhoAntigos && rasculhoAntigos.length > 0) {
        listaAlertas.push({
          tipo: "rascunho_antigo",
          titulo: `${rasculhoAntigos.length} artigo(s) em rascunho há mais de 7 dias`,
          descricao: "Revise e aprove artigos pendentes para não perder o cronograma.",
          acao: { label: "Ver artigos", href: "/artigos?status=rascunho" },
          severidade: "warning",
        });
      }

      // Alerta 2: Blogs com pouca performance (< 2 links nos últimos 30 dias)
      const trIntaDiasAtras = new Date(
        agora.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const { data: linksRecentes } = await supabase
        .from("links_ativos")
        .select("blog_destino_id")
        .eq("user_id", user.id)
        .gte("criado_em", trIntaDiasAtras.toISOString());

      const { data: blogs } = await supabase
        .from("blogs")
        .select("id, nome")
        .eq("user_id", user.id);

      const contagemLinksporBlog = new Map<string, number>();
      (blogs || []).forEach((b: any) => {
        contagemLinksporBlog.set(b.id, 0);
      });

      (linksRecentes || []).forEach((link: any) => {
        contagemLinksporBlog.set(
          link.blog_destino_id,
          (contagemLinksporBlog.get(link.blog_destino_id) || 0) + 1
        );
      });

      const blogsComBaixaPerformance = Array.from(
        contagemLinksporBlog.entries()
      )
        .filter(([, count]) => count < 2)
        .map(([blogId]) => blogs?.find((b: any) => b.id === blogId)?.nome || "—")
        .slice(0, 3);

      if (blogsComBaixaPerformance.length > 0) {
        listaAlertas.push({
          tipo: "baixa_performance",
          titulo: `${blogsComBaixaPerformance.length} blog(s) com poucos links nos últimos 30 dias`,
          descricao: `${blogsComBaixaPerformance.join(
            ", "
          )} precisam de mais linkagem.`,
          acao: { label: "Gerar artigo", href: "/artigos/gerar" },
          severidade: "info",
        });
      }

      // Alerta 3: Blogs com capacidade disponível no mês
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();

      const { data: cadenciaData } = await supabase
        .from("cadencia")
        .select("*")
        .eq("user_id", user.id)
        .eq("mes", mesAtual)
        .eq("ano", anoAtual);

      const blogsComCapacidade = (cadenciaData || [])
        .filter((c: any) => c.links_recebidos < c.limite_mensal)
        .map((c: any) => {
          const blog = blogs?.find((b: any) => b.id === c.blog_destino_id);
          return {
            nome: blog?.nome || "—",
            capacidade: c.limite_mensal - c.links_recebidos,
          };
        })
        .sort((a, b) => b.capacidade - a.capacidade)
        .slice(0, 3);

      if (blogsComCapacidade.length > 0) {
        listaAlertas.push({
          tipo: "capacidade_disponivel",
          titulo: `${blogsComCapacidade.length} blog(s) com capacidade disponível este mês`,
          descricao: `Você pode publicar mais artigos em: ${blogsComCapacidade
            .map((b) => `${b.nome} (${b.capacidade} links)`)
            .join(", ")}`,
          acao: { label: "Gerar artigo", href: "/artigos/gerar" },
          severidade: "info",
        });
      }

      setAlertas(listaAlertas);
      setCarregando(false);
    };

    carregar();
  }, []);

  if (carregando) {
    return <div className="text-sm text-slate-600">Carregando alertas...</div>;
  }

  if (alertas.length === 0) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3">
        <p className="text-sm font-medium text-green-800">
          ✅ Nenhum alerta! Tudo em dia.
        </p>
      </div>
    );
  }

  const cores = {
    info: "border-blue-300 bg-blue-50",
    warning: "border-amber-300 bg-amber-50",
    danger: "border-red-300 bg-red-50",
  };

  const iconess = {
    info: "ℹ️",
    warning: "⚠️",
    danger: "🚨",
  };

  return (
    <div className="space-y-3">
      {alertas.map((alerta, idx) => (
        <div
          key={idx}
          className={`rounded-lg border p-4 ${cores[alerta.severidade]}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{iconess[alerta.severidade]}</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{alerta.titulo}</p>
              <p className="mt-1 text-sm text-slate-700">
                {alerta.descricao}
              </p>
              {alerta.acao && (
                <Link
                  href={alerta.acao.href}
                  className="mt-2 inline-block text-sm font-medium underline text-slate-700 hover:text-slate-900"
                >
                  {alerta.acao.label} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
