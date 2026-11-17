import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export async function GET() {
  const sites = await dataStore.getSites();
  return NextResponse.json(sites);
}
