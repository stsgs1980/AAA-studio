import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// WebSocket polyfill for Neon in Node.js
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

function createPrismaClient() {
  // In serverless (Vercel), use Neon adapter for connection pooling
  if (process.env.DATABASE_URL?.includes("neon.tech")) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
