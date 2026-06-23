import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const MAX_NAME = 120;
const MAX_MESSAGE = 2000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") ?? 50) || 50)
  );

  const wishes = await prisma.wish.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, message: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    wishes: wishes.map((w) => ({
      id: w.id,
      name: w.name,
      message: w.message,
      date: w.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Body must be an object" },
      { status: 400 }
    );
  }

  const b = body as { name?: unknown; message?: unknown; locale?: unknown };

  const name =
    typeof b.name === "string" ? b.name.trim().slice(0, MAX_NAME) : "";
  const message =
    typeof b.message === "string" ? b.message.trim().slice(0, MAX_MESSAGE) : "";

  if (name.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 }
    );
  }
  if (message.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Message is required" },
      { status: 400 }
    );
  }

  const locale =
    typeof b.locale === "string" && (b.locale === "en" || b.locale === "ms")
      ? b.locale
      : "en";

  try {
    const created = await prisma.wish.create({
      data: { name, message, locale },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json(
      { ok: true, id: created.id, createdAt: created.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error("wishes.post failed", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
