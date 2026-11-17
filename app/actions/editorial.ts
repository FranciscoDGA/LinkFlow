"use server";

import { revalidatePath } from "next/cache";
import { dataStore } from "@/lib/data/store";
import { siteSchema, topicSchema, articleSchema } from "@/lib/validations";
import { ArticleStatus } from "@/lib/types";

// ========================
// SITES ACTIONS
// ========================
export async function createSiteAction(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    domain: formData.get("domain") as string,
    description: formData.get("description") as string,
    platform: formData.get("platform") as any,
    public_url: formData.get("public_url") as string,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
    notes: formData.get("notes") as string,
  };

  const parsed = siteSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  try {
    await dataStore.createSite(parsed.data);
    revalidatePath("/blogs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao cadastrar blog." };
  }
}

export async function deleteSiteAction(id: string) {
  try {
    await dataStore.deleteSite(id);
    revalidatePath("/blogs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao excluir blog." };
  }
}

// ========================
// TOPICS ACTIONS
// ========================
export async function createTopicAction(formData: FormData) {
  const rawSecondary = formData.get("secondary_keywords") as string;
  const secondaryKeywords = rawSecondary
    ? rawSecondary.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const rawData = {
    site_id: formData.get("site_id") as string,
    title: formData.get("title") as string,
    primary_keyword: formData.get("primary_keyword") as string,
    secondary_keywords: secondaryKeywords,
    theme: formData.get("theme") as string,
    search_intent: (formData.get("search_intent") as any) || "informational",
    priority: (formData.get("priority") as any) || "medium",
    status: (formData.get("status") as any) || "planned",
    notes: formData.get("notes") as string,
  };

  const parsed = topicSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  try {
    await dataStore.createTopic(parsed.data);
    revalidatePath("/pautas");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao cadastrar pauta." };
  }
}

export async function deleteTopicAction(id: string) {
  try {
    await dataStore.deleteTopic(id);
    revalidatePath("/pautas");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao excluir pauta." };
  }
}

// ========================
// ARTICLES ACTIONS
// ========================
export async function createArticleAction(formData: FormData) {
  const rawData = {
    site_id: formData.get("site_id") as string,
    topic_id: (formData.get("topic_id") as string) || null,
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    primary_keyword: formData.get("primary_keyword") as string,
    seo_description: formData.get("seo_description") as string,
    content_markdown: formData.get("content_markdown") as string,
    status: "idea" as const, // Estado inicial estritamente forçado
  };

  const parsed = articleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  try {
    const newArt = await dataStore.createArticle(parsed.data);
    revalidatePath("/artigos");
    revalidatePath("/dashboard");
    return { success: true, articleId: newArt.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao cadastrar artigo." };
  }
}

export async function updateArticleStatusAction(id: string, newStatus: ArticleStatus, reason?: string) {
  try {
    await dataStore.updateArticleStatus(id, newStatus, reason);
    revalidatePath(`/artigos/${id}`);
    revalidatePath("/artigos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao atualizar status." };
  }
}
