import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnchorsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            Você precisa estar autenticado.
          </p>
        </div>
      </div>
    );
  }

  // Busca blogs e anchor texts
  const [{ data: blogsData }, { data: anchorsData }] = await Promise.all([
    supabase.from("blogs").select("id, nome").eq("user_id", user.id),
    supabase
      .from("anchor_texts")
      .select("*")
      .eq("user_id", user.id)
      .order("vezes_usado", { ascending: false }),
  ]);

  const blogs = new Map((blogsData || []).map((b: any) => [b.id, b.nome]));
  const anchors = (anchorsData as any[]) || [];

  // Agrupa por blog destino e calcula estatísticas
  const anchorsPorBlog = new Map<string, any[]>();
  anchors.forEach((anchor) => {
    const blogId = anchor.blog_destino_id;
    if (!anchorsPorBlog.has(blogId)) {
      anchorsPorBlog.set(blogId, []);
    }
    anchorsPorBlog.get(blogId)?.push(anchor);
  });

  // Calcula total de usos por blog para detectar over-optimization
  const estatisticasPorBlog = new Map<
    string,
    {
      total: number;
      porcentagens: Map<string, number>;
      otimizadosExcesso: string[];
    }
  >();

  anchorsPorBlog.forEach((anchorsDoBllog, blogId) => {
    const totalUsos = anchorsDoBllog.reduce(
      (sum, a) => sum + a.vezes_usado,
      0
    );
    const porcentagens = new Map<string, number>();
    const otimizadosExcesso: string[] = [];

    anchorsDoBllog.forEach((anchor) => {
      const pct = totalUsos > 0 ? (anchor.vezes_usado / totalUsos) * 100 : 0;
      porcentagens.set(anchor.id, pct);

      if (pct > 30) {
        otimizadosExcesso.push(
          `${anchor.texto} (${pct.toFixed(1)}%)`
        );
      }
    });

    estatisticasPorBlog.set(blogId, {
      total: totalUsos,
      porcentagens,
      otimizadosExcesso,
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Anchor Texts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie a diversidade de anchor texts para evitar footprint de SEO.
        </p>
      </div>

      {anchors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            🔗
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Nenhum anchor text ainda
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Os anchor texts aparecem aqui quando você gera artigos.
          </p>
          <Link
            href="/artigos/gerar"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Gerar Primeiro Artigo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(anchorsPorBlog.entries()).map(([blogId, anchorsDoBllog]) => {
            const blogNome = blogs.get(blogId) || "—";
            const stats = estatisticasPorBlog.get(blogId);
            const temAlerta = (stats?.otimizadosExcesso.length || 0) > 0;

            return (
              <div
                key={blogId}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {blogNome}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Total de {stats?.total || 0} usos em{" "}
                      {anchorsDoBllog.length} anchor texts
                    </p>
                  </div>
                  {temAlerta && (
                    <div className="rounded-lg bg-red-50 px-3 py-2">
                      <p className="text-xs font-medium text-red-700">
                        ⚠️ Over-optimization detectada
                      </p>
                    </div>
                  )}
                </div>

                {temAlerta && (
                  <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-800">
                      Anchors com mais de 30% de uso:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {stats?.otimizadosExcesso.map((msg) => (
                        <li key={msg} className="text-xs text-red-700">
                          • {msg}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-red-600">
                      💡 Dica: Use mais variações de anchor text para evitar
                      penalização de SEO.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {anchorsDoBllog.map((anchor) => {
                    const pct = stats?.porcentagens.get(anchor.id) || 0;
                    const isExcesso = pct > 30;

                    return (
                      <div
                        key={anchor.id}
                        className={`rounded-lg border ${
                          isExcesso
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-slate-50"
                        } p-3`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {anchor.texto}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Usado {anchor.vezes_usado}x ({pct.toFixed(1)}% do
                              total)
                            </p>
                            {anchor.ultimo_uso && (
                              <p className="text-xs text-slate-500">
                                Último uso:{" "}
                                {new Date(anchor.ultimo_uso).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            )}
                          </div>
                          <div
                            className={`h-16 w-16 rounded-full flex items-center justify-center font-semibold text-sm ${
                              isExcesso
                                ? "bg-red-200 text-red-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {pct.toFixed(0)}%
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${
                              isExcesso ? "bg-red-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-medium text-slate-900">📊 Recomendações</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          <li>✓ Mantenha anchor texts variados (máximo 30% cada um)</li>
          <li>✓ Use sempre uma mistura de:</li>
          <li className="ml-4">
            • <strong>Exact match:</strong> Palavra-chave exata
          </li>
          <li className="ml-4">
            • <strong>Partial match:</strong> Palavra-chave + outras palavras
          </li>
          <li className="ml-4">
            • <strong>Branded:</strong> Nome do blog ou marca
          </li>
          <li className="ml-4">
            • <strong>Generic:</strong> Clique aqui, saiba mais, leia mais
          </li>
        </ul>
      </div>
    </div>
  );
}
