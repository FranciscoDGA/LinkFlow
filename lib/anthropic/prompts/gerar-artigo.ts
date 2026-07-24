/**
 * Sistema de prompts para geração de artigos com IA usando Anthropic API.
 * Garante que o link seja inserido naturalmente no corpo do artigo.
 */

export interface GeradorArtigoInput {
  palavraChave: string;
  anchorText: string;
  urlDestino: string;
  nichoDestino: string;
  blogDestino: string;
  tituloSugerido?: string;
}

/**
 * Constrói o prompt para geração de artigo.
 * O link NUNCA aparece no primeiro nem no último parágrafo.
 */
export function construirPromptGerador(input: GeradorArtigoInput): string {
  return `Você é um especialista em SEO e redação. Gere um artigo original e bem estruturado.

## Requisitos do Artigo:
- Palavra-chave principal: "${input.palavraChave}"
- Nicho do blog: ${input.nichoDestino}
- Anchor text para o link interno: "${input.anchorText}"
- URL para inserir o link: ${input.urlDestino}
- Blog de destino: ${input.blogDestino}

## Instruções de Escrita:
1. Crie um título H1 relevante e otimizado para a palavra-chave.
2. Estruture com subtítulos H2 e H3 conforme necessário.
3. Escreva 4-6 parágrafos de conteúdo de qualidade.
4. O link DEVE aparecer em um parágrafo do MEIO do artigo (nem primeiro, nem último).
5. Insira o link de forma natural e contextualizada usando o anchor text fornecido.
6. Mantenha um tom profissional e informatvo.
7. Evite spam, conteúdo duplicado ou genérico.

## Formato de Saída:
Retorne APENAS HTML bem formado com as tags:
- <h1> para o título
- <h2> e <h3> para subtítulos
- <p> para parágrafos
- <a href="${input.urlDestino}">${input.anchorText}</a> para o link

NÃO inclua <!DOCTYPE>, <html>, <head> ou <body>. APENAS as tags de conteúdo.

Comece agora:`;
}

/**
 * Validação básica do HTML gerado.
 */
export function validarHtmlGerado(html: string): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!html || html.trim().length === 0) {
    erros.push("HTML vazio.");
  }

  if (!html.includes("<h1")) {
    erros.push("Falta tag H1.");
  }

  if (!html.includes("<p")) {
    erros.push("Falta parágrafos (<p>).");
  }

  if (!html.includes("<a href=")) {
    erros.push("Falta link inserido.");
  }

  // Verifica se não há tags perigosas
  const tagsProibidas = ["<script", "<iframe", "<embed", "javascript:", "onclick"];
  for (const tag of tagsProibidas) {
    if (html.toLowerCase().includes(tag)) {
      erros.push(`Tag/atributo perigoso encontrado: ${tag}`);
    }
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Limpa o HTML retornado pela API, removendo tags inválidas.
 */
export function limparHtml(html: string): string {
  let limpo = html
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .trim();

  // Remove espaços múltiplos e quebras desnecessárias
  limpo = limpo
    .replace(/\n\s*\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  return limpo;
}
