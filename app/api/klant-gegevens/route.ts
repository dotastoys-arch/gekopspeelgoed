import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ found: false });

  const customer = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });

  if (!customer) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    name: customer.name,
    address: customer.address ?? "",
    postalCode: customer.postalCode ?? "",
    city: customer.city ?? "",
  });
}
