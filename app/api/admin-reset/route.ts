import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Temporary one-time cleanup endpoint. Remove after use.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "sairam-reset-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = await getDb();
  await db.query(`truncate table rsvps restart identity`);

  return NextResponse.json({ ok: true, message: "rsvps table cleared" });
}
