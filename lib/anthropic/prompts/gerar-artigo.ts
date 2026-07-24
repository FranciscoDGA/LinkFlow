/**
 * Sistema avançado de prompts para geração de artigos com IA.
 * Implementa EEAT, estrutura rigorosa e schema JSON-LD.
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
 * Constrói o prompt ultra-detalhado para geração de artigos.
 * Enforça estrutura, EEAT, qualidade e contagem de palavras.
 */
export function construirPromptGerador(input: GeradorArtigoInput): string {
  return `Você é um especialista em redação para SEO e criação de conteúdo premium.
Seu objetivo é gerar um artigo de EXTREMA QUALIDADE que siga RIGOROSAMENTE todas as regras abaixo.

═══════════════════════════════════════════════════════════════════════════════
DADOS DO ARTIGO
═══════════════════════════════════════════════════════════════════════════════

Palavra-chave principal: "${input.palavraChave}"
Nicho: ${input.nichoDestino}
Blog destino: ${input.blogDestino}
URL do blog: ${input.urlDestino}
Anchor text: "${input.anchorText}"

═══════════════════════════════════════════════════════════════════════════════
ESTRUTURA OBRIGATÓRIA
═══════════════════════════════════════════════════════════════════════════════

O artigo DEVE ter EXATAMENTE esta estrutura:

1. <h1>
   - Contém a palavra-chave principal
   - Entre 60-70 caracteres
   - Exemplo: "Como Fazer ${input.palavraChave}: Guia Completo 2024"

2. <p> - INTRODUÇÃO (150-200 palavras)
   - Abra com um GANCHO EMOCIONAL que capture a atenção
   - Problema relatable
   - Solução em alta nível
   - Por que esse artigo importa
   - Termine com uma promessa ao leitor
   - Obrigatório: termine com "Neste artigo, você aprenderá..."

3. <h2> SEÇÃO 1 + <h3> subsseções (150-200 palavras cada)
   - Mínimo 2 <h3> dentro desta seção
   - Cada <h3> com mínimo 2 parágrafos
   - Cada parágrafo com mínimo 3 linhas
   - Inclua 1ª sugestão de imagem aqui:
     <!-- IMAGEM: [descrição específica para buscar no Unsplash] alt='descrição concisa' -->

4. <h2> SEÇÃO 2 + <h3> subsseções (150-200 palavras cada)
   - Mínimo 2 <h3> dentro desta seção
   - Cada <h3> com mínimo 2 parágrafos

5. <h2> SEÇÃO 3 + <h3> subsseções (150-200 palavras cada)
   *** SEÇÃO COM O BACKLINK ***
   - O backlink OBRIGATORIAMENTE dentro do 1º parágrafo de um <h3>
   - Inserir NATURALMENTE: <a href="${input.urlDestino}">${input.anchorText}</a>
   - Contexto editorial, nunca forçado
   - Inclua 2ª sugestão de imagem ANTES do parágrafo com backlink
   - Mínimo 2 <h3> dentro desta seção

6. <h2> EEAT (Expertise, Experience, Authoritativeness, Trustworthiness)
   - NUNCA INVENTAR DADOS
   - Usar APENAS informações verificáveis
   - Formatos aceitos:
     * "Segundo pesquisa da [órgão oficial]..."
     * "De acordo com [especialista reconhecido]..."
     * "Dados do [instituto/universidade]..."
     * "Conforme [regulamentação oficial]..."
   - Mínimo 2 parágrafos
   - Cada parágrafo com dados/referências reais
   - ADAPTAR PARA O NICHO:
     • Saúde: Fiocruz, CFM, ANVISA, OMS
     • Tecnologia: Gartner, IDC, Statista
     • Negócios: SEBRAE, FGV, McKinsey
     • Direito: OAB, STF, jurisprudência
     • Educação: INEP, MEC, pesquisas acadêmicas
     • Outro: pesquise institutos relevantes ao nicho

7. <h2> Perguntas Frequentes (FAQ)
   - EXATAMENTE 5 perguntas e respostas
   - Cada pergunta deve parecer real (como "People Also Ask" do Google)
   - Formato:
     <h3>Pergunta 1?</h3>
     <p>Resposta com 2-3 frases...</p>
     <h3>Pergunta 2?</h3>
     <p>Resposta com 2-3 frases...</p>
     ... (até 5 perguntas)

8. <p> - CONCLUSÃO (100-150 palavras)
   - Resuma os pontos principais
   - Ofereça um CTA SUAVE (não agressivo)
   - Exemplo: "Agora que você conhece as melhores práticas, considere implementar gradualmente..."
   - Termine com esperança/motivação

═══════════════════════════════════════════════════════════════════════════════
CONTAGEM DE PALAVRAS
═══════════════════════════════════════════════════════════════════════════════

OBRIGATÓRIO: O artigo completo deve ter ENTRE 1800 E 2200 PALAVRAS

Distribuição aproximada:
- Introdução: 150-200 palavras
- Seção 1: 300-350 palavras (com H3s)
- Seção 2: 300-350 palavras (com H3s)
- Seção 3: 300-350 palavras (com H3s e backlink)
- EEAT: 200-250 palavras
- FAQ: 400-500 palavras
- Conclusão: 100-150 palavras
TOTAL: 1800-2200 palavras

═══════════════════════════════════════════════════════════════════════════════
REGRAS DE QUALIDADE (NÃO NEGOCIÁVEIS)
═══════════════════════════════════════════════════════════════════════════════

✓ TOM E ESTILO
  - Especialista mas acessível (nunca use jargão sem explicar)
  - Nunca genérico (sempre específico e útil)
  - Tone of voice: amigável + profissional
  - Escreva como um amigo especialista, não um robô

✓ ESTRUTURA DE PARÁGRAFOS
  - Cada parágrafo deve ter MÍNIMO 3 linhas
  - Nenhum parágrafo com 1 ou 2 linhas
  - Variar estrutura: não comece todos os parágrafos igual
  - Use conectores: "Por outro lado...", "Além disso...", "Isso significa que..."

✓ CADA H3 DEVE TER
  - Mínimo 2 parágrafos completos
  - Mínimo 3 linhas por parágrafo
  - Estrutura diferente entre eles

✓ EEAT - CRÍTICO
  - NUNCA inventar estatísticas ou órgãos
  - Se não tiver certeza, usar frases genéricas verificáveis:
    * "Estudos mostram que..."
    * "Especialistas concordam que..."
    * "Pesquisas indicam que..."
  - Preferir dados de institutos reais conhecidos
  - Citar SEMPRE a fonte entre parênteses

✓ BACKLINK
  - Aparecer SOMENTE na Seção 3
  - Dentro de um parágrafo editorial natural
  - Nunca forçado ou artificial
  - Rodeado de contexto relevante (mínimo 3 linhas antes e depois)

✓ IMAGENS
  - Sugestão 1: na Seção 1
  - Sugestão 2: logo antes do backlink na Seção 3
  - Formato: <!-- IMAGEM: [descrição específica e descritiva] alt='texto alt em português' -->
  - Descrição deve permitir busca no Unsplash (ex: "woman working at computer modern office")

═══════════════════════════════════════════════════════════════════════════════
SCHEMA JSON-LD FAQ
═══════════════════════════════════════════════════════════════════════════════

Ao final do artigo, ANTES de </body>, inclua este schema JSON-LD:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[pergunta 1 exata do FAQ]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[resposta 1 completa]"
      }
    },
    {
      "@type": "Question",
      "name": "[pergunta 2 exata do FAQ]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[resposta 2 completa]"
      }
    },
    ... (até 5 questões)
  ]
}
</script>

═══════════════════════════════════════════════════════════════════════════════
CHECKLIST FINAL (ANTES DE RETORNAR)
═══════════════════════════════════════════════════════════════════════════════

☐ H1 contém a palavra-chave
☐ Introdução tem 150-200 palavras e gancho emocional
☐ Seção 1: H2 + 2+ H3s (150-200 palavras cada)
☐ Seção 2: H2 + 2+ H3s (150-200 palavras cada)
☐ Seção 3: H2 + 2+ H3s + BACKLINK no 1º parágrafo de um H3
☐ EEAT: dados reais, fontes citadas
☐ FAQ: exatamente 5 perguntas e respostas
☐ Conclusão: 100-150 palavras com CTA suave
☐ Total: 1800-2200 palavras
☐ 2 sugestões de imagem (Seção 1 e Seção 3)
☐ Schema JSON-LD FAQ ao final
☐ Cada parágrafo tem 3+ linhas
☐ Cada H3 tem 2+ parágrafos
☐ Backlink é natural e editorial
☐ EEAT não contém dados inventados
☐ Nenhum parágrafo genérico
☐ Tom: especialista mas acessível

═══════════════════════════════════════════════════════════════════════════════
IMPORTANTE
═══════════════════════════════════════════════════════════════════════════════

- Retorne APENAS HTML válido + schema JSON-LD
- Sem <!DOCTYPE>, <html>, <head>, <body> — apenas tags de conteúdo
- Sem comentários de desenvolvimento
- Tags corretamente fechadas
- Schema JSON-LD como último elemento antes de fechar

Comece a gerar o artigo agora. SIGA RIGOROSAMENTE TODAS AS REGRAS.`;
}

/**
 * Validação rigorosa do HTML gerado.
 */
export function validarHtmlGerado(html: string): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  if (!html || html.trim().length === 0) {
    erros.push("HTML vazio.");
  }

  if (!html.includes("<h1")) {
    erros.push("Falta tag H1.");
  }

  if ((html.match(/<h2/g) || []).length < 4) {
    erros.push("Precisa de no mínimo 4 seções H2.");
  }

  if (!html.includes("<a href=")) {
    erros.push("Falta link inserido.");
  }

  if (!html.includes("schema.org")) {
    erros.push("Falta schema JSON-LD FAQ.");
  }

  if (!html.includes("<!-- IMAGEM:")) {
    erros.push("Falta sugestões de imagem.");
  }

  // Conta palavras
  const palavras = html.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  if (palavras < 1800) {
    erros.push(`Artigo muito curto: ${palavras} palavras (mínimo 1800).`);
  }
  if (palavras > 2200) {
    erros.push(`Artigo muito longo: ${palavras} palavras (máximo 2200).`);
  }

  // Verifica tags perigosas
  const tagsProibidas = [
    "<script",
    "<iframe",
    "<embed",
    "javascript:",
    "onclick",
  ];
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
 * Limpa o HTML retornado pela API.
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

  // Normaliza espaços mantendo estrutura
  limpo = limpo.replace(/\n\s*\n/g, "\n").trim();

  return limpo;
}
