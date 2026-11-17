export type SitePlatform = "passacumaru_api" | "github_pr_astro" | "github_pr_next" | "github_pr_html";

export interface Site {
  id: string;
  name: string;
  domain: string;
  description?: string | null;
  platform: SitePlatform;
  public_url: string;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type TopicStatus = "planned" | "in_production" | "completed" | "canceled";
export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

export interface Topic {
  id: string;
  site_id: string;
  title: string;
  primary_keyword: string;
  secondary_keywords: string[];
  theme?: string | null;
  search_intent: SearchIntent;
  priority: "low" | "medium" | "high";
  status: TopicStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  site?: {
    name: string;
    domain: string;
  };
}

export type ArticleStatus = "idea" | "in_production" | "reviewing" | "approved" | "archived";

export interface Article {
  id: string;
  site_id: string;
  topic_id?: string | null;
  slug: string;
  title: string;
  primary_keyword?: string | null;
  seo_description?: string | null;
  content_markdown?: string | null;
  status: ArticleStatus;
  current_version: number;
  created_at: string;
  updated_at: string;
  site?: {
    name: string;
    domain: string;
  };
  topic?: {
    title: string;
    primary_keyword: string;
  };
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  excerpt?: string | null;
  content_html: string;
  content_markdown: string;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  content_hash: string;
  created_by: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: "site" | "topic" | "article" | "auth" | "settings";
  entity_id?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  sitesCount: number;
  topicsCount: number;
  articlesInProductionCount: number;
  articlesReviewingCount: number;
  articlesApprovedCount: number;
  publicationsCount: number;
  recentActivities: ActivityLog[];
}
