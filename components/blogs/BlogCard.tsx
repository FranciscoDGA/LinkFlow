import Link from "next/link";
import type { Blog } from "@/lib/types";

const plataformaLabel: Record<string, string> = {
  nextjs: "Next.js",
  wordpress: "WordPress",
  outro: "Outro",
};

export default function BlogCard({
  blog,
  linksRecebidos,
  linksEnviados,
}: {
  blog: Blog;
  linksRecebidos: number;
  linksEnviados: number;
}) {
  let host = blog.url;
  try {
    host = new URL(blog.url).host;
  } catch {
    // mantém o valor original se não for uma URL válida
  }

  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{blog.nome}</h3>
          <p className="truncate text-xs text-slate-400">{host}</p>
        </div>
        {!blog.ativo && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            inativo
          </span>
        )}
      </div>

      <span className="mt-3 inline-block w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
        {blog.nicho}
      </span>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">DR</p>
          <p className="font-semibold text-slate-800">{blog.dr}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Tráfego/mês</p>
          <p className="font-semibold text-slate-800">
            {blog.trafego_mensal.toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Links recebidos</p>
          <p className="font-semibold text-green-700">{linksRecebidos}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Links enviados</p>
          <p className="font-semibold text-brand-700">{linksEnviados}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {plataformaLabel[blog.plataforma] ?? blog.plataforma} · até{" "}
        {blog.limite_links_mes} links/mês
      </p>
    </Link>
  );
}
