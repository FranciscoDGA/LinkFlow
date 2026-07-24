import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Artigo, Blog } from "@/lib/types";
import ArtigoDetalhes from "@/components/artigos/ArtigoDetalhes";

export const dynamic = "force-dynamic";

export default async function ArtigoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca o artigo
  const { data: artigo, error: erroArtigo } = await supabase
    .from("artigos")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (erroArtigo || !artigo) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            ❌ Artigo não encontrado.
          </p>
        </div>
        <Link
          href="/artigos"
          className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Voltar
        </Link>
      </div>
    );
  }

  // Busca dados dos blogs
  const [{ data: blogOrigem }, { data: blogDestino }] = await Promise.all([
    supabase
      .from("blogs")
      .select("id, nome, url")
      .eq("id", artigo.blog_origem_id)
      .single(),
    supabase
      .from("blogs")
      .select("id, nome, url")
      .eq("id", artigo.blog_destino_id)
      .single(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {(artigo as Artigo).titulo}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            ID: <code className="text-xs">{params.id}</code>
          </p>
        </div>
        <Link
          href="/artigos"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Voltar
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Status</p>
          <p className="mt-2 font-semibold text-slate-900 capitalize">
            {(artigo as Artigo).status}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Palavra-chave</p>
          <p className="mt-2 font-semibold text-slate-900">
            {(artigo as Artigo).palavra_chave || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Anchor Text</p>
          <p className="mt-2 font-semibold text-slate-900">
            {(artigo as Artigo).anchor_text}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Criado em</p>
          <p className="mt-2 text-sm text-slate-900">
            {new Date((artigo as Artigo).criado_em).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Blogs Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-900">Blog de Origem</p>
          <p className="mt-2 text-sm text-slate-600">
            <strong>{(blogOrigem as any)?.nome || "—"}</strong>
          </p>
          <p className="text-xs text-slate-500 break-all">
            {(blogOrigem as any)?.url || "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-900">Blog de Destino</p>
          <p className="mt-2 text-sm text-slate-600">
            <strong>{(blogDestino as any)?.nome || "—"}</strong>
          </p>
          <p className="text-xs text-slate-500 break-all">
            {(blogDestino as any)?.url || "—"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <ArtigoDetalhes
        artigo={artigo as Artigo}
        blogDestino={(blogDestino as any) || { id: "", nome: "", url: "" }}
      />
    </div>
  );
}
