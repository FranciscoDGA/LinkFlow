import Link from "next/link";
import { notFound } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { Badge } from "@/components/ui/Badge";
import { ArticleStatusControl } from "@/components/articles/ArticleStatusControl";

interface ArticleDetailPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

const statusVariantMap = {
  idea: "default",
  in_production: "info",
  reviewing: "warning",
  approved: "success",
  archived: "purple",
} as const;

const statusLabelMap = {
  idea: "Ideia",
  in_production: "Em Produção",
  reviewing: "Em Revisão",
  approved: "Aprovado",
  archived: "Arquivado",
} as const;

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await Promise.resolve(params);
  const article = await dataStore.getArticleById(id);

  if (!article) {
    notFound();
  }

  const versions = await dataStore.getArticleVersions(id);
  const currentVer = versions[0];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
          <Link href="/artigos" className="hover:text-zinc-200 transition">
            ← Voltar para Artigos
          </Link>
          <span>/</span>
          <span className="text-zinc-500 font-mono text-[11px] truncate max-w-xs">{article.slug}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {article.title}
              </h1>
              <Badge variant={statusVariantMap[article.status]}>
                {statusLabelMap[article.status]}
              </Badge>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                v{article.current_version}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Slug: <span className="text-blue-400">{article.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ArticleStatusControl article={article} />
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium">Blog Destino</div>
          <div className="text-sm font-semibold text-zinc-100">{article.site?.name || "Desconhecido"}</div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">{article.site?.domain}</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium">Pauta Vinculada</div>
          <div className="text-sm font-semibold text-zinc-100 truncate">
            {article.topic?.title || "Sem pauta vinculada"}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Palavra-chave: {article.topic?.primary_keyword || "N/A"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium">Última Atualização</div>
          <div className="text-sm font-semibold text-zinc-100 font-mono">
            {new Date(article.updated_at).toLocaleString("pt-BR")}
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-0.5">
            Criado em: {new Date(article.created_at).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </div>

      {/* SEO & Description */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Metadados & SEO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block mb-1">Palavra-chave Primária:</span>
            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-mono">
              {article.primary_keyword || "Não informada"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Meta Descrição (SEO):</span>
            <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              {article.seo_description || "Nenhuma descrição fornecida."}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Conteúdo Markdown Atual</h2>
          <span className="text-xs text-zinc-500">
            {article.content_markdown ? `${article.content_markdown.length} caracteres` : "0 caracteres"}
          </span>
        </div>
        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {article.content_markdown || "Nenhum conteúdo em markdown adicionado ainda."}
        </div>
      </div>

      {/* Version History & Cryptographic Hash */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Histórico de Versões & Integridade Criptográfica</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cada versão é imutável e possui hash SHA-256 canônico calculado (RFC 8785)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono">
            {versions.length} {versions.length === 1 ? "versão" : "versões"}
          </span>
        </div>

        {versions.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">Nenhum snapshot de versão registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Versão</th>
                  <th className="py-2.5 px-3 font-medium">Título Snapshot</th>
                  <th className="py-2.5 px-3 font-medium">Hash Criptográfico (SHA-256)</th>
                  <th className="py-2.5 px-3 font-medium">Autor</th>
                  <th className="py-2.5 px-3 font-medium">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                {versions.map((ver) => (
                  <tr key={ver.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-blue-400">
                      v{ver.version_number}
                    </td>
                    <td className="py-3 px-3 font-sans text-zinc-200 truncate max-w-xs">
                      {ver.title}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-zinc-400">
                      <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400 font-mono select-all">
                        {ver.content_hash.slice(0, 16)}...{ver.content_hash.slice(-8)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 font-sans text-xs">
                      {ver.created_by}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-xs">
                      {new Date(ver.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
