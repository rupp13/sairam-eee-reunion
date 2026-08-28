import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isRsvpListAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const wantsContact = req.headers.get("x-rsvp-list-secret") !== null;

  if (wantsContact && !isRsvpListAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const columns = wantsContact
    ? "first_name, last_name, email, phone, branch, confirmed, created_at"
    : "first_name, last_name, branch, confirmed, created_at";

  try {
    const db = await getDb();
    const { rows } = await db.query(
      `select ${columns} from rsvps where first_name is not null and first_name != '' order by created_at desc`
    );
    return NextResponse.json({ rsvps: rows, includesContact: wantsContact });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load RSVPs." },
      { status: 500 }
    );
  }
}
