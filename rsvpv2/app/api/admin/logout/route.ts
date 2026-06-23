import { NextResponse } from "next/server";

// POST /api/admin/logout — clear the session cookie.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  return res;
}
