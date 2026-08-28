import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthorized } from "@/lib/admin-auth";

const VALID_BRANCHES = ["EEE", "ECE", "MECH"];
const VALID_CONFIRMED = ["yes", "maybe", "no"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
      { error: "Please select a valid confirmation status." },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    await db.query(
      `update rsvps set first_name = $1, last_name = $2, branch = $3, confirmed = $4 where id = $5`,
      [firstName, lastName, branch, confirmed, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update RSVP." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDb();
    await db.query(`delete from rsvps where id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete RSVP." },
      { status: 500 }
    );
  }
}
