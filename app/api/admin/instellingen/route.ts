import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { packageConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  const configs = await db.query.packageConfigs.findMany();
  return NextResponse.json({ configs });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  const { category, sellingPriceIncl, itemsCount, minMarginPct, minProfit, shippingCost } = await req.json();
  await db.update(packageConfigs)
    .set({ sellingPriceIncl, itemsCount, minMarginPct, minProfit, shippingCost })
    .where(eq(packageConfigs.category, category));
  return NextResponse.json({ ok: true });
}
