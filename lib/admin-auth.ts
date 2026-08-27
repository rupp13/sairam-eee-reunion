import { NextRequest } from "next/server";

export function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected) && secret === expected;
}
