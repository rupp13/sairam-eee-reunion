import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const guests = Number(body.guests ?? 1);
    const message = body.message ? String(body.message).trim() : null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(guests) || guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: "Guest count must be between 1 and 20." },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.query(
      `insert into rsvps (name, email, guests, message) values ($1, $2, $3, $4)`,
      [name, email, guests, message]
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

export async function GET() {
  try {
    const db = await getDb();
    const { rows } = await db.query(
      `select name, guests, created_at from rsvps order by created_at desc`
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
