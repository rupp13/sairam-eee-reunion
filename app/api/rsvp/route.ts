import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const VALID_BRANCHES = ["EEE", "ECE", "MECH"];
const VALID_CONFIRMED = ["yes", "maybe", "no"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const branch = String(body.branch ?? "").trim().toUpperCase();
    const confirmed = String(body.confirmed ?? "").trim().toLowerCase();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 }
      );
    }
    if (!VALID_BRANCHES.includes(branch)) {
      return NextResponse.json(
        { error: "Please select a valid department (EEE, ECE, or MECH)." },
        { status: 400 }
      );
    }
    if (!VALID_CONFIRMED.includes(confirmed)) {
      return NextResponse.json(
        { error: "Please let us know if you're confirmed to attend." },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.query(
      `insert into rsvps (first_name, last_name, branch, confirmed) values ($1, $2, $3, $4)`,
      [firstName, lastName, branch, confirmed]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong saving your RSVP." },
      { status: 500 }
    );
  }
}
