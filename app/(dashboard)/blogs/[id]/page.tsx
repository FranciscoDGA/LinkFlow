import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogForm from "@/components/blogs/BlogForm";
import { deletarBlog } from "../actions";
import type { Blog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BlogDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!blog) {
    notFound();
  }

  const b = blog as Blog;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/blogs"
          className="text-sm text-brand-600 hover:text-brand-700"
        >
          ← Voltar para blogs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{b.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">Editar informações do blog.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <BlogForm blog={b} />
      </div>

      {/* Zona de perigo */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Remover blog</h2>
        <p className="mt-1 text-sm text-red-600">
          Esta ação não pode ser desfeita. Relacionamentos, artigos e links
          associados a este blog também serão removidos.
        </p>
        <form action={deletarBlog} className="mt-4">
          <input type="hidden" name="id" value={b.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Remover permanentemente
          </button>
        </form>
      </div>
    </div>
  );
}
