"use client";

import React, { useState, useEffect } from "react";
import { Compass, Plus, Search, Trash2, Filter, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Topic, Site } from "@/lib/types";
import { createTopicAction, deleteTopicAction } from "@/app/actions/editorial";

export default function PautasPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [resTopics, resSites] = await Promise.all([
        fetch("/api/topics"),
        fetch("/api/sites"),
      ]);
      if (resTopics.ok && resSites.ok) {
        setTopics(await resTopics.json());
        setSites(await resSites.json());
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.primary_keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSiteId === "all" || t.site_id === selectedSiteId;
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
    return matchesSearch && matchesSite && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createTopicAction(formData);

    if (res.success) {
      setIsCreateModalOpen(false);
      loadData();
    } else {
      setErrorMessage(res.error || "Erro ao cadastrar pauta");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await deleteTopicAction(topicToDelete.id);
    if (res.success) {
      setTopicToDelete(null);
      loadData();
    } else {
      setErrorMessage(res.error || "Erro ao excluir pauta");
      setTopicToDelete(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-emerald-400" />
            Gestão de Pautas Editoriais
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento semântico, palavras-chave e intenção de busca para os blogs.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Pauta</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-surface-card border border-surface-border p-3.5 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar pautas ou palavras-chave..."
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
            <option value="planned">Planejada</option>
            <option value="in_production">Em Produção</option>
            <option value="completed">Concluída</option>
            <option value="canceled">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pautas */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Tema / Pauta</th>
                <th className="py-3.5 px-4">Blog de Destino</th>
                <th className="py-3.5 px-4">Palavra-Chave Principal</th>
                <th className="py-3.5 px-4">Intenção</th>
                <th className="py-3.5 px-4">Prioridade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhuma pauta encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                      {topic.title}
                      {topic.theme && (
                        <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                          Tema: {topic.theme}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {topic.site?.name || "Blog vinculado"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface border border-surface-border font-mono text-emerald-400">
                        {topic.primary_keyword}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 capitalize">
                      {topic.search_intent}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          topic.priority === "high"
                            ? "danger"
                            : topic.priority === "medium"
                            ? "warning"
                            : "default"
                        }
                      >
                        {topic.priority === "high" && "Alta"}
                        {topic.priority === "medium" && "Média"}
                        {topic.priority === "low" && "Baixa"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          topic.status === "completed"
                            ? "success"
                            : topic.status === "in_production"
                            ? "info"
                            : "default"
                        }
                      >
                        {topic.status === "planned" && "Planejada"}
                        {topic.status === "in_production" && "Em Produção"}
                        {topic.status === "completed" && "Concluída"}
                        {topic.status === "canceled" && "Cancelada"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setTopicToDelete(topic)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Excluir pauta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação de Pauta */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Cadastrar Nova Pauta"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Blog de Destino</label>
            <select
              name="site_id"
              required
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
            <label className="block font-semibold text-slate-300 mb-1">Título / Tema da Pauta</label>
            <input
              name="title"
              required
              placeholder="Ex: Como proteger investimentos em caso de separação"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Palavra-Chave Principal</label>
              <input
                name="primary_keyword"
                required
                placeholder="Ex: proteção de investimentos prenup"
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cluster / Tema</label>
              <input
                name="theme"
                placeholder="Ex: Patrimônio & Finanças"
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Palavras-Chave Secundárias (separadas por vírgula)
            </label>
            <input
              name="secondary_keywords"
              placeholder="Ex: partilha de bens, acordo antenupcial, holding familiar"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Intenção de Busca</label>
              <select
                name="search_intent"
                defaultValue="informational"
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="informational">Informativa</option>
                <option value="commercial">Comercial</option>
                <option value="transactional">Transacional</option>
                <option value="navigational">Navegacional</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Prioridade</label>
              <select
                name="priority"
                defaultValue="medium"
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta (Prioritária)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Observações Editoriais</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Diretrizes específicas de tom, referências legais..."
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
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
              {isSubmitting ? "Cadastrando..." : "Cadastrar Pauta"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(topicToDelete)}
        onClose={() => setTopicToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Pauta"
        description={`Tem certeza que deseja remover a pauta "${topicToDelete?.title}"? A operação só será permitida se não houver artigos vinculados.`}
        confirmLabel="Sim, Excluir"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
}
