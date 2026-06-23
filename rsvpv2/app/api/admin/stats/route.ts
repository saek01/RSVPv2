import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats — aggregate counts (admin only).
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const [total, attending, declined, totalGuests, wishTotal] = await Promise.all([
    prisma.rsvp.count(),
    prisma.rsvp.count({ where: { attending: true } }),
    prisma.rsvp.count({ where: { attending: false } }),
    prisma.rsvp.aggregate({ _sum: { guestCount: true } }),
    prisma.wish.count(),
  ]);

  return NextResponse.json({
    ok: true,
    stats: {
      totalRsvps: total,
      attending,
      declined,
      totalGuests: totalGuests._sum.guestCount ?? 0,
      wishTotal,
    },
  });
}
