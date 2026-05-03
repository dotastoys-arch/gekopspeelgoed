import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const session = await getCustomerSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
