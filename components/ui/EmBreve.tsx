export default function EmBreve({
  titulo,
  descricao,
  sprint,
}: {
  titulo: string;
  descricao: string;
  sprint: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-1 text-sm text-slate-500">{descricao}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <span className="text-4xl" aria-hidden>
          🚧
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-800">Em breve</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Esta seção será construída no {sprint}.
        </p>
      </div>
    </div>
  );
}
