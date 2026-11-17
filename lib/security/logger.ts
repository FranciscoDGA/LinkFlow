import { ActivityLog } from "@/lib/types";

const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "apikey",
  "api_key",
  "private_key",
  "access_token",
  "refresh_token",
  "x-signature",
  "bearer",
]);

/**
 * Sanitiza recursivamente objetos e strings para impedir vazamento de credenciais nos logs.
 */
export function sanitizeLogDetails(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    // Redigir possíveis padrões de tokens conhecidos
    return input.replace(/sk-[a-zA-Z0-9_\-]{20,}/g, "[REDACTED_API_KEY]")
                .replace(/ghp_[a-zA-Z0-9]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
                .replace(/Bearer\s+[a-zA-Z0-9._\-]+/gi, "Bearer [REDACTED_TOKEN]");
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeLogDetails(item));
  }

  if (typeof input === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitizedObj[key] = "[REDACTED_SECRET]";
      } else {
        sanitizedObj[key] = sanitizeLogDetails(value);
      }
    }
    return sanitizedObj;
  }

  return input;
}

export function createAuditLogEntry(
  userEmail: string,
  action: string,
  entityType: ActivityLog["entity_type"],
  entityId?: string | null,
  details: Record<string, unknown> = {}
): Omit<ActivityLog, "id" | "created_at"> {
  return {
    user_email: userEmail,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: sanitizeLogDetails(details) as Record<string, unknown>,
  };
}
