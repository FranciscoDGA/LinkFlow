"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  aprovarArtigo,
  publicarArtigo,
  atualizarConteudoArtigo,
  deletarArtigo,
} from "@/app/(dashboard)/artigos/actions";
import { Artigo, Blog } from "@/lib/types";
import { GeracaoArtigoState } from "@/app/(dashboard)/artigos/actions";

interface Props {
  artigo: Artigo;
  blogDestino: Blog;
}

export default function ArtigoDetalhes({ artigo, blogDestino }: Props) {
  const [editando, setEditando] = useState(false);
  const [conteudoEditado, setConteudoEditado] = useState(artigo.conteudo);
  const [urlPublicada, setUrlPublicada] = useState(artigo.url_publicada || "");
  const [tituloEditado, setTituloEditado] = useState(artigo.titulo);
  const [mostrarPublicacao, setMostrarPublicacao] = useState(false);
  const [tab, setTab] = useState<"preview" | "editor">("preview");

  const [stateAprovar, formActionAprovar, isPendingAprovar] = useFormState(
    aprovarArtigo,
    {}
  );

  const [statePublicar, formActionPublicar, isPendingPublicar] = useFormState(
    publicarArtigo,
    {}
  );

  const [stateAtualizar, formActionAtualizar, isPendingAtualizar] = useFormState(
    atualizarConteudoArtigo,
    {}
  );

  const STATUS_CORES: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    rascunho: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Rascunho" },
    aprovado: { bg: "bg-blue-100", text: "text-blue-800", label: "Aprovado" },
    publicado: { bg: "bg-green-100", text: "text-green-800", label: "Publicado" },
    indexado: { bg: "bg-purple-100", text: "text-purple-800", label: "Indexado" },
  };

  const statusInfo = STATUS_CORES[artigo.status] || STATUS_CORES.rascunho;

  return (
    <div className="space-y-6">
      {/* Estados */}
      {stateAprovar.success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            ✅ Artigo aprovado com sucesso!
          </p>
        </div>
      )}

      {stateAprovar.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{stateAprovar.error}</p>
        </div>
      )}

      {statePublicar.success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            ✅ Artigo publicado com sucesso!
          </p>
        </div>
      )}

      {statePublicar.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{statePublicar.error}</p>
        </div>
      )}

      {stateAtualizar.success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            ✅ Conteúdo atualizado com sucesso!
          </p>
        </div>
      )}

      {stateAtualizar.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{stateAtualizar.error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            tab === "preview"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setTab("editor")}
          disabled={artigo.status !== "rascunho"}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            tab === "editor"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          } ${
            artigo.status !== "rascunho"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Editar
        </button>
      </div>

      {/* Preview */}
      {tab === "preview" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="prose prose-sm max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: artigo.conteudo,
              }}
            />
          </div>
        </div>
      )}

      {/* Editor */}
      {tab === "editor" && artigo.status === "rascunho" && (
        <form action={formActionAtualizar} className="space-y-4">
          <input type="hidden" name="artigo_id" value={artigo.id} />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={tituloEditado}
              onChange={(e) => setTituloEditado(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Conteúdo (HTML)
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Você pode editar o HTML diretamente
            </p>
            <textarea
              name="conteudo"
              value={conteudoEditado}
              onChange={(e) => setConteudoEditado(e.target.value)}
              rows={15}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPendingAtualizar}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isPendingAtualizar ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      )}

      {/* Preview after edit */}
      {tab === "editor" && artigo.status === "rascunho" && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-slate-900">Preview das alterações</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: conteudoEditado,
              }}
            />
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}
          >
            {statusInfo.label}
          </span>

          {/* RASCUNHO → APROVADO */}
          {artigo.status === "rascunho" && (
            <form action={formActionAprovar}>
              <input type="hidden" name="artigo_id" value={artigo.id} />
              <button
                type="submit"
                disabled={isPendingAprovar}
                className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isPendingAprovar ? "Aprovando..." : "Aprovar"}
              </button>
            </form>
          )}

          {/* APROVADO → PUBLICADO */}
          {artigo.status === "aprovado" && (
            <button
              onClick={() => setMostrarPublicacao(true)}
              className="ml-auto rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Publicar
            </button>
          )}

          {/* PUBLICADO → Info */}
          {artigo.status === "publicado" && (
            <div className="ml-auto text-sm text-slate-600">
              <p>
                Publicado em{" "}
                {artigo.publicado_em
                  ? new Date(artigo.publicado_em).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>
          )}
        </div>

        {/* Publicar - Dialog */}
        {artigo.status === "aprovado" && mostrarPublicacao && (
          <div className="rounded-lg border border-slate-200 bg-blue-50 p-4">
            <h3 className="font-medium text-slate-900">Publicar Artigo</h3>
            <p className="mt-1 text-sm text-slate-600">
              Após publicar, um registro será criado em links_ativos.
            </p>

            <form action={formActionPublicar} className="mt-4 space-y-3">
              <input type="hidden" name="artigo_id" value={artigo.id} />
              <input type="hidden" name="conteudo" value={conteudoEditado} />

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  URL Publicada <span className="text-red-500">*</span>
                </label>
                <p className="mt-1 text-xs text-slate-600">
                  URL onde este artigo foi publicado no blog de origem
                </p>
                <input
                  type="url"
                  name="url_publicada"
                  value={urlPublicada}
                  onChange={(e) => setUrlPublicada(e.target.value)}
                  placeholder="https://blogorigem.com/artigo-titulo"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPendingPublicar || !urlPublicada}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {isPendingPublicar ? "Publicando..." : "Confirmar Publicação"}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarPublicacao(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete button */}
      {artigo.status === "rascunho" && (
        <form
          action={deletarArtigo}
          className="pt-4 border-t border-slate-200"
          onSubmit={(e) => {
            if (
              !confirm(
                "Tem certeza que deseja deletar este artigo? Essa ação não pode ser desfeita."
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={artigo.id} />
          <button
            type="submit"
            className="text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            Deletar Rascunho
          </button>
        </form>
      )}
    </div>
  );
}
