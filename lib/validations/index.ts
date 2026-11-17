import { z } from "zod";

// Schema para Cadastro/Edição de Blogs
export const siteSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres").max(100),
  domain: z
    .string()
    .min(3, "Domínio inválido")
    .max(100)
    .regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i, "Formato de domínio inválido (ex: meublog.com.br)"),
  description: z.string().max(500).optional().nullable(),
  platform: z.enum(["passacumaru_api", "github_pr_astro", "github_pr_next", "github_pr_html"]),
  public_url: z.string().url("A URL pública deve ser válida (ex: https://meublog.com.br)"),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional().nullable(),
});

export type SiteInput = z.infer<typeof siteSchema>;

// Schema para Gestão de Pautas (Topics)
export const topicSchema = z.object({
  site_id: z.string().uuid("ID de site inválido"),
  title: z.string().min(5, "O tema deve ter pelo menos 5 caracteres").max(200),
  primary_keyword: z.string().min(2, "Palavra-chave principal obrigatória").max(100),
  secondary_keywords: z.array(z.string()).default([]),
  theme: z.string().max(100).optional().nullable(),
  search_intent: z.enum(["informational", "commercial", "transactional", "navigational"]).default("informational"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["planned", "in_production", "completed", "canceled"]).default("planned"),
  notes: z.string().max(1000).optional().nullable(),
});

export type TopicInput = z.infer<typeof topicSchema>;

// Schema para Gestão de Artigos
export const articleSchema = z.object({
  site_id: z.string().uuid("ID de site inválido"),
  topic_id: z.string().uuid("ID de pauta inválido").optional().nullable(),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres").max(250),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hifens"),
  primary_keyword: z.string().max(100).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  content_markdown: z.string().optional().nullable(),
  status: z.enum(["idea", "in_production", "reviewing", "approved", "archived"]).default("idea"),
});

export type ArticleInput = z.infer<typeof articleSchema>;

// Schema para Autenticação
export const loginSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
