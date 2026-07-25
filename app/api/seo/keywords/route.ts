import { NextResponse } from "next/server";
import { dataForSeoRequest } from "@/lib/dataforseo/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Palavra-chave não informada." }, { status: 400 });
  }

  try {
    // Busca dados reais do DataForSEO
    const response = await dataForSeoRequest<any>("dataforseo_labs/google/keyword_ideas/live", [
      {
        keywords: [query],
        location_name: "Brazil",
        language_name: "Portuguese",
        limit: 10
      }
    ]);

    const items = response.tasks?.[0]?.result?.[0]?.items ?? [];

    const realData = items.map((item: any) => {
      // Intenção principal, se houver
      const intentObj = item.keyword_info?.search_intent_info?.main_intent;
      
      return {
        keyword: item.keyword,
        volume: item.keyword_info?.search_volume ?? 0,
        difficulty: item.keyword_properties?.keyword_difficulty ?? 0,
        intent: intentObj ? intentObj : "Informativo",
      };
    });

    return NextResponse.json({ data: realData });
  } catch (error: any) {
    console.error("Erro no DataForSEO:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
