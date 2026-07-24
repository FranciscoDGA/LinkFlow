import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SearchParams {
  origem?: string;
  destino?: string;
  mes?: string;
  ano?: string;
  status?: string;
}

export default async function LinksPage(props: {
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

  // Busca links ativos do usuário
  let query = supabase
    .from("links_ativos")
    .select("*")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  if (searchParams.origem) {
    query = query.eq("blog_origem_id", searchParams.origem);
  }

  if (searchParams.destino) {
    query = query.eq("blog_destino_id", searchParams.destino);
  }

  if (searchParams.status && searchParams.status !== "todos") {
    query = query.eq("status", searchParams.status);
  }

  const [{ data: linksData }, { data: blogsData }] = await Promise.all([
    query,
    supabase.from("blogs").select("id, nome").eq("user_id", user.id),
  ]);

  const links = (linksData as any[]) || [];
  const blogs = new Map((blogsData || []).map((b: any) => [b.id, b.nome]));

  // Estatísticas
  const { data: stats } = await supabase
    .from("links_ativos")
    .select("status", { count: "exact" })
    .eq("user_id", user.id);

  const contagemStatus = {
    ativo: 0,
    removido: 0,
  };

  (stats || []).forEach((s: any) => {
    if (s.status in contagemStatus) {
      contagemStatus[s.status as keyof typeof contagemStatus]++;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Links Ativos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitore todos os links publicados e sua performance.
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Link
          href="/links"
          className={`rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md ${
            !searchParams.status ? "ring-2 ring-brand-500" : ""
          }`}
        >
          <p className="text-xs font-medium text-slate-600">Total</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{links.length}</p>
          <p className="mt-1 text-xs text-slate-500">links</p>
        </Link>
        <Link
          href="/links?status=ativo"
          className={`rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md ${
            searchParams.status === "ativo" ? "ring-2 ring-brand-500" : ""
          }`}
        >
          <p className="text-xs font-medium text-slate-600">Ativos</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {contagemStatus.ativo}
          </p>
          <p className="mt-1 text-xs text-slate-500">funcionando</p>
        </Link>
        <Link
          href="/links?status=removido"
          className={`rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md ${
            searchParams.status === "removido" ? "ring-2 ring-brand-500" : ""
          }`}
        >
          <p className="text-xs font-medium text-slate-600">Removidos</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {contagemStatus.removido}
          </p>
          <p className="mt-1 text-xs text-slate-500">descontinuados</p>
        </Link>
      </div>

      {/* Tabela */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            🔗
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Nenhum link ativo ainda
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Quando você publicar artigos, os links aparecerão aqui.
          </p>
          <Link
            href="/artigos/gerar"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Gerar Primeiro Artigo
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Blog Origem
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Blog Destino
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Anchor Text
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {links.map((link: any) => (
                <tr key={link.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {blogs.get(link.blog_origem_id) || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {blogs.get(link.blog_destino_id) || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {link.anchor_text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        link.status === "ativo"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {link.status === "ativo" ? "✓ Ativo" : "✗ Removido"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(link.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
