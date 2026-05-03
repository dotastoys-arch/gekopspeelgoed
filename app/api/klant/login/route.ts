import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getCustomerSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Vul alle velden in" }, { status: 400 });
  }

  const customer = await db.query.customers.findFirst({
    where: eq(customers.email, email.toLowerCase().trim()),
  });

  if (!customer || !customer.passwordHash) {
    return NextResponse.json({ error: "Geen account gevonden voor dit e-mailadres" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
  }

  const session = await getCustomerSession();
  session.customerId = customer.id;
  session.customerEmail = customer.email;
  session.customerName = customer.name;
  await session.save();

  return NextResponse.json({ ok: true });
}
