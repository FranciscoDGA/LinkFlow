import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Página temporária de diagnóstico de configuração do Supabase.
 * Acesse em /diagnostico. NÃO vaza segredos: mostra apenas prefixos e
 * tamanhos das chaves. Remover após resolver o problema de login.
 */
export default async function DiagnosticoPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anthropic = process.env.ANTHROPIC_API_KEY ?? "";

  function classificaChave(v: string): string {
    if (!v) return "AUSENTE";
    if (v.startsWith("eyJ")) return "legacy JWT (eyJ...) ✅";
    if (v.startsWith("sb_publishable_")) return "nova publishable (sb_publishable_) ⚠️";
    if (v.startsWith("sb_secret_")) return "nova secret (sb_secret_) ⚠️";
    return "formato desconhecido ⚠️";
  }

  // Teste de conexão: tenta um login proposital com credencial falsa.
  // O ERRO retornado revela se a chave/URL estão corretas.
  let testeAuth = "não executado";
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: "diagnostico-teste@example.com",
      password: "senha-invalida-de-proposito-123",
    });
    testeAuth = error ? error.message : "sem erro (inesperado)";
  } catch (e) {
    testeAuth = `EXCEÇÃO: ${e instanceof Error ? e.message : String(e)}`;
  }

  const linha = "border-b border-slate-200 py-3";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Diagnóstico LinkFlow</h1>
      <p className="mt-1 text-sm text-slate-500">
        Verificação de configuração do Supabase. (Página temporária.)
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <div className={linha}>
          <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
          <div className="mt-1 break-all font-mono text-slate-700">
            {url || "AUSENTE ❌"}
          </div>
        </div>

        <div className={linha}>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
          <div className="mt-1 font-mono text-slate-700">
            Tipo: {classificaChave(anon)}
            <br />
            Início: {anon ? anon.slice(0, 12) + "…" : "—"} (tamanho: {anon.length})
          </div>
        </div>

        <div className={linha}>
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong>
          <div className="mt-1 font-mono text-slate-700">
            Tipo: {classificaChave(service)} (tamanho: {service.length})
          </div>
        </div>

        <div className={linha}>
          <strong>ANTHROPIC_API_KEY</strong>
          <div className="mt-1 font-mono text-slate-700">
            {anthropic ? "definida ✅" : "ausente (ok por enquanto)"}
          </div>
        </div>

        <div className="pt-3">
          <strong>Teste de login (credencial falsa de propósito)</strong>
          <div className="mt-1 rounded-lg bg-slate-50 p-3 font-mono text-slate-800">
            {testeAuth}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <code>Invalid login credentials</code> → chave e URL{" "}
              <strong>corretas</strong>. O problema de login é senha/usuário.
            </li>
            <li>
              <code>Invalid API key</code> → a{" "}
              <strong>anon key está errada</strong> (troque pela legacy eyJ…).
            </li>
            <li>
              <code>EXCEÇÃO / fetch failed</code> → a{" "}
              <strong>URL está errada</strong>.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
