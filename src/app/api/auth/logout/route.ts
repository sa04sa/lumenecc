import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
