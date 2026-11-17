import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`p-3 rounded-xl border ${
            isDestructive
              ? "bg-rose-950/50 border-rose-800 text-rose-400"
              : "bg-amber-950/50 border-amber-800 text-amber-400"
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-surface hover:bg-slate-800 border border-surface-border rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
            isDestructive
              ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/50"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
          }`}
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
