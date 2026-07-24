import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Artigo } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_CORES: Record<string, { bg: string; text: string; label: string }> =
  {
    rascunho: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Rascunho" },
    aprovado: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "Aprovado",
    },
    publicado: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Publicado",
    },
    indexado: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      label: "Indexado",
    },
  };

export default async function ArtigosPage() {
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

  // Busca artigos do usuário
  const [{ data: artigos }, { data: blogsOrigemData }, { data: blogsDestinoData }] =
    await Promise.all([
      supabase
        .from("artigos")
        .select("*")
        .eq("user_id", user.id)
        .order("criado_em", { ascending: false }),
      supabase.from("blogs").select("id, nome").eq("user_id", user.id),
      supabase.from("blogs").select("id, nome").eq("user_id", user.id),
    ]);

  const artigosLista = (artigos as Artigo[]) || [];
  const blogsOrigem = new Map(
    (blogsOrigemData || []).map((b: any) => [b.id, b.nome])
  );
  const blogsDestino = new Map(
    (blogsDestinoData || []).map((b: any) => [b.id, b.nome])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Artigos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie os artigos gerados com IA por status.
          </p>
        </div>
        <Link
          href="/artigos/gerar"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          + Gerar Artigo
        </Link>
      </div>

      {artigosLista.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            📝
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Nenhum artigo gerado ainda
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Use a IA para gerar artigos com links internos automáticos.
          </p>
          <Link
            href="/artigos/gerar"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Gerar Primeiro Artigo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {artigosLista.map((artigo) => {
            const statusInfo = STATUS_CORES[artigo.status] || STATUS_CORES.rascunho;
            const blogOrigem = blogsOrigem.get(artigo.blog_origem_id) || "—";
            const blogDestino = blogsDestino.get(artigo.blog_destino_id) || "—";

            return (
              <div
                key={artigo.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{artigo.titulo}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>
                      📖 <strong>{blogOrigem}</strong> → <strong>{blogDestino}</strong>
                    </span>
                    {artigo.palavra_chave && (
                      <span>
                        🔑 <strong>{artigo.palavra_chave}</strong>
                      </span>
                    )}
                    <span>
                      🔗 <strong>{artigo.anchor_text}</strong>
                    </span>
                    <span className="text-slate-500">
                      {new Date(artigo.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}
                  >
                    {statusInfo.label}
                  </span>
                  <Link
                    href={`/artigos/${artigo.id}`}
                    className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
