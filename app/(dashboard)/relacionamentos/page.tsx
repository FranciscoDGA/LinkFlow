import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MatrizRelacionamentos from "@/components/relacionamentos/MatrizRelacionamentos";

export const dynamic = "force-dynamic";

export default async function RelacionamentosPage() {
  const supabase = createClient();

  const [{ data: blogsData }, { data: relData }] = await Promise.all([
    supabase.from("blogs").select("id, nome").order("nome", { ascending: true }),
    supabase
      .from("relacionamentos")
      .select("blog_origem_id, blog_destino_id, relevancia")
      .eq("ativo", true),
  ]);

  const blogs = blogsData ?? [];
  const relacionamentos = relData ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relacionamentos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Defina quais blogs podem linkar entre si e a relevância de cada
          conexão.
        </p>
      </div>

      {blogs.length < 2 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="text-4xl" aria-hidden>
            🔗
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Cadastre pelo menos 2 blogs
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            O mapa de relacionamentos precisa de no mínimo dois blogs para
            conectar.
          </p>
          <Link
            href="/blogs/novo"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Cadastrar blog
          </Link>
        </div>
      ) : (
        <MatrizRelacionamentos
          blogs={blogs}
          relacionamentosIniciais={relacionamentos}
        />
      )}
    </div>
  );
}
