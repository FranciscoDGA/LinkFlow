import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export async function GET() {
  const topics = await dataStore.getTopics();
  return NextResponse.json(topics);
}
