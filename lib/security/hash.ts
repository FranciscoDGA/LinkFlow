import crypto from "crypto";

export interface CanonicalArticlePayload {
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_markdown: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  featured_image_url: string;
  featured_image_alt: string;
  category: string;
  tags: string[];
  schema_json?: Record<string, unknown>;
  faq_json?: Record<string, unknown>;
}

/**
 * Serializa de forma determinística segundo RFC 8785 (JSON Canonicalization Scheme).
 * Ordena chaves alfabeticamente e remove espaçamentos inúteis.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJson).join(",") + "]";
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ":" + canonicalizeJson(val);
  });

  return "{" + pairs.join(",") + "}";
}

/**
 * Calcula o hash SHA-256 canônico sobre a versão editorial.
 */
export function calculateContentHash(payload: CanonicalArticlePayload): string {
  // Ordena tags para garantir determinismo
  const sortedTags = [...(payload.tags || [])].sort();

  const canonicalPayload = {
    canonical_url: (payload.canonical_url || "").trim().toLowerCase(),
    category: (payload.category || "").trim(),
    content_html: payload.content_html || "",
    content_markdown: payload.content_markdown || "",
    excerpt: (payload.excerpt || "").trim(),
    faq_json: payload.faq_json || {},
    featured_image_alt: (payload.featured_image_alt || "").trim(),
    featured_image_url: (payload.featured_image_url || "").trim(),
    schema_json: payload.schema_json || {},
    seo_description: (payload.seo_description || "").trim(),
    seo_title: (payload.seo_title || "").trim(),
    slug: (payload.slug || "").trim().toLowerCase(),
    tags: sortedTags,
    title: (payload.title || "").trim(),
  };

  const canonicalString = canonicalizeJson(canonicalPayload);
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex");
}
