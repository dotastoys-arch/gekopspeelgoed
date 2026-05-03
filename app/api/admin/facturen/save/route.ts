import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { invoices, invoiceLines, products, inventory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const { meta, products: rawProducts } = body;

  if (!rawProducts?.length) {
    return NextResponse.json({ error: "Geen producten" }, { status: 400 });
  }

  // Insert invoice
  const [invoice] = await db
    .insert(invoices)
    .values({
      supplier: meta.supplier,
      invoiceNumber: meta.invoiceNumber,
      invoiceDate: meta.invoiceDate,
      totalExcl: meta.totalExcl,
      totalBtw: meta.totalBtw,
      totalIncl: meta.totalIncl,
      filename: meta.filename ?? null,
      fileHash: meta.fileHash ?? null,
    })
    .returning();

  let created = 0;
  let updated = 0;

  for (const p of rawProducts) {
    if (!p.name || p.unitPriceExcl <= 0) continue;

    // Check if product with this EAN already exists
    let existingProduct = p.ean
      ? await db.query.products.findFirst({ where: eq(products.ean, p.ean) })
      : null;

    if (existingProduct) {
      // Update price
      await db
        .update(products)
        .set({ purchasePriceExcl: p.unitPriceExcl })
        .where(eq(products.id, existingProduct.id));

      // Add to existing stock
      await db
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} + ${p.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.productId, existingProduct.id));

      updated++;
    } else {
      // Create new product
      const [newProduct] = await db
        .insert(products)
        .values({
          ean: p.ean || null,
          articleNumber: p.articleNumber || null,
          name: p.name,
          purchasePriceExcl: p.unitPriceExcl,
          gender: p.gender ?? "unisex",
          ageMin: p.ageMin ?? 0,
          ageMax: p.ageMax ?? 8,
        })
        .returning();

      await db.insert(inventory).values({
        productId: newProduct.id,
        quantity: p.quantity,
      });

      existingProduct = newProduct;
      created++;
    }

    // Log invoice line
    await db.insert(invoiceLines).values({
      invoiceId: invoice.id,
      productId: existingProduct.id,
      articleNumber: p.articleNumber ?? null,
      ean: p.ean ?? null,
      name: p.name,
      quantity: p.quantity,
      unitPriceExcl: p.unitPriceExcl,
      totalExcl: p.totalExcl ?? p.unitPriceExcl * p.quantity,
    });
  }

  return NextResponse.json({ ok: true, invoiceId: invoice.id, created, updated });
}
