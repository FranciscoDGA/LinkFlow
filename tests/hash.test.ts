import { describe, it, expect } from "vitest";
import { calculateContentHash, canonicalizeJson } from "@/lib/security/hash";

describe("Segurança & Integridade: Canonicalização RFC 8785 e Hashing SHA-256", () => {
  it("deve ordenar chaves alfabeticamente na canonicalização RFC 8785", () => {
    const objA = { b: 2, a: 1, z: "fim" };
    const objB = { z: "fim", a: 1, b: 2 };

    const canonicalA = canonicalizeJson(objA);
    const canonicalB = canonicalizeJson(objB);

    expect(canonicalA).toBe('{"a":1,"b":2,"z":"fim"}');
    expect(canonicalB).toBe('{"a":1,"b":2,"z":"fim"}');
    expect(canonicalA).toBe(canonicalB);
  });

  it("deve gerar hash determinístico idêntico independente da ordem das propriedades do payload", () => {
    const payload1 = {
      title: "Título de Teste",
      slug: "titulo-de-teste",
      excerpt: "Resumo do artigo",
      content_html: "<p>Conteúdo</p>",
      content_markdown: "# Conteúdo",
      seo_title: "Título SEO",
      seo_description: "Descrição SEO",
      canonical_url: "https://exemplo.com/artigo",
      featured_image_url: "https://exemplo.com/img.jpg",
      featured_image_alt: "Alt text",
      category: "Geral",
      tags: ["tag1", "tag2"],
    };

    const payload2 = {
      tags: ["tag1", "tag2"],
      category: "Geral",
      featured_image_alt: "Alt text",
      featured_image_url: "https://exemplo.com/img.jpg",
      canonical_url: "https://exemplo.com/artigo",
      seo_description: "Descrição SEO",
      seo_title: "Título SEO",
      content_markdown: "# Conteúdo",
      content_html: "<p>Conteúdo</p>",
      excerpt: "Resumo do artigo",
      slug: "titulo-de-teste",
      title: "Título de Teste",
    };

    const hash1 = calculateContentHash(payload1);
    const hash2 = calculateContentHash(payload2);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string
  });

  it("deve produzir um hash completamente diferente se qualquer campo for modificado", () => {
    const basePayload = {
      title: "Artigo Oficial",
      slug: "artigo-oficial",
      excerpt: "Resumo",
      content_html: "<p>Texto</p>",
      content_markdown: "# Texto",
      seo_title: "SEO",
      seo_description: "Meta desc",
      canonical_url: "https://exemplo.com/artigo",
      featured_image_url: "",
      featured_image_alt: "",
      category: "Notícias",
      tags: ["tagA"],
    };

    const modifiedPayload = {
      ...basePayload,
      canonical_url: "https://exemplo.com/artigo-alterado",
    };

    const hashBase = calculateContentHash(basePayload);
    const hashModified = calculateContentHash(modifiedPayload);

    expect(hashBase).not.toBe(hashModified);
  });
});
