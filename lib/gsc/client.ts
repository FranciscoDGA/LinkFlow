/**
 * Client para a API do Google Search Console.
 * Documentação: https://developers.google.com/webmaster-tools/api/reference/rest
 */

// Para uso real, recomendamos usar a biblioteca googleapis do NPM:
// npm install googleapis
// import { google } from "googleapis";

export type GSCSearchAnalyticsResponse = {
  rows: Array<{
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
};

/**
 * Busca os dados de tráfego orgânico de um domínio específico nos últimos N dias.
 * @param siteUrl A URL do site exata cadastrada no GSC (ex: sc-domain:calmglobal.vercel.app)
 * @param accessToken O token Oauth2 do usuário
 * @param days Quantidade de dias para trás
 */
export async function getGoogleSearchConsoleMetrics(
  siteUrl: string,
  accessToken: string,
  days: number = 30
): Promise<GSCSearchAnalyticsResponse | null> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatData = (d: Date) => d.toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        siteUrl
      )}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: formatData(startDate),
          endDate: formatData(endDate),
          dimensions: ["date"],
        }),
      }
    );

    if (!res.ok) {
      console.error("Erro no GSC:", res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Exceção ao chamar GSC API:", err);
    return null;
  }
}
