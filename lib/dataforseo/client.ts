/**
 * Client básico para a API do DataForSEO.
 * Documentação: https://docs.dataforseo.com/
 */

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

/**
 * Faz uma requisição POST genérica para a API do DataForSEO
 */
export async function dataForSeoRequest<T>(endpoint: string, data: any[]): Promise<T> {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error("Credenciais do DataForSEO ausentes no .env");
  }

  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString("base64");

  const response = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    // Não cachear chamadas de API dinâmicas na Vercel
    cache: "no-store" 
  });

  if (!response.ok) {
    throw new Error(`DataForSEO Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
