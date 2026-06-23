import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function getPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

function getSecret(): string {
  // Re-use the password as the HMAC secret. If the password rotates, all
  // sessions are invalidated — which is the behaviour we want.
  return getPassword() ?? "no-password-configured";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function isAdminConfigured(): boolean {
  return getPassword() !== null;
}

export function checkPassword(input: string): boolean {
  const pw = getPassword();
  if (!pw) return false;
  // Constant-time compare against the configured password.
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  if (a.length !== b.length) {
    // Still do a compare against itself to keep the timing more uniform.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function makeSessionCookie(): string {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  const value = `${issuedAt}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

// Accept either a Next.js ReadonlyRequestCookies (from `cookies()`) or a
// NextRequest. Both expose `.get(name)`.
export function isAdminRequest(
  request: {
    cookies: { get: (n: string) => { value: string } | undefined };
  },
): boolean {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const [issuedAt, sig] = cookie.split(".");
  if (!issuedAt || !sig) return false;
  // Reject sessions older than SESSION_MAX_AGE.
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE * 1000) {
    return false;
  }
  return safeEqual(sig, sign(issuedAt));
}

/**
 * Returns a NextResponse if the request is not authorised, or null if it is.
 * Use in API routes: `const auth = requireAdmin(); if (auth) return auth;`
 */
export function requireAdmin(
  request?: { cookies: { get: (n: string) => { value: string } | undefined } },
): Response | null {
  // If no password is configured, deny all admin requests.
  if (!isAdminConfigured()) {
    return new Response(
      JSON.stringify({ ok: false, error: "Admin not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // In a server-component context (no request object), we can't check
  // cookies. The caller is expected to redirect from the page guard.
  if (!request) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!isAdminRequest(request)) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  return null;
}
