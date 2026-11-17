export const dynamic = "force-dynamic";

export default function ConfiguracoesPage() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"));
  const hasSupabaseKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Configurações & Adaptadores do Sistema
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Visão geral da arquitetura modular, adaptadores de IA, integrações de publicação e segurança.
        </p>
      </div>

      {/* Persistence & Database Mode */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hasSupabaseUrl && hasSupabaseKey ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Camada de Persistência Atual
              </h2>
              <p className="text-xs text-zinc-400">
                {hasSupabaseUrl && hasSupabaseKey
                  ? "Conectado a Instância Supabase PostgreSQL em Produção"
                  : "Modo Local Isolado (In-Memory Data Store com Fallback Ativo)"}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono">
            {hasSupabaseUrl && hasSupabaseKey ? "SUPABASE_POSTGRES" : "LOCAL_ISOLATED_DEV"}
          </span>
        </div>

        <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
          <p>
            <span className="text-zinc-200 font-medium">Isolamento Garantido:</span> O sistema opera de forma autônoma sem requisições a bancos externos até que as variáveis reais no arquivo <code className="text-blue-400">.env.local</code> sejam ativadas pelo administrador.
          </p>
          <p>
            O script DDL pronto para execução encontra-se em <code className="text-zinc-300">supabase/migrations/001_initial_schema.sql</code>.
          </p>
        </div>
      </div>

      {/* AI Text Adapters Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Adaptadores de IA para Redação (Text Providers)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Anthropic Claude</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Recomendado</span>
            </div>
            <p className="text-xs text-zinc-400">
              Modelo Claude 3.7 Sonnet via API oficial. Otimizado para geração de conteúdo editorial longo, fluidez e aderência semântica.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">ClaudeTextAdapter</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Google Gemini</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Plug & Play</span>
            </div>
            <p className="text-xs text-zinc-400">
              Modelo Gemini 2.5 Flash / Pro. Alta velocidade, análise de contexto amplo e custo-benefício para pautas em escala.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">GeminiTextAdapter</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">OpenAI GPT-4o</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Plug & Play</span>
            </div>
            <p className="text-xs text-zinc-400">
              Modelo GPT-4o para redação e estruturação de tabelas, FAQ e resumos executivos com saída JSON canônica.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">OpenAITextAdapter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Adapters Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Adaptadores de Geração de Imagens & Capas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Recraft V3</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Recomendado</span>
            </div>
            <p className="text-xs text-zinc-400">
              Renderização de capas em 16:9 com tipografia integrada precisa e estilos vetoriais ou realistas.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">RecraftImageAdapter</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Ideogram 2.0</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Plug & Play</span>
            </div>
            <p className="text-xs text-zinc-400">
              Excelente fidelidade em renderização de textos e títulos nas imagens de capa para blogs de autoridade.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">IdeogramImageAdapter</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">DALL-E 3</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Plug & Play</span>
            </div>
            <p className="text-xs text-zinc-400">
              Geração de ilustrações conceituais e infográficos temáticos integrados ao fluxo de publicação.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
              Adapter: <span className="text-zinc-400">DalleImageAdapter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connectors & Deployment Channels */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Canais de Publicação Suportados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              API Organic Bridge (PassaCumaru)
            </div>
            <p className="text-zinc-400">
              Ingestão assíncrona forçando rascunho (<code className="text-zinc-300">draft</code>), token JWT administrativo do Supabase e validação estrita de integridade via content_hash SHA-256.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              GitHub Branch + Pull Request (Prenup / UtilPro)
            </div>
            <p className="text-zinc-400">
              Publicação segura em blogs estáticos (Astro / Next.js) via criação de branches isoladas (<code className="text-zinc-300">post/slug</code>) e PRs automáticos sem commit direto na main.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
