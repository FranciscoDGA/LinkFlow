import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = dataStore.getArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar artigos' },
      { status: 500 }
    );
  }
}
