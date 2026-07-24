"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CadenciaWidget() {
  const [dados, setDados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const agora = new Date();
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();

      const { data: cadenciaData } = await supabase
        .from("cadencia")
        .select("*, blog_destino_id")
        .eq("user_id", user.id)
        .eq("mes", mesAtual)
        .eq("ano", anoAtual);

      const { data: blogsData } = await supabase
        .from("blogs")
        .select("id, nome")
        .eq("user_id", user.id);

      const blogs = new Map((blogsData || []).map((b: any) => [b.id, b.nome]));

      const dadosFormatados = (cadenciaData || [])
        .map((c: any) => ({
          id: c.id,
          blogId: c.blog_destino_id,
          blogNome: blogs.get(c.blog_destino_id) || "—",
          recebidos: c.links_recebidos,
          limite: c.limite_mensal,
          porcentagem: Math.round(
            (c.links_recebidos / c.limite_mensal) * 100
          ),
          atingiuLimite: c.links_recebidos >= c.limite_mensal,
        }))
        .sort((a, b) => b.porcentagem - a.porcentagem);

      setDados(dadosFormatados);
      setCarregando(false);
    };

    carregar();
  }, []);

  if (carregando) {
    return <div className="text-sm text-slate-600">Carregando...</div>;
  }

  if (dados.length === 0) {
    return (
      <div className="text-sm text-slate-600">
        Nenhum blog com cadência no mês atual.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dados.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg border p-3 ${
            item.atingiuLimite
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{item.blogNome}</p>
              <p className="text-xs text-slate-600">
                {item.recebidos}/{item.limite} links
              </p>
            </div>
            <span
              className={`text-sm font-bold ${
                item.atingiuLimite
                  ? "text-red-600"
                  : item.porcentagem > 75
                  ? "text-amber-600"
                  : "text-slate-600"
              }`}
            >
              {item.porcentagem}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all ${
                item.atingiuLimite
                  ? "bg-red-500"
                  : item.porcentagem > 75
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(item.porcentagem, 100)}%` }}
            />
          </div>
          {item.atingiuLimite && (
            <p className="mt-2 text-xs font-medium text-red-700">
              ⚠️ Limite mensal atingido
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
