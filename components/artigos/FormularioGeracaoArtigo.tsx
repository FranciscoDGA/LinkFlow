"use client";

import { useFormState } from "react-dom";
import { useState, useEffect } from "react";
import { gerarArtigoComIa, buscarBlogsOrigemPorDestino, buscarAnchorTextsSugeridos } from "@/app/(dashboard)/artigos/actions";
import { Blog, AnchorText } from "@/lib/types";
import { GeracaoArtigoState } from "@/app/(dashboard)/artigos/actions";

interface Props {
  blogsDestino: Blog[];
}

export default function FormularioGeracaoArtigo({ blogsDestino }: Props) {
  const [state, formAction, isPending] = useFormState(gerarArtigoComIa, {});

  const [blogDestinoSelecionado, setBlogDestinoSelecionado] = useState("");
  const [blogsOrigem, setBlogsOrigem] = useState<Blog[]>([]);
  const [anchorsSugeridos, setAnchorsSugeridos] = useState<AnchorText[]>([]);
  const [carregandoOrigens, setCarregandoOrigens] = useState(false);
  const [carregandoAnchors, setCarregandoAnchors] = useState(false);

  // Quando muda o blog destino, busca os blogs de origem e anchors sugeridos
  useEffect(() => {
    if (!blogDestinoSelecionado) {
      setBlogsOrigem([]);
      setAnchorsSugeridos([]);
      return;
    }

    const buscar = async () => {
      setCarregandoOrigens(true);
      setCarregandoAnchors(true);

      try {
        const [origens, anchors] = await Promise.all([
          buscarBlogsOrigemPorDestino(blogDestinoSelecionado),
          buscarAnchorTextsSugeridos(blogDestinoSelecionado),
        ]);

        setBlogsOrigem(origens);
        setAnchorsSugeridos(anchors);
      } finally {
        setCarregandoOrigens(false);
        setCarregandoAnchors(false);
      }
    };

    buscar();
  }, [blogDestinoSelecionado]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gerar Artigo com IA</h1>
        <p className="mt-1 text-sm text-slate-500">
          O LinkFlow gera artigos otimizados com links internos naturais.
        </p>
      </div>

      {state.success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            ✨ Artigo gerado com sucesso! ID: {state.artigoId}
          </p>
          <p className="mt-1 text-xs text-green-700">
            O artigo foi salvo como rascunho e pode ser revisado antes da publicação.
          </p>
        </div>
      )}

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">❌ {state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        {/* Blog Destino */}
        <div>
          <label htmlFor="blog_destino" className="block text-sm font-medium text-slate-700">
            Blog de Destino <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">Quem vai receber o link interno</p>
          <select
            id="blog_destino"
            name="blog_destino_id"
            value={blogDestinoSelecionado}
            onChange={(e) => setBlogDestinoSelecionado(e.target.value)}
            disabled={isPending}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
            required
          >
            <option value="">Selecione um blog...</option>
            {blogsDestino.map((blog) => (
              <option key={blog.id} value={blog.id}>
                {blog.nome} ({blog.nicho})
              </option>
            ))}
          </select>
        </div>

        {/* Blog Origem */}
        <div>
          <label htmlFor="blog_origem" className="block text-sm font-medium text-slate-700">
            Blog de Origem <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Que vai gerar o artigo (filtrado por relacionamentos)
          </p>
          {carregandoOrigens ? (
            <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Carregando blogs disponíveis...
            </div>
          ) : blogsOrigem.length === 0 ? (
            <div className="mt-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
              {blogDestinoSelecionado
                ? "Nenhum blog tem relacionamento com esse destino. Configure os relacionamentos primeiro."
                : "Selecione um blog de destino primeiro."}
            </div>
          ) : (
            <select
              id="blog_origem"
              name="blog_origem_id"
              disabled={isPending || blogsOrigem.length === 0}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
              required
            >
              <option value="">Selecione um blog...</option>
              {blogsOrigem.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.nome} ({blog.nicho})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Palavra-chave */}
        <div>
          <label htmlFor="palavra_chave" className="block text-sm font-medium text-slate-700">
            Palavra-chave Principal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="palavra_chave"
            name="palavra_chave"
            placeholder="Ex: como fazer SEO no WordPress"
            disabled={isPending}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
            required
          />
        </div>

        {/* Anchor Text */}
        <div>
          <label htmlFor="anchor_text" className="block text-sm font-medium text-slate-700">
            Anchor Text para o Link <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Como o link será exibido no artigo (ex: &apos;guia de SEO&apos;)
          </p>

          {carregandoAnchors ? (
            <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Carregando sugestões...
            </div>
          ) : anchorsSugeridos.length === 0 ? (
            <input
              type="text"
              id="anchor_text"
              name="anchor_text"
              placeholder="Ex: guia completo de SEO"
              disabled={isPending}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
              required
            />
          ) : (
            <>
              <select
                id="anchor_text"
                name="anchor_text"
                disabled={isPending}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
                required
              >
                <option value="">Selecione um anchor text sugerido ou digite outro...</option>
                {anchorsSugeridos.map((anchor) => (
                  <option key={anchor.id} value={anchor.texto}>
                    {anchor.texto} (usado {anchor.vezes_usado}x, {anchor.ultimo_uso ? "recente" : "novo"})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                ou digite um novo no campo abaixo:
              </p>
              <input
                type="text"
                placeholder="Novo anchor text..."
                disabled={isPending}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
                onChange={(e) => {
                  if (e.target.value) {
                    const select = document.getElementById("anchor_text") as HTMLSelectElement;
                    select.value = e.target.value;
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Título (opcional) */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-slate-700">
            Título do Artigo (opcional)
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Se não informar, será usado a palavra-chave como título
          </p>
          <input
            type="text"
            id="titulo"
            name="titulo"
            placeholder="Ex: Como Fazer SEO no WordPress - Guia Completo"
            disabled={isPending}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
          />
        </div>

        {/* Botão */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending || blogsOrigem.length === 0 || !blogDestinoSelecionado}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Gerando artigo..." : "Gerar com IA"}
          </button>
          <a
            href="/artigos"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar
          </a>
        </div>

        <p className="text-xs text-slate-500">
          💡 Este é um rascunho. Você poderá revisar e editar antes de publicar.
        </p>
      </form>
    </div>
  );
}
