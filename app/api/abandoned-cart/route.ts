import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { abandonedCarts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Category } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { name, email, address, postalCode, city, category } = await req.json();
  if (!email || !category) return NextResponse.json({ ok: false });

  // Check if there's already a pending cart for this email+category
  const existing = await db.query.abandonedCarts.findFirst({
    where: eq(abandonedCarts.email, email.toLowerCase()),
  });

  if (existing && !existing.completedAt) {
    // Update existing cart
    await db.update(abandonedCarts)
      .set({ name, address, postalCode, city, emailSentAt: null, createdAt: new Date() })
      .where(eq(abandonedCarts.id, existing.id));
    return NextResponse.json({ ok: true, token: existing.token });
  }

  const token = randomUUID();
  await db.insert(abandonedCarts).values({
    token,
    email: email.toLowerCase(),
    name,
    address,
    postalCode,
    city,
    category: category as Category,
  });

  return NextResponse.json({ ok: true, token });
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ found: false });

  const cart = await db.query.abandonedCarts.findFirst({
    where: eq(abandonedCarts.token, token),
  });

  if (!cart || cart.completedAt) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    name: cart.name,
    email: cart.email,
    address: cart.address ?? "",
    postalCode: cart.postalCode ?? "",
    city: cart.city ?? "",
    category: cart.category,
  });
}
