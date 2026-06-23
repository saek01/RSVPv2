import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, isAdminConfigured, makeSessionCookie } from "@/lib/auth";

// POST /api/admin/login — verify password, set session cookie.
export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin is not configured on this server" },
      { status: 503 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", makeSessionCookie());
  return res;
}
