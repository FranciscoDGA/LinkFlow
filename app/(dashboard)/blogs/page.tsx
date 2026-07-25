import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BlogCard from "@/components/blogs/BlogCard";
import SyncMetricsButton from "@/components/blogs/SyncMetricsButton";
import type { Blog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const supabase = createClient();

  const [{ data: blogsData }, { data: linksData }] = await Promise.all([
    supabase.from("blogs").select("*").order("criado_em", { ascending: false }),
    supabase
      .from("links_ativos")
      .select("blog_origem_id, blog_destino_id")
      .eq("status", "ativo"),
  ]);

  const blogs = (blogsData ?? []) as Blog[];
  const links = linksData ?? [];

  // Conta links recebidos (como destino) e enviados (como origem) por blog.
  const recebidos = new Map<string, number>();
  const enviados = new Map<string, number>();
  for (const l of links) {
    recebidos.set(l.blog_destino_id, (recebidos.get(l.blog_destino_id) ?? 0) + 1);
    enviados.set(l.blog_origem_id, (enviados.get(l.blog_origem_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs</h1>
          <p className="mt-1 text-sm text-slate-500">
            {blogs.length === 0
              ? "Cadastre os blogs da sua rede."
              : `${blogs.length} blog${blogs.length > 1 ? "s" : ""} na rede.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncMetricsButton />
          <Link
            href="/blogs/novo"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            + Novo blog
          </Link>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            🌐
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Nenhum blog ainda
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Comece cadastrando o primeiro blog da sua rede.
          </p>
          <Link
            href="/blogs/novo"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Cadastrar blog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              linksRecebidos={recebidos.get(blog.id) ?? 0}
              linksEnviados={enviados.get(blog.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
