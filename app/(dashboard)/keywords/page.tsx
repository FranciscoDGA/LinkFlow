"use client";

import { useState } from "react";

type KeywordData = {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
};

export default function KeywordsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KeywordData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/seo/keywords?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.data) {
        setResults(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (diff: number) => {
    if (diff < 30) return "text-green-600 bg-green-50";
    if (diff < 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Keyword Explorer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pesquise o volume de buscas e dificuldade antes de gerar um artigo. (MVP - Mock Data)
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: ansiedade na menopausa"
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isLoading ? "Pesquisando..." : "Pesquisar"}
          </button>
        </form>
      </div>

      {results && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Palavra-chave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Volume (mês)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  KD (Dificuldade)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Intenção
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {results.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {row.keyword}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {row.volume.toLocaleString("pt-BR")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(
                        row.difficulty
                      )}`}
                    >
                      {row.difficulty}/100
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {row.intent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
