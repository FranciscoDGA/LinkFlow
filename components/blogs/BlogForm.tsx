"use client";

import { useFormState, useFormStatus } from "react-dom";
import { salvarBlog, type BlogFormState } from "@/app/(dashboard)/blogs/actions";
import { NICHOS_SUGERIDOS, PLATAFORMAS } from "@/lib/nichos";
import type { Blog } from "@/lib/types";

const initialState: BlogFormState = {};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function Campo({
  children,
  erro,
}: {
  children: React.ReactNode;
  erro?: string;
}) {
  return (
    <div>
      {children}
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

function SubmitButton({ editando }: { editando: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending
        ? "Salvando..."
        : editando
        ? "Salvar alterações"
        : "Cadastrar blog"}
    </button>
  );
}

export default function BlogForm({ blog }: { blog?: Blog }) {
  const [state, formAction] = useFormState(salvarBlog, initialState);
  const editando = Boolean(blog);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {blog && <input type="hidden" name="id" value={blog.id} />}

      <Campo erro={fe.nome}>
        <label htmlFor="nome" className={labelClass}>
          Nome do blog *
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={blog?.nome ?? ""}
          className={inputClass}
          required
        />
      </Campo>

      <Campo erro={fe.url}>
        <label htmlFor="url" className={labelClass}>
          URL *
        </label>
        <input
          id="url"
          name="url"
          type="text"
          placeholder="https://meublog.com.br"
          defaultValue={blog?.url ?? ""}
          className={inputClass}
          required
        />
      </Campo>

      <Campo erro={fe.nicho}>
        <label htmlFor="nicho" className={labelClass}>
          Nicho *
        </label>
        <input
          id="nicho"
          name="nicho"
          list="nichos"
          defaultValue={blog?.nicho ?? ""}
          className={inputClass}
          placeholder="Selecione ou digite"
          required
        />
        <datalist id="nichos">
          {NICHOS_SUGERIDOS.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </Campo>

      <Campo>
        <label htmlFor="descricao" className={labelClass}>
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={blog?.descricao ?? ""}
          className={inputClass}
        />
      </Campo>

      <Campo>
        <label htmlFor="publico_alvo" className={labelClass}>
          Público-alvo
        </label>
        <input
          id="publico_alvo"
          name="publico_alvo"
          defaultValue={blog?.publico_alvo ?? ""}
          className={inputClass}
        />
      </Campo>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Campo erro={fe.dr}>
          <label htmlFor="dr" className={labelClass}>
            DR atual
          </label>
          <input
            id="dr"
            name="dr"
            type="number"
            min={0}
            max={100}
            defaultValue={blog?.dr ?? 0}
            className={inputClass}
          />
        </Campo>

        <Campo erro={fe.trafego_mensal}>
          <label htmlFor="trafego_mensal" className={labelClass}>
            Tráfego mensal
          </label>
          <input
            id="trafego_mensal"
            name="trafego_mensal"
            type="number"
            min={0}
            defaultValue={blog?.trafego_mensal ?? 0}
            className={inputClass}
          />
        </Campo>

        <Campo erro={fe.limite_links_mes}>
          <label htmlFor="limite_links_mes" className={labelClass}>
            Limite de links/mês
          </label>
          <input
            id="limite_links_mes"
            name="limite_links_mes"
            type="number"
            min={1}
            defaultValue={blog?.limite_links_mes ?? 4}
            className={inputClass}
          />
        </Campo>
      </div>

      <Campo erro={fe.plataforma}>
        <label htmlFor="plataforma" className={labelClass}>
          Plataforma
        </label>
        <select
          id="plataforma"
          name="plataforma"
          defaultValue={blog?.plataforma ?? "nextjs"}
          className={inputClass}
        >
          {PLATAFORMAS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.label}
            </option>
          ))}
        </select>
      </Campo>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton editando={editando} />
        <a
          href="/blogs"
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
