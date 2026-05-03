import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getCustomerSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Vul alle velden in" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, email.toLowerCase().trim()),
  });

  if (existing?.passwordHash) {
    return NextResponse.json({ error: "Er bestaat al een account met dit e-mailadres" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let customerId: number;
  let customerName: string;

  if (existing) {
    // Customer already exists (from a previous order) — add password
    await db.update(customers)
      .set({ passwordHash, name })
      .where(eq(customers.id, existing.id));
    customerId = existing.id;
    customerName = name;
  } else {
    const [created] = await db.insert(customers).values({
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
    }).returning();
    customerId = created.id;
    customerName = created.name;
  }

  const session = await getCustomerSession();
  session.customerId = customerId;
  session.customerEmail = email.toLowerCase().trim();
  session.customerName = customerName;
  await session.save();

  return NextResponse.json({ ok: true });
}
