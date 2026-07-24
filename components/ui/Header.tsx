import { logout } from "@/app/(auth)/actions";

export default function Header({ email }: { email?: string | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="md:hidden">
        <span className="text-lg font-bold text-brand-700">LinkFlow</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {email && (
          <span className="hidden text-sm text-slate-500 sm:inline">
            {email}
          </span>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
