import { PrismaClient } from "@prisma/client";

type PrismaClientInstance = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

// Hardcoded fallback — always works regardless of env loading
const DEFAULT_DB_URL = 'file:/home/z/my-project/db/custom.db';
const dbUrl = process.env.DATABASE_URL || DEFAULT_DB_URL;

function createPrisma(): PrismaClientInstance {
  return new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });
}

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
