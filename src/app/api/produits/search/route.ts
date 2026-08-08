import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("q") || "";
  if (term.trim().length < 1) return NextResponse.json([]);

  const searchTerm = `%${term}%`;
  const results = await query(
    "SELECT * FROM produits WHERE designation LIKE ? OR reference LIKE ? OR categorie LIKE ? LIMIT 20",
    [searchTerm, searchTerm, searchTerm]
  );
  return NextResponse.json(results);
}
