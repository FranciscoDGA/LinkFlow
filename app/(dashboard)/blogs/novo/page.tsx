import Link from "next/link";
import BlogForm from "@/components/blogs/BlogForm";

export default function NovoBlogPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/blogs"
          className="text-sm text-brand-600 hover:text-brand-700"
        >
          ← Voltar para blogs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Novo blog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre um blog da sua rede.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <BlogForm />
      </div>
    </div>
  );
}
