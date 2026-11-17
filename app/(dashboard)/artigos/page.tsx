"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Filter, Eye, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Article, Site, Topic } from "@/lib/types";
import { createArticleAction } from "@/app/actions/editorial";

export default function ArtigosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos do formulário para auto-completar slug
  const [titleInput, setTitleInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [selectedBlogForCreate, setSelectedBlogForCreate] = useState("");

  const loadData = async () => {
    try {
      const [resArticles, resSites, resTopics] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/sites"),
        fetch("/api/topics"),
      ]);
      if (resArticles.ok && resSites.ok && resTopics.ok) {
        setArticles(await resArticles.json());
        setSites(await resSites.json());
        setTopics(await resTopics.json());
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitleInput(val);
    const autoSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlugInput(autoSlug);
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSiteId === "all" || a.site_id === selectedSiteId;
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    return matchesSearch && matchesSite && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createArticleAction(formData);

    if (res.success) {
      setIsCreateModalOpen(false);
      setTitleInput("");
      setSlugInput("");
      loadData();
    } else {
      setErrorMessage(res.error || "Erro ao cadastrar artigo");
    }
    setIsSubmitting(false);
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            Esteira de Artigos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento editorial: da ideia inicial à revisão e aprovação final de conteúdo.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Artigo</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-surface-card border border-surface-border p-3.5 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar por título ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Blogs</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="idea">Ideia</option>
            <option value="in_production">Em Produção</option>
            <option value="reviewing">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Artigos */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Título do Artigo</th>
                <th className="py-3.5 px-4">Blog de Destino</th>
                <th className="py-3.5 px-4">Slug Canônico</th>
                <th className="py-3.5 px-4">Versão</th>
                <th className="py-3.5 px-4">Status Editorial</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum artigo encontrado.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white max-w-sm truncate">
                      {article.title}
                      {article.topic && (
                        <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                          Pauta: {article.topic.title}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {article.site?.name || "Blog vinculado"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      /{article.slug}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      v{article.current_version}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariantMap[article.status]}>
                        {statusLabelMap[article.status]}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/artigos/${article.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-emerald-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Artigo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Cadastrar Novo Artigo"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Blog de Destino</label>
            <select
              name="site_id"
              required
              value={selectedBlogForCreate}
              onChange={(e) => setSelectedBlogForCreate(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione o blog...</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Pauta Vinculada (Opcional)
            </label>
            <select
              name="topic_id"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Nenhuma pauta associada</option>
              {topics
                .filter((t) => !selectedBlogForCreate || t.site_id === selectedBlogForCreate)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.primary_keyword})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Título do Artigo</label>
            <input
              name="title"
              required
              value={titleInput}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex: Como proteger seu 401(k) no acordo pré-nupcial"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Slug Canônico</label>
            <input
              name="slug"
              required
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="como-proteger-401k-acordo-prenupcial"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Palavra-Chave Principal</label>
              <input
                name="primary_keyword"
                placeholder="Ex: proteger 401k prenup"
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Descrição SEO (Meta)</label>
              <input
                name="seo_description"
                placeholder="Breve resumo para os motores de busca..."
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Conteúdo Inicial (Markdown)</label>
            <textarea
              name="content_markdown"
              rows={4}
              placeholder="# Título Principal&#10;&#10;Escreva ou rascunhe o conteúdo..."
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface border border-surface-border text-[11px] text-slate-400">
            ℹ️ O artigo será criado inicialmente no estado estrito de <strong>Ideia</strong>, com versão 1 arquivada no histórico.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-surface border border-surface-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Artigo"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
