import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as relations from "./relations";

// Prevent multiple connections during Next.js hot reload in development
const globalForDb = globalThis as unknown as { _pgClient: ReturnType<typeof postgres> | undefined };

const client =
  globalForDb._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 1, // Single connection per serverless function
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema: { ...schema, ...relations } });

// No-op kept for backwards compatibility during migration
export function initDatabase() {}
