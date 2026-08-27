import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const { rows } = await db.query(
      `select id, first_name, last_name, branch, confirmed, created_at from rsvps order by created_at desc`
    );
    return NextResponse.json({ rsvps: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load RSVPs." },
      { status: 500 }
    );
  }
}
