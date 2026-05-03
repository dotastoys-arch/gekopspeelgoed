import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const gifts = await db
    .select({ id: products.id, name: products.name, imageUrl: products.imageUrl })
    .from(products)
    .where(and(eq(products.isGift, true), eq(products.isActive, true)));
  return NextResponse.json(gifts);
}
