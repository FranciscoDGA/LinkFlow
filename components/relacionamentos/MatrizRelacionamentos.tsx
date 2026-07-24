"use client";

import { useState, useTransition } from "react";
import {
  ativarRelacionamento,
  desativarRelacionamento,
} from "@/app/(dashboard)/relacionamentos/actions";

type BlogMini = { id: string; nome: string };

type RelInicial = {
  blog_origem_id: string;
  blog_destino_id: string;
  relevancia: number;
};

function chave(origem: string, destino: string): string {
  return `${origem}|${destino}`;
}

export default function MatrizRelacionamentos({
  blogs,
  relacionamentosIniciais,
}: {
  blogs: BlogMini[];
  relacionamentosIniciais: RelInicial[];
}) {
  const [mapa, setMapa] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    for (const r of relacionamentosIniciais) {
      m.set(chave(r.blog_origem_id, r.blog_destino_id), r.relevancia);
    }
    return m;
  });
  const [salvandoKey, setSalvandoKey] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function ativar(origem: string, destino: string) {
    const k = chave(origem, destino);
    setErro(null);
    setSalvandoKey(k);
    setMapa((prev) => new Map(prev).set(k, 5)); // otimista

    startTransition(async () => {
      const r = await ativarRelacionamento(origem, destino, 5);
      setSalvandoKey(null);
      if (!r.ok) {
        setErro(r.error ?? "Erro ao salvar.");
        setMapa((prev) => {
          const m = new Map(prev);
          m.delete(k);
          return m;
        });
      }
    });
  }

  function desativar(origem: string, destino: string) {
    const k = chave(origem, destino);
    const anterior = mapa.get(k) ?? 5;
    setErro(null);
    setSalvandoKey(k);
    setMapa((prev) => {
      const m = new Map(prev);
      m.delete(k);
      return m;
    });

    startTransition(async () => {
      const r = await desativarRelacionamento(origem, destino);
      setSalvandoKey(null);
      if (!r.ok) {
        setErro(r.error ?? "Erro ao salvar.");
        setMapa((prev) => new Map(prev).set(k, anterior)); // reverte
      }
    });
  }

  function mudarRelevancia(origem: string, destino: string, valor: number) {
    const k = chave(origem, destino);
    const anterior = mapa.get(k) ?? 5;
    setErro(null);
    setSalvandoKey(k);
    setMapa((prev) => new Map(prev).set(k, valor)); // otimista

    startTransition(async () => {
      const r = await ativarRelacionamento(origem, destino, valor);
      setSalvandoKey(null);
      if (!r.ok) {
        setErro(r.error ?? "Erro ao salvar.");
        setMapa((prev) => new Map(prev).set(k, anterior));
      }
    });
  }

  return (
    <div className="space-y-4">
      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-brand-500" /> ativo
          (relevância 1–10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-slate-300 bg-white" />{" "}
          clique para ativar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-200" /> mesmo
          blog (bloqueado)
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[160px] border-b border-r border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium text-slate-500">
                Origem ↓ / Destino →
              </th>
              {blogs.map((destino) => (
                <th
                  key={destino.id}
                  className="min-w-[96px] border-b border-slate-200 bg-slate-50 p-2 text-center text-xs font-medium text-slate-600"
                  title={destino.nome}
                >
                  <span className="line-clamp-2">{destino.nome}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blogs.map((origem) => (
              <tr key={origem.id}>
                <th
                  className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium text-slate-700"
                  title={origem.nome}
                >
                  <span className="line-clamp-2 max-w-[150px]">
                    {origem.nome}
                  </span>
                </th>

                {blogs.map((destino) => {
                  const mesmoBlog = origem.id === destino.id;
                  const k = chave(origem.id, destino.id);
                  const ativo = mapa.has(k);
                  const relevancia = mapa.get(k) ?? 5;
                  const salvando = salvandoKey === k;

                  if (mesmoBlog) {
                    return (
                      <td
                        key={destino.id}
                        className="border-b border-slate-100 bg-slate-100 p-2 text-center text-slate-300"
                      >
                        —
                      </td>
                    );
                  }

                  return (
                    <td
                      key={destino.id}
                      className="border-b border-l border-slate-100 p-0"
                    >
                      {ativo ? (
                        <div className="flex h-14 flex-col items-center justify-center gap-1 bg-brand-50">
                          <select
                            value={relevancia}
                            onChange={(e) =>
                              mudarRelevancia(
                                origem.id,
                                destino.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-12 rounded border border-brand-200 bg-white py-0.5 text-center text-xs font-semibold text-brand-700 outline-none"
                            aria-label={`Relevância de ${origem.nome} para ${destino.nome}`}
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(
                              (n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              )
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => desativar(origem.id, destino.id)}
                            className="text-[10px] text-slate-400 hover:text-red-600"
                          >
                            remover
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => ativar(origem.id, destino.id)}
                          className={`flex h-14 w-full items-center justify-center text-lg text-slate-300 transition hover:bg-brand-50 hover:text-brand-500 ${
                            salvando ? "opacity-50" : ""
                          }`}
                          aria-label={`Ativar link de ${origem.nome} para ${destino.nome}`}
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        A linha é o blog que <strong>envia</strong> o link; a coluna é o blog que{" "}
        <strong>recebe</strong>. As alterações são salvas automaticamente.
      </p>
    </div>
  );
}
