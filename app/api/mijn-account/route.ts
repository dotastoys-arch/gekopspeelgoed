import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";

export const runtime = "nodejs";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Wacht op betaling",
  pending: "In behandeling",
  packed: "Ingepakt",
  shipped: "Verstuurd",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
};

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ found: false });

  const customer = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });

  if (!customer) return NextResponse.json({ found: false, orders: [] });

  const customerOrders = await db.query.orders.findMany({
    where: eq(orders.customerId, customer.id),
  });

  const result = customerOrders
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .map((o) => ({
      id: o.id,
      category: o.category,
      categoryLabel: CATEGORY_LABELS[o.category as keyof typeof CATEGORY_LABELS],
      categoryEmoji: CATEGORY_EMOJI[o.category as keyof typeof CATEGORY_EMOJI],
      sellingPriceIncl: o.sellingPriceIncl,
      status: o.status,
      statusLabel: STATUS_LABELS[o.status] ?? o.status,
      createdAt: o.createdAt,
    }));

  return NextResponse.json({ found: true, name: customer.name, orders: result });
}
