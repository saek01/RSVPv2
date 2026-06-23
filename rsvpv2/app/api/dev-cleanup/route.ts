// filepath: app/api/dev-cleanup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const r = await prisma.rsvp.deleteMany({});
  const w = await prisma.wish.deleteMany({});
  return NextResponse.json({ deletedRsvps: r.count, deletedWishes: w.count });
}
