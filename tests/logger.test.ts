import { describe, it, expect } from "vitest";
import { sanitizeLogDetails, createAuditLogEntry } from "@/lib/security/logger";

describe("Segurança & Auditoria: Sanitização de Credenciais em Logs (NIST SP 800-92)", () => {
  it("deve redigir chaves sensíveis diretas no objeto", () => {
    const rawDetails = {
      username: "admin",
      password: "MinhaSenhaSuperSecreta123!",
      api_key: "segredo_chave_123",
      token: "jwt_token_exemplo",
      role: "editor",
    };

    const sanitized = sanitizeLogDetails(rawDetails) as Record<string, unknown>;

    expect(sanitized.username).toBe("admin");
    expect(sanitized.role).toBe("editor");
    expect(sanitized.password).toBe("[REDACTED_SECRET]");
    expect(sanitized.api_key).toBe("[REDACTED_SECRET]");
    expect(sanitized.token).toBe("[REDACTED_SECRET]");
  });

  it("deve redigir recursivamente em objetos aninhados e arrays", () => {
    const rawDetails = {
      action: "webhook_dispatch",
      headers: {
        authorization: "Bearer eyJhbGciOi...",
        "Content-Type": "application/json",
      },
      nested: [
        { secret: "segredo-interno-1" },
        { public_info: "ok" },
      ],
    };

    const sanitized = sanitizeLogDetails(rawDetails) as any;

    expect(sanitized.headers.authorization).toBe("[REDACTED_SECRET]");
    expect(sanitized.headers["Content-Type"]).toBe("application/json");
    expect(sanitized.nested[0].secret).toBe("[REDACTED_SECRET]");
    expect(sanitized.nested[1].public_info).toBe("ok");
  });

  it("deve mascarar tokens de IA ou GitHub presentes no meio de strings de texto", () => {
    const logString = "Erro ao conectar com OpenAI usando a chave sk-12345678901234567890abcdef. Repetir.";
    const sanitized = sanitizeLogDetails(logString) as string;

    expect(sanitized).not.toContain("sk-12345678901234567890abcdef");
    expect(sanitized).toContain("[REDACTED_API_KEY]");
  });

  it("deve gerar entrada de log com sanitização aplicada via createAuditLogEntry", () => {
    const entry = createAuditLogEntry(
      "admin@centraleditorial.privado",
      "TEST_ACTION",
      "site",
      "site-123",
      { secret: "chave_insegura", blog_name: "Passa Cumaru" }
    );

    expect(entry.user_email).toBe("admin@centraleditorial.privado");
    expect(entry.action).toBe("TEST_ACTION");
    expect(entry.details.secret).toBe("[REDACTED_SECRET]");
    expect(entry.details.blog_name).toBe("Passa Cumaru");
  });
});
