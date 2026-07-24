import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FormularioGeracaoArtigo from "@/components/artigos/FormularioGeracaoArtigo";

export const dynamic = "force-dynamic";

export default async function GerarArtigoPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            Você precisa estar autenticado para gerar artigos.
          </p>
        </div>
      </div>
    );
  }

  // Busca os blogs do usuário
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .order("nome", { ascending: true });

  const blogsDisponivel = (blogs as any[]) || [];

  if (blogsDisponivel.length < 2) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerar Artigo com IA</h1>
          <p className="mt-1 text-sm text-slate-500">
            Para gerar artigos, você precisa configurar seus blogs e relacionamentos.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            📝
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Cadastre pelo menos 2 blogs
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Para gerar artigos com links internos, você precisa ter no mínimo
            dois blogs cadastrados e relacionamentos entre eles.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/blogs/novo"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Cadastrar blog
            </Link>
            <Link
              href="/relacionamentos"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Configurar relacionamentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <FormularioGeracaoArtigo blogsDestino={blogsDisponivel} />;
}
