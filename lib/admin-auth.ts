import { NextRequest } from "next/server";

export function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected) && secret === expected;
}

export function isRsvpListAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-rsvp-list-secret");
  const expected = process.env.RSVP_LIST_SECRET;
  return Boolean(expected) && secret === expected;
}
