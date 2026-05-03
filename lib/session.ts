import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAdmin?: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET ?? "fallback-secret-change-this-in-production-32c",
  cookieName: "gos-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// ─── Customer session ────────────────────────────────────────────────────────

export interface CustomerSessionData {
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
}

const customerSessionOptions = {
  password: process.env.SESSION_SECRET ?? "fallback-secret-change-this-in-production-32c",
  cookieName: "gos-klant-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getCustomerSession() {
  const cookieStore = await cookies();
  return getIronSession<CustomerSessionData>(cookieStore, customerSessionOptions);
}
