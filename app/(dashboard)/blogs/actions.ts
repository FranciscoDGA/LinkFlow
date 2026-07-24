"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BlogFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type CamposBlog = {
  nome: string;
  url: string;
  nicho: string;
  descricao: string | null;
  publico_alvo: string | null;
  dr: number;
  trafego_mensal: number;
  plataforma: string;
  limite_links_mes: number;
};

function normalizarUrl(valor: string): string {
  const v = valor.trim();
  if (!v) return v;
  if (!/^https?:\/\//i.test(v)) return `https://${v}`;
  return v;
}

function parseInteiro(valor: FormDataEntryValue | null, padrao: number): number {
  const n = parseInt(String(valor ?? "").trim(), 10);
  return Number.isFinite(n) ? n : padrao;
}

function validar(formData: FormData): {
  campos?: CamposBlog;
  fieldErrors?: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};

  const nome = String(formData.get("nome") ?? "").trim();
  const urlBruta = String(formData.get("url") ?? "").trim();
  const nicho = String(formData.get("nicho") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const publicoAlvo = String(formData.get("publico_alvo") ?? "").trim();
  const dr = parseInteiro(formData.get("dr"), 0);
  const trafego = parseInteiro(formData.get("trafego_mensal"), 0);
  const plataforma = String(formData.get("plataforma") ?? "nextjs").trim();
  const limite = parseInteiro(formData.get("limite_links_mes"), 4);

  if (!nome) fieldErrors.nome = "Informe o nome do blog.";

  const url = normalizarUrl(urlBruta);
  if (!urlBruta) {
    fieldErrors.url = "Informe a URL do blog.";
  } else {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      fieldErrors.url = "URL inválida.";
    }
  }

  if (!nicho) fieldErrors.nicho = "Informe o nicho.";
  if (dr < 0 || dr > 100) fieldErrors.dr = "O DR deve ficar entre 0 e 100.";
  if (trafego < 0) fieldErrors.trafego_mensal = "O tráfego não pode ser negativo.";
  if (limite < 1) fieldErrors.limite_links_mes = "O limite deve ser ao menos 1.";
  if (!["nextjs", "wordpress", "outro"].includes(plataforma)) {
    fieldErrors.plataforma = "Plataforma inválida.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    campos: {
      nome,
      url,
      nicho,
      descricao: descricao || null,
      publico_alvo: publicoAlvo || null,
      dr,
      trafego_mensal: trafego,
      plataforma,
      limite_links_mes: limite,
    },
  };
}

/**
 * Cria (sem id) ou atualiza (com id) um blog.
 */
export async function salvarBlog(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const { campos, fieldErrors } = validar(formData);

  if (fieldErrors) {
    return { error: "Corrija os campos destacados.", fieldErrors };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  if (id) {
    const { error } = await supabase
      .from("blogs")
      .update(campos!)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "23505") {
        return { error: "Já existe um blog com essa URL." };
      }
      return { error: `Erro ao atualizar: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from("blogs")
      .insert({ ...campos!, user_id: user.id });

    if (error) {
      if (error.code === "23505") {
        return { error: "Já existe um blog com essa URL." };
      }
      return { error: `Erro ao cadastrar: ${error.message}` };
    }
  }

  revalidatePath("/blogs");
  revalidatePath("/");
  redirect("/blogs");
}

/**
 * Remove um blog do usuário.
 */
export async function deletarBlog(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("blogs").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/blogs");
  revalidatePath("/");
  redirect("/blogs");
}
