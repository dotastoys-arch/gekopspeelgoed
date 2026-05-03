import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import createMollieClient from "@mollie/api-client";
import { sendOrderConfirmation } from "@/lib/email/send-confirmation";
import type { Category } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Mollie sends form-encoded body: id=tr_xxxxx
    const body = await req.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "Geen payment ID" }, { status: 400 });
    }

    const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const payment = await mollie.payments.get(paymentId);

    // Find the order by Mollie payment ID
    const order = await db.query.orders.findFirst({
      where: eq(orders.molliePaymentId, paymentId),
      with: { customer: true },
    });

    if (!order) {
      // Payment might belong to a different environment (test vs live) — just acknowledge
      return NextResponse.json({ ok: true });
    }

    if (payment.status === "paid" && order.status === "pending_payment") {
      // Mark order as confirmed
      await db.update(orders).set({ status: "pending" }).where(eq(orders.id, order.id));

      // Send confirmation email
      const customer = (order as any).customer;
      if (customer?.email) {
        try {
          await sendOrderConfirmation({
            orderId: order.id,
            customerName: customer.name,
            customerEmail: customer.email,
            category: order.category as Category,
            sellingPriceIncl: order.sellingPriceIncl,
            address: customer.address ?? "",
            postalCode: customer.postalCode ?? "",
            city: customer.city ?? "",
          });
        } catch (emailErr) {
          // Don't fail the webhook if email fails — order is still confirmed
          console.error("Email failed:", emailErr);
        }
      }
    } else if (["expired", "canceled", "failed"].includes(payment.status)) {
      await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mollie webhook error:", err);
    // Always return 200 to Mollie to prevent retries on unexpected errors
    return NextResponse.json({ ok: true });
  }
}
