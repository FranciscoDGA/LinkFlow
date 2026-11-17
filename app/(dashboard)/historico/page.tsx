import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

function getActionColor(action: string) {
  if (action.includes("EXCLUSAO")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (action.includes("APROVACAO")) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (action.includes("CRIACAO") || action.includes("CADASTRO")) {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

export default async function HistoricoPage() {
  const logs = await dataStore.getActivityLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Trilha de Auditoria & Histórico de Atividades
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Registro cronológico imutável de todas as ações administrativas, alterações de status e integrações editoriais.
        </p>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-semibold text-zinc-200">Higienização Estrita de Credenciais Ativa: </span>
          Quaisquer tokens, senhas, chaves de API e segredos são recursivamente expurgados antes da persistência no log (NIST SP 800-92).
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Logs Registrados ({logs.length})
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Último evento: {logs[0] ? new Date(logs[0].created_at).toLocaleString("pt-BR") : "Nenhum"}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            Nenhum evento registrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Data / Hora</th>
                  <th className="py-3 px-4 font-medium">Usuário</th>
                  <th className="py-3 px-4 font-medium">Ação</th>
                  <th className="py-3 px-4 font-medium">Entidade</th>
                  <th className="py-3 px-4 font-medium">Detalhes do Evento (Sanitizados)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono text-zinc-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-zinc-300 max-w-xs truncate">
                      {log.user_email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs text-zinc-400 uppercase font-mono">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[120px]">
                          {log.entity_id}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-zinc-400 font-mono max-w-md">
                      <pre className="bg-zinc-950 p-2 rounded border border-zinc-800/60 overflow-x-auto max-h-24">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
