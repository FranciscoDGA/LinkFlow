"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function RelatoriosPage() {
  const [carregando, setCarregando] = useState(true);
  const [dadosLinksporMes, setDadosLinksporMes] = useState<any[]>([]);
  const [dadosArtigos, setDadosArtigos] = useState<any>(null);
  const [dadosRanking, setDadosRanking] = useState<any[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Links por blog por mês
      const { data: linksData } = await supabase
        .from("links_ativos")
        .select("*, blog_origem_id, blog_destino_id, criado_em")
        .eq("user_id", user.id);

      const linksAgrupados = new Map<string, number>();
      (linksData || []).forEach((link: any) => {
        const mes = new Date(link.criado_em).toLocaleString("pt-BR", {
          month: "short",
          year: "numeric",
        });
        linksAgrupados.set(mes, (linksAgrupados.get(mes) || 0) + 1);
      });

      const dadosOrdenados = Array.from(linksAgrupados.entries())
        .map(([mes, count]) => ({ mes, links: count }))
        .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());

      setDadosLinksporMes(dadosOrdenados);

      // Artigos por status
      const { data: artigos } = await supabase
        .from("artigos")
        .select("status")
        .eq("user_id", user.id);

      const contagemArtigos = {
        rascunho: 0,
        aprovado: 0,
        publicado: 0,
        indexado: 0,
      };

      (artigos || []).forEach((a: any) => {
        if (a.status in contagemArtigos) {
          contagemArtigos[a.status as keyof typeof contagemArtigos]++;
        }
      });

      setDadosArtigos([
        { name: "Rascunho", value: contagemArtigos.rascunho },
        { name: "Aprovado", value: contagemArtigos.aprovado },
        { name: "Publicado", value: contagemArtigos.publicado },
        { name: "Indexado", value: contagemArtigos.indexado },
      ]);

      // Ranking de blogs por links recebidos
      const { data: blogs } = await supabase
        .from("blogs")
        .select("id, nome")
        .eq("user_id", user.id);

      const { data: linksAtivos } = await supabase
        .from("links_ativos")
        .select("blog_destino_id")
        .eq("user_id", user.id)
        .eq("status", "ativo");

      const rankingBlogs = new Map<string, { nome: string; links: number }>();

      (blogs || []).forEach((blog: any) => {
        rankingBlogs.set(blog.id, { nome: blog.nome, links: 0 });
      });

      (linksAtivos || []).forEach((link: any) => {
        const blog = rankingBlogs.get(link.blog_destino_id);
        if (blog) {
          blog.links++;
        }
      });

      const dadosRankingOrdenado = Array.from(rankingBlogs.values())
        .sort((a, b) => b.links - a.links)
        .slice(0, 10);

      setDadosRanking(dadosRankingOrdenado);
      setCarregando(false);
    };

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="mt-1 text-sm text-slate-500">
          Análise de desempenho da sua rede de blogs.
        </p>
      </div>

      {/* Gráfico de Links por Mês */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Links Publicados por Mês</h2>
        <div className="mt-4 h-80">
          {dadosLinksporMes.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosLinksporMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="links" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Artigos por Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Artigos por Status</h2>
          <div className="mt-4 h-80">
            {dadosArtigos && dadosArtigos.some((d: any) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosArtigos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosArtigos.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Nenhum artigo gerado
              </div>
            )}
          </div>
        </div>

        {/* Ranking de Blogs */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Top 10 Blogs por Links Recebidos
          </h2>
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {dadosRanking.length > 0 ? (
              dadosRanking.map((blog, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <span className="text-slate-900 font-medium">{blog.nome}</span>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {blog.links} links
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Nenhum link publicado ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Total de Artigos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {dadosArtigos?.reduce((sum: number, d: any) => sum + d.value, 0) || 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Artigos Publicados</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {dadosArtigos?.find((d: any) => d.name === "Publicado")?.value || 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Artigos Indexados</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">
            {dadosArtigos?.find((d: any) => d.name === "Indexado")?.value || 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Links Ativos</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {dadosLinksporMes.reduce((sum, d) => sum + d.links, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
