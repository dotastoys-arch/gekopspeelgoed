import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { orders, orderItems, inventory, customers } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { generatePackage } from "@/lib/packages/engine";
import type { Category } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const all = await db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    with: { customer: true, orderItems: { with: { product: true } } },
  });

  return NextResponse.json({ orders: all });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { orderId, status } = await req.json();
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  // When marking as packed, deduct stock
  if (status === "packed") {
    const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) });
    for (const item of items) {
      await db.update(inventory)
        .set({ quantity: sql`MAX(0, ${inventory.quantity} - ${item.quantity})` })
        .where(eq(inventory.productId, item.productId));
    }
  }

  return NextResponse.json({ ok: true });
}
