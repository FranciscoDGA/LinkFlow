"use client";

import { useState, useTransition } from "react";
import { Article, ArticleStatus } from "@/lib/types";
import { updateArticleStatusAction } from "@/app/actions/editorial";
import { Modal } from "@/components/ui/Modal";

interface ArticleStatusControlProps {
  article: Article;
}

const statusOptions: { value: ArticleStatus; label: string; desc: string }[] = [
  { value: "idea", label: "Ideia", desc: "Conceito inicial em pauta" },
  { value: "in_production", label: "Em Produção", desc: "Redação e geração de conteúdo em andamento" },
  { value: "reviewing", label: "Em Revisão", desc: "Pronto para análise editorial e SEO" },
  { value: "approved", label: "Aprovado", desc: "Homologado para publicação" },
  { value: "archived", label: "Arquivado", desc: "Descartado ou mantido para histórico" },
];

export function ArticleStatusControl({ article }: ArticleStatusControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus>(article.status);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setSelectedStatus(article.status);
    setReason("");
    setErrorMsg(null);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (selectedStatus === article.status) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await updateArticleStatusAction(article.id, selectedStatus, reason || undefined);
      if (res.success) {
        setIsOpen(false);
      } else {
        setErrorMsg(res.error || "Erro ao atualizar status");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition"
      >
        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Alterar Status
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Alterar Status Editorial"
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Novo Status Editorial
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    selectedStatus === opt.value
                      ? "bg-zinc-800/90 border-blue-500 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="article_status"
                      value={opt.value}
                      checked={selectedStatus === opt.value}
                      onChange={() => setSelectedStatus(opt.value)}
                      className="accent-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium">{opt.label}</span>
                      <p className="text-xs text-zinc-400">{opt.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Justificativa / Motivo (Registrado na Trilha de Auditoria)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Revisão gramatical e SEO concluídos; pronto para deploy."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Confirmar Alteração"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
