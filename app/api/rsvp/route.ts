import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const VALID_BRANCHES = ["EEE", "ECE", "MECH"];
const VALID_CONFIRMED = ["yes", "maybe", "no"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const branch = String(body.branch ?? "").trim().toUpperCase();
    const confirmed = String(body.confirmed ?? "").trim().toLowerCase();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required." },
        { status: 400 }
      );
    }
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Please provide at least an email or a phone number." },
        { status: 400 }
      );
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
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
      `insert into rsvps (first_name, last_name, email, phone, branch, confirmed) values ($1, $2, $3, $4, $5, $6)`,
      [firstName, lastName, email, phone, branch, confirmed]
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
      `select first_name, last_name, email, phone, branch, confirmed, created_at from rsvps order by created_at desc`
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
