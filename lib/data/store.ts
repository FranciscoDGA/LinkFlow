import { Site, Topic, Article, ArticleVersion, ActivityLog, DashboardStats } from "@/lib/types";
import { calculateContentHash } from "@/lib/security/hash";
import { createAuditLogEntry } from "@/lib/security/logger";

// Armazenamento em memória para ambiente de desenvolvimento local caso Supabase real ainda não esteja plugado
let sitesStore: Site[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    name: "Passa Cumaru",
    domain: "passacumaru.com.br",
    description: "Portal educacional e blog de preparação para concursos municipais em Cumaru do Norte - PA.",
    platform: "passacumaru_api",
    public_url: "https://www.passacumaru.com.br",
    is_active: true,
    notes: "Primeiro blog-piloto com integração via Organic Bridge / Supabase.",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    name: "Prenup Answers",
    domain: "prenupanswers.com",
    description: "Blog de autoridade sobre acordos pré-nupciais e proteção patrimonial.",
    platform: "github_pr_astro",
    public_url: "https://www.prenupanswers.com",
    is_active: true,
    notes: "Site estático desenvolvido em Astro com coleções de conteúdo em Markdown.",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    name: "UtilPro Brasil",
    domain: "utilprobrasil.com.br",
    description: "Guias, ferramentas e tutoriais sobre CLT, IRPF e concursos públicos.",
    platform: "github_pr_next",
    public_url: "https://utilprobrasil.com.br",
    is_active: true,
    notes: "Projeto desenvolvido em Next.js 16 com App Router.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

let topicsStore: Topic[] = [
  {
    id: "t1111111-1111-1111-1111-111111111111",
    site_id: "a1111111-1111-1111-1111-111111111111",
    title: "Concurso Prefeitura de Cumaru do Norte 2026: Edital e Cronograma",
    primary_keyword: "concurso prefeitura de cumaru do norte 2026",
    secondary_keywords: ["edital cumaru", "banca ivin", "vagas professor cumaru"],
    theme: "Concursos Municipais",
    search_intent: "informational",
    priority: "high",
    status: "in_production",
    notes: "Pauta prioritária para atrair tráfego orgânico de candidatos.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "t2222222-2222-2222-2222-222222222222",
    site_id: "b2222222-2222-2222-2222-222222222222",
    title: "How to Protect 401(k) Retirement with a Prenuptial Agreement",
    primary_keyword: "can a prenup protect 401k",
    secondary_keywords: ["erisa spousal waiver", "retirement protection prenup"],
    theme: "Retirement & Risk",
    search_intent: "informational",
    priority: "medium",
    status: "completed",
    notes: "Foco na regra de renúncia do cônjuge sob a lei ERISA.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let articlesStore: Article[] = [
  {
    id: "art-1111-1111-1111-111111111111",
    site_id: "a1111111-1111-1111-1111-111111111111",
    topic_id: "t1111111-1111-1111-1111-111111111111",
    slug: "concurso-cumaru-do-norte-2026-guia-completo",
    title: "Concurso Cumaru do Norte 2026: Guia Completo de Preparação",
    primary_keyword: "concurso prefeitura de cumaru do norte 2026",
    seo_description: "Confira todos os detalhes do concurso da Prefeitura de Cumaru do Norte 2026: cargos, salários e cronograma.",
    content_markdown: "# Concurso Cumaru do Norte 2026\n\nGuia preparatório completo para a banca IVIN.",
    status: "in_production",
    current_version: 1,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "art-2222-2222-2222-222222222222",
    site_id: "b2222222-2222-2222-2222-222222222222",
    topic_id: "t2222222-2222-2222-2222-222222222222",
    slug: "can-a-prenup-protect-401k-retirement",
    title: "Can a Prenup Protect Your 401(k) and Retirement? The Spousal Waiver Rule",
    primary_keyword: "can a prenup protect 401k",
    seo_description: "Can a prenup protect your 401(k), IRA, and pension? Discover how ERISA laws impact prenups.",
    content_markdown: "# Protecting Retirement with a Prenup\n\nA prenup can protect retirement accounts under specific conditions.",
    status: "approved",
    current_version: 2,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let versionsStore: ArticleVersion[] = [
  {
    id: "ver-1111-1111-1111-111111111111",
    article_id: "art-2222-2222-2222-222222222222",
    version_number: 1,
    title: "Can a Prenup Protect Your 401(k) and Retirement?",
    excerpt: "Initial draft covering basics of 401k protection.",
    content_html: "<p>Initial draft</p>",
    content_markdown: "# Initial Draft",
    seo_title: "Prenup 401k Protection",
    seo_description: "Initial description",
    canonical_url: "https://www.prenupanswers.com/guides/can-a-prenup-protect-401k",
    content_hash: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    created_by: "admin@centraleditorial.privado",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "ver-2222-2222-2222-222222222222",
    article_id: "art-2222-2222-2222-222222222222",
    version_number: 2,
    title: "Can a Prenup Protect Your 401(k) and Retirement? The Spousal Waiver Rule",
    excerpt: "Updated version with ERISA federal laws and spousal waiver requirement.",
    content_html: "<p>Updated content with legal review.</p>",
    content_markdown: "# Protecting Retirement with a Prenup",
    seo_title: "Can a Prenup Protect Your 401(k) and Retirement? The Spousal Waiver Rule",
    seo_description: "Can a prenup protect your 401(k), IRA, and pension? Discover how ERISA laws impact prenups.",
    canonical_url: "https://www.prenupanswers.com/guides/can-a-prenup-protect-401k-retirement",
    content_hash: "f6e5d4c3b2a10987654321fedcba0987654321fedcba0987654321fedcba0987",
    created_by: "admin@centraleditorial.privado",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let activityLogsStore: ActivityLog[] = [
  {
    id: "log-1",
    user_email: "admin@centraleditorial.privado",
    action: "CADASTRO_BLOG",
    entity_type: "site",
    entity_id: "a1111111-1111-1111-1111-111111111111",
    details: { name: "Passa Cumaru", domain: "passacumaru.com.br" },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "log-2",
    user_email: "admin@centraleditorial.privado",
    action: "CADASTRO_PAUTA",
    entity_type: "topic",
    entity_id: "t1111111-1111-1111-1111-111111111111",
    details: { title: "Concurso Prefeitura de Cumaru do Norte 2026" },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "log-3",
    user_email: "admin@centraleditorial.privado",
    action: "APROVACAO_ARTIGO",
    entity_type: "article",
    entity_id: "art-2222-2222-2222-222222222222",
    details: { slug: "can-a-prenup-protect-401k-retirement", version: 2 },
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const dataStore = {
  // SITES
  getSites: async (): Promise<Site[]> => {
    return [...sitesStore];
  },

  getSiteById: async (id: string): Promise<Site | undefined> => {
    return sitesStore.find((s) => s.id === id);
  },

  createSite: async (data: Omit<Site, "id" | "created_at" | "updated_at">): Promise<Site> => {
    const newSite: Site = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sitesStore.unshift(newSite);
    dataStore.logActivity("admin@centraleditorial.privado", "CADASTRO_BLOG", "site", newSite.id, {
      name: newSite.name,
      domain: newSite.domain,
    });
    return newSite;
  },

  updateSite: async (id: string, data: Partial<Omit<Site, "id" | "created_at">>): Promise<Site | null> => {
    const index = sitesStore.findIndex((s) => s.id === id);
    if (index === -1) return null;
    sitesStore[index] = {
      ...sitesStore[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    dataStore.logActivity("admin@centraleditorial.privado", "ALTERACAO_BLOG", "site", id, data);
    return sitesStore[index];
  },

  deleteSite: async (id: string): Promise<boolean> => {
    const hasTopics = topicsStore.some((t) => t.site_id === id);
    const hasArticles = articlesStore.some((a) => a.site_id === id);
    if (hasTopics || hasArticles) {
      throw new Error("Não é permitido excluir blogs que possuem pautas ou artigos vinculados (Integridade Referencial).");
    }
    const initialLen = sitesStore.length;
    sitesStore = sitesStore.filter((s) => s.id !== id);
    if (sitesStore.length < initialLen) {
      dataStore.logActivity("admin@centraleditorial.privado", "EXCLUSAO_BLOG", "site", id, {});
      return true;
    }
    return false;
  },

  // TOPICS
  getTopics: async (): Promise<Topic[]> => {
    return topicsStore.map((t) => {
      const site = sitesStore.find((s) => s.id === t.site_id);
      return {
        ...t,
        site: site ? { name: site.name, domain: site.domain } : undefined,
      };
    });
  },

  createTopic: async (data: Omit<Topic, "id" | "created_at" | "updated_at">): Promise<Topic> => {
    const site = sitesStore.find((s) => s.id === data.site_id);
    if (!site || !site.is_active) {
      throw new Error("O site informado não existe ou está inativo.");
    }
    const newTopic: Topic = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    topicsStore.unshift(newTopic);
    dataStore.logActivity("admin@centraleditorial.privado", "CADASTRO_PAUTA", "topic", newTopic.id, {
      title: newTopic.title,
      site_id: newTopic.site_id,
    });
    return newTopic;
  },

  updateTopic: async (id: string, data: Partial<Omit<Topic, "id" | "created_at">>): Promise<Topic | null> => {
    const index = topicsStore.findIndex((t) => t.id === id);
    if (index === -1) return null;
    topicsStore[index] = {
      ...topicsStore[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    dataStore.logActivity("admin@centraleditorial.privado", "ALTERACAO_PAUTA", "topic", id, data);
    return topicsStore[index];
  },

  deleteTopic: async (id: string): Promise<boolean> => {
    const hasArticles = articlesStore.some((a) => a.topic_id === id);
    if (hasArticles) {
      throw new Error("Não é permitido excluir pautas vinculadas a artigos existentes.");
    }
    const initialLen = topicsStore.length;
    topicsStore = topicsStore.filter((t) => t.id !== id);
    if (topicsStore.length < initialLen) {
      dataStore.logActivity("admin@centraleditorial.privado", "EXCLUSAO_PAUTA", "topic", id, {});
      return true;
    }
    return false;
  },

  // ARTICLES
  getArticles: async (): Promise<Article[]> => {
    return articlesStore.map((a) => {
      const site = sitesStore.find((s) => s.id === a.site_id);
      const topic = topicsStore.find((t) => t.id === a.topic_id);
      return {
        ...a,
        site: site ? { name: site.name, domain: site.domain } : undefined,
        topic: topic ? { title: topic.title, primary_keyword: topic.primary_keyword } : undefined,
      };
    });
  },

  getArticleById: async (id: string): Promise<Article | undefined> => {
    const a = articlesStore.find((art) => art.id === id);
    if (!a) return undefined;
    const site = sitesStore.find((s) => s.id === a.site_id);
    const topic = topicsStore.find((t) => t.id === a.topic_id);
    return {
      ...a,
      site: site ? { name: site.name, domain: site.domain } : undefined,
      topic: topic ? { title: topic.title, primary_keyword: topic.primary_keyword } : undefined,
    };
  },

  createArticle: async (data: {
    site_id: string;
    topic_id?: string | null;
    slug: string;
    title: string;
    primary_keyword?: string | null;
    seo_description?: string | null;
    content_markdown?: string | null;
  }): Promise<Article> => {
    const site = sitesStore.find((s) => s.id === data.site_id);
    if (!site || !site.is_active) {
      throw new Error("Site inexistente ou inativo. Criação recusada.");
    }

    if (data.topic_id) {
      const topic = topicsStore.find((t) => t.id === data.topic_id && t.site_id === data.site_id);
      if (!topic) {
        throw new Error("O tópico informado não pertence ao site especificado.");
      }
    }

    // Valida unicidade de slug por site
    const slugExists = articlesStore.some((a) => a.site_id === data.site_id && a.slug === data.slug);
    if (slugExists) {
      throw new Error("Já existe um artigo com este slug no blog informado.");
    }

    const newArticle: Article = {
      ...data,
      id: crypto.randomUUID(),
      status: "idea", // Estado inicial estritamente forçado
      current_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    articlesStore.unshift(newArticle);

    // Cria a primeira versão no histórico
    const hash = calculateContentHash({
      title: newArticle.title,
      slug: newArticle.slug,
      excerpt: newArticle.seo_description || "",
      content_html: `<p>${newArticle.content_markdown || ""}</p>`,
      content_markdown: newArticle.content_markdown || "",
      seo_title: newArticle.title,
      seo_description: newArticle.seo_description || "",
      canonical_url: `${site.public_url}/artigo/${newArticle.slug}`,
      featured_image_url: "",
      featured_image_alt: "",
      category: "Geral",
      tags: [],
    });

    versionsStore.unshift({
      id: crypto.randomUUID(),
      article_id: newArticle.id,
      version_number: 1,
      title: newArticle.title,
      excerpt: newArticle.seo_description || "",
      content_html: `<p>${newArticle.content_markdown || ""}</p>`,
      content_markdown: newArticle.content_markdown || "",
      seo_title: newArticle.title,
      seo_description: newArticle.seo_description || "",
      canonical_url: `${site.public_url}/artigo/${newArticle.slug}`,
      content_hash: hash,
      created_by: "admin@centraleditorial.privado",
      created_at: new Date().toISOString(),
    });

    dataStore.logActivity("admin@centraleditorial.privado", "CRIACAO_ARTIGO", "article", newArticle.id, {
      title: newArticle.title,
      slug: newArticle.slug,
      site_id: newArticle.site_id,
    });

    return newArticle;
  },

  updateArticleStatus: async (
    id: string,
    newStatus: Article["status"],
    reason?: string
  ): Promise<Article | null> => {
    const article = articlesStore.find((a) => a.id === id);
    if (!article) return null;

    const oldStatus = article.status;
    article.status = newStatus;
    article.updated_at = new Date().toISOString();

    dataStore.logActivity("admin@centraleditorial.privado", "ALTERACAO_STATUS_ARTIGO", "article", id, {
      oldStatus,
      newStatus,
      reason,
    });

    return article;
  },

  getArticleVersions: async (articleId: string): Promise<ArticleVersion[]> => {
    return versionsStore
      .filter((v) => v.article_id === articleId)
      .sort((a, b) => b.version_number - a.version_number);
  },

  // LOGS & STATS
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    return [...activityLogsStore].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  logActivity: (
    userEmail: string,
    action: string,
    entityType: ActivityLog["entity_type"],
    entityId?: string | null,
    details: Record<string, unknown> = {}
  ) => {
    const entry = createAuditLogEntry(userEmail, action, entityType, entityId, details);
    activityLogsStore.unshift({
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    });
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const sites = await dataStore.getSites();
    const topics = await dataStore.getTopics();
    const articles = await dataStore.getArticles();
    const logs = await dataStore.getActivityLogs();

    return {
      sitesCount: sites.filter((s) => s.is_active).length,
      topicsCount: topics.length,
      articlesInProductionCount: articles.filter((a) => a.status === "in_production").length,
      articlesReviewingCount: articles.filter((a) => a.status === "reviewing").length,
      articlesApprovedCount: articles.filter((a) => a.status === "approved").length,
      publicationsCount: articles.filter((a) => a.status === "approved").length, // Publicações homologadas
      recentActivities: logs.slice(0, 10),
    };
  },
};
