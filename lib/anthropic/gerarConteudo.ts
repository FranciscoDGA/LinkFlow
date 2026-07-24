import Anthropic from "@anthropic-ai/sdk";

/**
 * Gera conteúdo de texto a partir de um prompt.
 *
 * Provedor escolhido por variável de ambiente:
 * - Se OPENROUTER_API_KEY estiver definida → usa a OpenRouter
 *   (API compatível com OpenAI). Modelo configurável via OPENROUTER_MODEL
 *   (padrão: anthropic/claude-3.5-sonnet).
 * - Caso contrário → usa a Anthropic API direta (ANTHROPIC_API_KEY),
 *   modelo claude-sonnet-4-6.
 */
export async function gerarConteudoComIA(
  prompt: string,
  maxTokens = 8000
): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (openrouterKey) {
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        // Identificação recomendada pela OpenRouter (opcional)
        "HTTP-Referer": "https://linkflow.app",
        "X-Title": "LinkFlow",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const detalhe = await resp.text().catch(() => "");
      throw new Error(`OpenRouter ${resp.status}: ${detalhe.slice(0, 300)}`);
    }

    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }

  // Fallback: Anthropic direta
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0]?.type === "text" ? response.content[0].text : "";
}
