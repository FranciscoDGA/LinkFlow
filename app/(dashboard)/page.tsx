import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/ui/StatCard";

export const dynamic = "force-dynamic";

type ArtigoRecente = {
  id: string;
  titulo: string;
  status: string;
  criado_em: string;
};

const statusBadge: Record<string, string> = {
  rascunho: "bg-slate-100 text-slate-600",
  aprovado: "bg-blue-100 text-blue-700",
  publicado: "bg-green-100 text-green-700",
  indexado: "bg-brand-100 text-brand-700",
};

export default async function DashboardHome() {
  const supabase = createClient();

  const [
    { count: totalBlogs },
    { count: linksAtivos },
    { count: artigosPendentes },
    { data: ultimosArtigos },
  ] = await Promise.all([
    supabase.from("blogs").select("*", { count: "exact", head: true }),
    supabase
      .from("links_ativos")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo"),
    supabase
      .from("artigos")
      .select("*", { count: "exact", head: true })
      .eq("status", "rascunho"),
    supabase
      .from("artigos")
      .select("id, titulo, status, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5),
  ]);

  const artigos = (ultimosArtigos ?? []) as ArtigoRecente[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da sua rede de blogs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Blogs na rede"
          value={totalBlogs ?? 0}
          icon="🌐"
          accent="brand"
        />
        <StatCard
          label="Links ativos"
          value={linksAtivos ?? 0}
          icon="⚡"
          accent="green"
        />
        <StatCard
          label="Artigos pendentes"
          value={artigosPendentes ?? 0}
          icon="📝"
          accent="amber"
        />
      </div>

      {/* Últimos artigos */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Últimos artigos gerados</h2>
          <Link
            href="/artigos"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos
          </Link>
        </div>

        {artigos.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-500">
              Nenhum artigo gerado ainda.
            </p>
            <Link
              href="/artigos/gerar"
              className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Gerar primeiro artigo
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {artigos.map((artigo) => (
              <li key={artigo.id}>
                <Link
                  href={`/artigos/${artigo.id}`}
                  className="flex items-center justify-between px-5 py-3 transition hover:bg-slate-50"
                >
                  <span className="truncate text-sm font-medium text-slate-800">
                    {artigo.titulo}
                  </span>
                  <span
                    className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusBadge[artigo.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {artigo.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
