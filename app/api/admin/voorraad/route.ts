import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const all = await db
    .select({
      id: products.id,
      name: products.name,
      ean: products.ean,
      purchasePriceExcl: products.purchasePriceExcl,
      gender: products.gender,
      ageMin: products.ageMin,
      ageMax: products.ageMax,
      isActive: products.isActive,
      isGift: products.isGift,
      quantity: inventory.quantity,
      inventoryId: inventory.id,
    })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .orderBy(products.name);

  return NextResponse.json({ products: all });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { productId, quantity, gender, ageMin, ageMax, isActive, isGift } = await req.json();

  if (quantity !== undefined) {
    await db.update(inventory).set({ quantity, updatedAt: new Date() })
      .where(eq(inventory.productId, productId));
  }
  if (gender !== undefined || ageMin !== undefined || ageMax !== undefined || isActive !== undefined || isGift !== undefined) {
    const updateData: Record<string, unknown> = {};
    if (gender !== undefined) updateData.gender = gender;
    if (ageMin !== undefined) updateData.ageMin = ageMin;
    if (ageMax !== undefined) updateData.ageMax = ageMax;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isGift !== undefined) updateData.isGift = isGift;
    await db.update(products).set(updateData).where(eq(products.id, productId));
  }

  return NextResponse.json({ ok: true });
}
