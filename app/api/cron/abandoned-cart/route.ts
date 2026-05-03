import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { abandonedCarts } from "@/lib/db/schema";
import { and, eq, isNull, lt } from "drizzle-orm";
import { sendAbandonedCartEmail } from "@/lib/email/send-abandoned-cart";
import type { Category } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await db.query.abandonedCarts.findMany({
    where: and(
      isNull(abandonedCarts.emailSentAt),
      isNull(abandonedCarts.completedAt),
      lt(abandonedCarts.createdAt, oneHourAgo)
    ),
  });

  let sent = 0;
  for (const cart of carts) {
    try {
      await sendAbandonedCartEmail({
        customerName: cart.name,
        customerEmail: cart.email,
        category: cart.category as Category,
        discountToken: cart.token,
      });
      await db.update(abandonedCarts)
        .set({ emailSentAt: new Date() })
        .where(eq(abandonedCarts.id, cart.id));
      sent++;
    } catch (err) {
      console.error(`Failed to send abandoned cart email for cart ${cart.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: carts.length });
}
