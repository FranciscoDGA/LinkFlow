"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RelResult = { ok: boolean; error?: string };

/**
 * Ativa (ou atualiza a relevância de) um relacionamento origem → destino.
 * Faz upsert respeitando a restrição única (blog_origem_id, blog_destino_id).
 */
export async function ativarRelacionamento(
  origemId: string,
  destinoId: string,
  relevancia: number
): Promise<RelResult> {
  if (!origemId || !destinoId) {
    return { ok: false, error: "Blogs inválidos." };
  }
  if (origemId === destinoId) {
    return { ok: false, error: "Um blog não pode se relacionar consigo mesmo." };
  }

  const rel = Math.min(10, Math.max(1, Math.round(relevancia) || 5));

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase.from("relacionamentos").upsert(
    {
      user_id: user.id,
      blog_origem_id: origemId,
      blog_destino_id: destinoId,
      relevancia: rel,
      ativo: true,
    },
    { onConflict: "blog_origem_id,blog_destino_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/relacionamentos");
  return { ok: true };
}

/**
 * Remove um relacionamento origem → destino.
 */
export async function desativarRelacionamento(
  origemId: string,
  destinoId: string
): Promise<RelResult> {
  if (!origemId || !destinoId) {
    return { ok: false, error: "Blogs inválidos." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("relacionamentos")
    .delete()
    .eq("blog_origem_id", origemId)
    .eq("blog_destino_id", destinoId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/relacionamentos");
  return { ok: true };
}
