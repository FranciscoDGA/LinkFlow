"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  construirPromptGerador,
  validarHtmlGerado,
  limparHtml,
} from "@/lib/anthropic/prompts/gerar-artigo";
import { Blog, Relacionamento, AnchorText, Cadencia } from "@/lib/types";

export type GeracaoArtigoState = {
  success?: boolean;
  error?: string;
  artigoId?: string;
};

/**
 * Busca os blogs de DESTINO disponíveis para o usuário.
 */
export async function buscarBlogsDestino(): Promise<Blog[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return (data as Blog[]) || [];
}

/**
 * Busca os blogs de ORIGEM que têm relacionamento ativo com o blog_destino.
 */
export async function buscarBlogsOrigemPorDestino(
  blogDestinoId: string
): Promise<Blog[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Busca os IDs dos blogs de origem
  const { data: relacionamentos } = await supabase
    .from("relacionamentos")
    .select("blog_origem_id")
    .eq("user_id", user.id)
    .eq("blog_destino_id", blogDestinoId)
    .eq("ativo", true);

  if (!relacionamentos || relacionamentos.length === 0) return [];

  const idsOrigem = relacionamentos.map((r: any) => r.blog_origem_id);

  // Busca os dados dos blogs de origem
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .in("id", idsOrigem)
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return (data as Blog[]) || [];
}

/**
 * Busca anchor texts sugeridos (menos usados recentemente) para o blog destino.
 */
export async function buscarAnchorTextsSugeridos(
  blogDestinoId: string
): Promise<AnchorText[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("anchor_texts")
    .select("*")
    .eq("user_id", user.id)
    .eq("blog_destino_id", blogDestinoId)
    .order("ultimo_uso", { ascending: true })
    .order("vezes_usado", { ascending: true })
    .limit(5);

  return (data as AnchorText[]) || [];
}

/**
 * Verifica se o blog destino atingiu o limite de links do mês.
 */
async function verificarLimiteMensal(
  blogDestinoId: string,
  userId: string
): Promise<{ atingiuLimite: boolean; linksRecebidos: number; limite: number }> {
  const supabase = createClient();

  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  const { data } = await supabase
    .from("cadencia")
    .select("links_recebidos, limite_mensal")
    .eq("user_id", userId)
    .eq("blog_destino_id", blogDestinoId)
    .eq("mes", mes)
    .eq("ano", ano)
    .single();

  if (!data) {
    return { atingiuLimite: false, linksRecebidos: 0, limite: 4 };
  }

  const atingiu = data.links_recebidos >= data.limite_mensal;
  return {
    atingiuLimite: atingiu,
    linksRecebidos: data.links_recebidos,
    limite: data.limite_mensal,
  };
}

/**
 * Atualiza a cadência incrementando os links_recebidos do mês.
 */
async function atualizarCadencia(
  blogDestinoId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  // Tenta atualizar ou inserir
  const { data: existente } = await supabase
    .from("cadencia")
    .select("id, links_recebidos")
    .eq("user_id", userId)
    .eq("blog_destino_id", blogDestinoId)
    .eq("mes", mes)
    .eq("ano", ano)
    .single();

  if (existente) {
    // Incrementa o valor existente
    await supabase
      .from("cadencia")
      .update({ links_recebidos: existente.links_recebidos + 1 })
      .eq("id", existente.id);
  } else {
    // Cria novo registro de cadência
    await supabase.from("cadencia").insert({
      user_id: userId,
      blog_destino_id: blogDestinoId,
      mes,
      ano,
      links_recebidos: 1,
      limite_mensal: 4,
    });
  }
}

/**
 * Gera um artigo com IA usando Anthropic API.
 * Valida limite mensal, gera conteúdo e salva nas tabelas.
 */
export async function gerarArtigoComIa(
  _prev: GeracaoArtigoState,
  formData: FormData
): Promise<GeracaoArtigoState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // Lê dados do formulário
  const blogDestinoId = String(formData.get("blog_destino_id") ?? "").trim();
  const blogOrigemId = String(formData.get("blog_origem_id") ?? "").trim();
  const palavraChave = String(formData.get("palavra_chave") ?? "").trim();
  const anchorText = String(formData.get("anchor_text") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();

  // Validação básica
  if (!blogDestinoId) return { error: "Selecione um blog de destino." };
  if (!blogOrigemId) return { error: "Selecione um blog de origem." };
  if (!palavraChave) return { error: "Informe a palavra-chave do artigo." };
  if (!anchorText) return { error: "Selecione um anchor text." };

  // Busca os dados dos blogs
  const { data: blogDestino } = await supabase
    .from("blogs")
    .select("nome, nicho, url")
    .eq("id", blogDestinoId)
    .single();

  const { data: blogOrigem } = await supabase
    .from("blogs")
    .select("nome, url")
    .eq("id", blogOrigemId)
    .single();

  if (!blogDestino || !blogOrigem) {
    return { error: "Blog não encontrado." };
  }

  // Verifica limite mensal
  const { atingiuLimite, linksRecebidos, limite } =
    await verificarLimiteMensal(blogDestinoId, user.id);

  if (atingiuLimite) {
    return {
      error: `Blog destino atingiu limite mensal (${linksRecebidos}/${limite} links).`,
    };
  }

  // Gera o artigo com Anthropic
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = construirPromptGerador({
    palavraChave,
    anchorText,
    urlDestino: blogDestino.url,
    nichoDestino: blogDestino.nicho,
    blogDestino: blogDestino.nome,
    tituloSugerido: titulo,
  });

  let conteudoHtml: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    conteudoHtml = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Erro Anthropic API:", err);
    return {
      error: `Erro ao gerar artigo: ${err instanceof Error ? err.message : "Desconhecido"}`,
    };
  }

  // Limpa e valida o HTML
  conteudoHtml = limparHtml(conteudoHtml);
  const validacao = validarHtmlGerado(conteudoHtml);

  if (!validacao.valido) {
    return {
      error: `Artigo inválido: ${validacao.erros.join(", ")}`,
    };
  }

  // Salva na tabela artigos
  const { data: artigo, error: erroArtigo } = await supabase
    .from("artigos")
    .insert({
      user_id: user.id,
      blog_origem_id: blogOrigemId,
      blog_destino_id: blogDestinoId,
      titulo: titulo || palavraChave,
      conteudo: conteudoHtml,
      anchor_text: anchorText,
      palavra_chave: palavraChave,
      status: "rascunho",
    })
    .select("id")
    .single();

  if (erroArtigo || !artigo) {
    return { error: `Erro ao salvar artigo: ${erroArtigo?.message || "Desconhecido"}` };
  }

  // Registra o anchor text na tabela anchor_texts
  const { data: anchorExistente } = await supabase
    .from("anchor_texts")
    .select("id, vezes_usado")
    .eq("user_id", user.id)
    .eq("blog_destino_id", blogDestinoId)
    .eq("texto", anchorText)
    .single();

  if (anchorExistente) {
    await supabase
      .from("anchor_texts")
      .update({
        vezes_usado: anchorExistente.vezes_usado + 1,
        ultimo_uso: new Date().toISOString(),
      })
      .eq("id", anchorExistente.id);
  } else {
    await supabase.from("anchor_texts").insert({
      user_id: user.id,
      blog_destino_id: blogDestinoId,
      texto: anchorText,
      vezes_usado: 1,
      ultimo_uso: new Date().toISOString(),
    });
  }

  // Atualiza a cadência
  await atualizarCadencia(blogDestinoId, user.id);

  revalidatePath("/artigos");
  return {
    success: true,
    artigoId: artigo.id,
  };
}
