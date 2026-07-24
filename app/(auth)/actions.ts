"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed")) {
      return {
        error:
          "E-mail ainda não confirmado. Confirme pelo link enviado ou desative a confirmação no Supabase.",
      };
    }
    if (msg.includes("invalid login credentials")) {
      return { error: "E-mail ou senha inválidos." };
    }
    // Qualquer outro erro: mostra o motivo real para facilitar o diagnóstico.
    return { error: `Erro ao entrar: ${error.message}` };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Se a confirmação de e-mail estiver desativada, a sessão já vem pronta.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    message:
      "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
  };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
