"use client";

import React, { useState, useEffect } from "react";
import { Globe, Plus, Search, ExternalLink, Trash2, Edit3, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Site } from "@/lib/types";
import { createSiteAction, deleteSiteAction } from "@/app/actions/editorial";

export default function BlogsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega dados iniciais via fetch ou chamada local
  const loadSites = async () => {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createSiteAction(formData);

    if (res.success) {
      setIsCreateModalOpen(false);
      loadSites();
    } else {
      setErrorMessage(res.error || "Erro ao cadastrar blog");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await deleteSiteAction(siteToDelete.id);
    if (res.success) {
      setSiteToDelete(null);
      loadSites();
    } else {
      setErrorMessage(res.error || "Erro ao excluir blog");
      setSiteToDelete(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-emerald-400" />
            Meus Blogs Cadastrados
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Administre a infraestrutura, plataformas e métodos de integração de cada blog.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Blog</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex items-center gap-4 bg-surface-card border border-surface-border p-3.5 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou domínio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid de Blogs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSites.map((site) => (
          <div
            key={site.id}
            className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-slate-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{site.name}</h3>
                  <a
                    href={site.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {site.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Badge variant={site.is_active ? "success" : "default"}>
                  {site.is_active ? "Ativo" : "Pausado"}
                </Badge>
              </div>

              {site.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {site.description}
                </p>
              )}

              <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-surface-border">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tecnologia:</span>
                  <span className="font-mono text-slate-300">
                    {site.platform === "passacumaru_api" && "Vite + Supabase"}
                    {site.platform === "github_pr_astro" && "Astro SSG"}
                    {site.platform === "github_pr_next" && "Next.js App Router"}
                    {site.platform === "github_pr_html" && "HTML Estático"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Integração:</span>
                  <span className="text-slate-300">
                    {site.platform === "passacumaru_api" ? "Organic Bridge (API)" : "GitHub PR + Vercel"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-surface-border">
              <button
                onClick={() => setSiteToDelete(site)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Excluir Blog"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação de Blog */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Cadastrar Novo Blog"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nome do Blog</label>
            <input
              name="name"
              required
              placeholder="Ex: Passa Cumaru"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Domínio</label>
            <input
              name="domain"
              required
              placeholder="meublog.com.br"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">URL Pública</label>
            <input
              name="public_url"
              type="url"
              required
              placeholder="https://www.meublog.com.br"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Tecnologia / Conector</label>
            <select
              name="platform"
              defaultValue="passacumaru_api"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="passacumaru_api">Vite + Supabase API (PassaCumaru Bridge)</option>
              <option value="github_pr_astro">Astro SSG (GitHub Pull Request)</option>
              <option value="github_pr_next">Next.js App Router (GitHub Pull Request)</option>
              <option value="github_pr_html">HTML Estático (GitHub Pull Request)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Sobre o que é este blog..."
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked
              className="rounded bg-surface border-surface-border text-emerald-500 focus:ring-0"
            />
            <label htmlFor="is_active" className="text-slate-300 font-medium">
              Blog Ativo no Sistema
            </label>
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
              {isSubmitting ? "Cadastrando..." : "Cadastrar Blog"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(siteToDelete)}
        onClose={() => setSiteToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Blog"
        description={`Tem certeza que deseja remover o blog "${siteToDelete?.name}"? A exclusão só será permitida se não houver pautas ou artigos vinculados.`}
        confirmLabel="Sim, Excluir"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
}
