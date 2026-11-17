import { describe, it, expect } from "vitest";
import { siteSchema, topicSchema, articleSchema, loginSchema } from "@/lib/validations";

describe("Validações de Domínio com Zod", () => {
  describe("siteSchema", () => {
    it("deve validar um site válido com sucesso", () => {
      const valid = {
        name: "Passa Cumaru",
        domain: "passacumaru.com.br",
        platform: "passacumaru_api",
        public_url: "https://www.passacumaru.com.br",
        is_active: true,
      };
      const res = siteSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("deve rejeitar domínio em formato inválido", () => {
      const invalid = {
        name: "Blog Inválido",
        domain: "dominio incorreto",
        platform: "passacumaru_api",
        public_url: "https://exemplo.com",
      };
      const res = siteSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain("Formato de domínio inválido");
      }
    });

    it("deve rejeitar URL pública com formato inválido", () => {
      const invalid = {
        name: "Blog",
        domain: "exemplo.com",
        platform: "github_pr_astro",
        public_url: "url-sem-protocolo",
      };
      const res = siteSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("topicSchema", () => {
    it("deve validar uma pauta válida com valores padrão", () => {
      const valid = {
        site_id: "a1111111-1111-1111-1111-111111111111",
        title: "Pauta de Teste com Título Longo",
        primary_keyword: "concurso cumaru",
      };
      const res = topicSchema.safeParse(valid);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.search_intent).toBe("informational");
        expect(res.data.priority).toBe("medium");
        expect(res.data.status).toBe("planned");
      }
    });

    it("deve rejeitar se site_id não for UUID válido", () => {
      const invalid = {
        site_id: "id-invalido-nao-uuid",
        title: "Pauta Inválida",
        primary_keyword: "teste",
      };
      const res = topicSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("articleSchema", () => {
    it("deve validar slug em formato canônico (kebab-case minúsculo)", () => {
      const valid = {
        site_id: "a1111111-1111-1111-1111-111111111111",
        title: "Artigo de Exemplo Completo",
        slug: "artigo-de-exemplo-completo-2026",
      };
      const res = articleSchema.safeParse(valid);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe("idea"); // default
      }
    });

    it("deve rejeitar slug com letras maiúsculas, espaços ou caracteres especiais", () => {
      const invalid = {
        site_id: "a1111111-1111-1111-1111-111111111111",
        title: "Artigo com Slug Ruim",
        slug: "Slug Com Espaços & Maiúsculas!",
      };
      const res = articleSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain("Slug deve conter apenas");
      }
    });
  });

  describe("loginSchema", () => {
    it("deve validar e-mail e senha com tamanho mínimo", () => {
      const valid = { email: "admin@centraleditorial.privado", password: "senhaSegura123" };
      expect(loginSchema.safeParse(valid).success).toBe(true);

      const invalidEmail = { email: "email_invalido", password: "123456" };
      expect(loginSchema.safeParse(invalidEmail).success).toBe(false);

      const shortPassword = { email: "admin@centraleditorial.privado", password: "123" };
      expect(loginSchema.safeParse(shortPassword).success).toBe(false);
    });
  });
});
