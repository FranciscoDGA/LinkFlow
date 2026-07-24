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

interface SearchParams {
  status?: string;
  origem?: string;
  destino?: string;
}

export default async function ArtigosPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = createClient();
  const searchParams = await props.searchParams;

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

  // Busca artigos do usuário com filtros
  let query = supabase
    .from("artigos")
    .select("*")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  if (searchParams.status && searchParams.status !== "todos") {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.origem) {
    query = query.eq("blog_origem_id", searchParams.origem);
  }

  if (searchParams.destino) {
    query = query.eq("blog_destino_id", searchParams.destino);
  }

  const [{ data: artigos }, { data: blogsData }] = await Promise.all([
    query,
    supabase.from("blogs").select("id, nome").eq("user_id", user.id),
  ]);

  const artigosLista = (artigos as Artigo[]) || [];
  const blogs = new Map((blogsData || []).map((b: any) => [b.id, b.nome]));

  // Estatísticas
  const { data: stats } = await supabase
    .from("artigos")
    .select("status", { count: "exact" })
    .eq("user_id", user.id);

  const contagemPorStatus = {
    rascunho: 0,
    aprovado: 0,
    publicado: 0,
    indexado: 0,
  };

  (stats || []).forEach((s: any) => {
    if (s.status in contagemPorStatus) {
      contagemPorStatus[s.status as keyof typeof contagemPorStatus]++;
    }
  });

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

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(contagemPorStatus).map(([status, count]) => {
          const colors =
            STATUS_CORES[status] || STATUS_CORES.rascunho;
          return (
            <Link
              key={status}
              href={`/artigos?status=${status}`}
              className={`rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md ${
                searchParams.status === status ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <p className="text-xs font-medium text-slate-600 capitalize">
                {colors.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {count}
              </p>
              <p className="mt-1 text-xs text-slate-500">artigos</p>
            </Link>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/artigos"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !searchParams.status
              ? "bg-brand-600 text-white"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Todos
        </Link>
        {Object.keys(STATUS_CORES).map((status) => (
          <Link
            key={status}
            href={`/artigos?status=${status}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition capitalize ${
              searchParams.status === status
                ? "bg-brand-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {STATUS_CORES[status].label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {artigosLista.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            📝
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            {searchParams.status === "todos" || !searchParams.status
              ? "Nenhum artigo gerado ainda"
              : `Nenhum artigo com status "${
                  STATUS_CORES[searchParams.status]?.label || searchParams.status
                }"`}
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
            const blogOrigem = blogs.get(artigo.blog_origem_id) || "—";
            const blogDestino = blogs.get(artigo.blog_destino_id) || "—";

            let acaoPrimaria: string = "";
            let acaoPrimariaUrl: string = "";
            let acaoPrimariaColor: string = "";

            if (artigo.status === "rascunho") {
              acaoPrimaria = "Revisar";
              acaoPrimariaUrl = `/artigos/${artigo.id}`;
              acaoPrimariaColor = "text-blue-600 hover:text-blue-700";
            } else if (artigo.status === "aprovado") {
              acaoPrimaria = "Publicar";
              acaoPrimariaUrl = `/artigos/${artigo.id}`;
              acaoPrimariaColor = "text-green-600 hover:text-green-700";
            } else if (artigo.status === "publicado") {
              acaoPrimaria = "Ver Detalhes";
              acaoPrimariaUrl = `/artigos/${artigo.id}`;
              acaoPrimariaColor = "text-purple-600 hover:text-purple-700";
            } else {
              acaoPrimaria = "Ver";
              acaoPrimariaUrl = `/artigos/${artigo.id}`;
              acaoPrimariaColor = "text-slate-600 hover:text-slate-700";
            }

            return (
              <div
                key={artigo.id}
                className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <h3 className="font-medium text-slate-900">
                      {artigo.titulo}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.text} whitespace-nowrap`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
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

                  {artigo.url_publicada && (
                    <p className="mt-2 text-xs text-slate-500 break-all">
                      🌐 <strong>URL:</strong> {artigo.url_publicada}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 whitespace-nowrap">
                  <Link
                    href={acaoPrimariaUrl}
                    className={`text-sm font-medium transition ${acaoPrimariaColor}`}
                  >
                    {acaoPrimaria}
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
