"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login, type AuthState } from "../actions";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">LinkFlow</h1>
          <p className="mt-1 text-sm text-slate-500">
            Orquestração de backlinks internos
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Entrar</h2>

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
