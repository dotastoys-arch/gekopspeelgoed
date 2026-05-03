import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generatePackage } from "@/lib/packages/engine";
import type { Category } from "@/lib/db/schema";
import createMollieClient from "@mollie/api-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { category, name, email, address, postalCode, city, giftProductId } = await req.json();

  if (!category || !name || !email || !address || !postalCode || !city) {
    return NextResponse.json({ error: "Vul alle verplichte velden in" }, { status: 400 });
  }

  // Find or create customer
  let customer = await db.query.customers.findFirst({ where: eq(customers.email, email.toLowerCase()) });
  if (!customer) {
    [customer] = await db.insert(customers).values({
      name,
      email: email.toLowerCase(),
      address,
      postalCode,
      city,
    }).returning();
  } else {
    await db.update(customers).set({ name, address, postalCode, city }).where(eq(customers.id, customer.id));
  }

  // Generate package (takes customer history into account)
  const pkg = await generatePackage(category as Category, customer.id);

  if (!pkg.viable) {
    return NextResponse.json({ error: pkg.reason ?? "Er kunnen momenteel geen pakketten samengesteld worden" }, { status: 422 });
  }

  // Save order (status: pending_payment until Mollie confirms payment)
  const [order] = await db.insert(orders).values({
    customerId: customer.id,
    category: category as Category,
    sellingPriceIncl: pkg.sellingPriceIncl,
    totalPurchaseExcl: pkg.totalPurchaseExcl,
    profit: pkg.profit,
    status: "pending_payment",
    giftProductId: giftProductId ?? null,
  }).returning();

  await db.insert(orderItems).values(
    pkg.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: 1,
      purchasePriceExcl: item.purchasePriceExcl,
    }))
  );

  // Create Mollie payment
  const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gekopspeelgoed.nl";

  const payment = await mollie.payments.create({
    amount: { currency: "EUR", value: pkg.sellingPriceIncl.toFixed(2) },
    description: `Gek op Speelgoed pakket #${order.id}`,
    redirectUrl: `${baseUrl}/bestelling-bevestigd?orderId=${order.id}`,
    webhookUrl: `${baseUrl}/api/mollie/webhook`,
    metadata: {
      orderId: String(order.id),
      customerEmail: customer.email,
      customerName: customer.name,
      address,
      postalCode,
      city,
    },
  });

  await db.update(orders).set({ molliePaymentId: payment.id }).where(eq(orders.id, order.id));

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    mollieUrl: payment._links.checkout?.href,
  });
}
