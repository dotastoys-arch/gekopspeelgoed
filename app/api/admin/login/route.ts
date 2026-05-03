import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Brute-force protection: track failed attempts per IP in memory
// Resets on server restart — sufficient for a single-admin panel
interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}
const attempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const record = attempts.get(ip) ?? { count: 0, lockedUntil: null };

  // Check lockout
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remainingMin = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Te veel pogingen. Probeer het over ${remainingMin} minuten opnieuw.` },
      { status: 429 }
    );
  }

  // Reset expired lockout
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    record.count = 0;
    record.lockedUntil = null;
  }

  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME ?? "admin";
  const validPassword = process.env.ADMIN_PASSWORD ?? "";

  if (username !== validUsername || password !== validPassword) {
    record.count++;

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_MS;
      attempts.set(ip, record);
      return NextResponse.json(
        { error: "Te veel mislukte pogingen. Account geblokkeerd voor 15 minuten." },
        { status: 429 }
      );
    }

    attempts.set(ip, record);
    const remaining = MAX_ATTEMPTS - record.count;
    return NextResponse.json(
      { error: `Verkeerde gebruikersnaam of wachtwoord. Nog ${remaining} poging${remaining === 1 ? "" : "en"}.` },
      { status: 401 }
    );
  }

  // Success: clear failed attempts
  attempts.delete(ip);

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
