import { PrismaClient } from "@prisma/client";

type PrismaClientInstance = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
  dbInitError: Error | null;
};

let _dbInitError: Error | null = globalForPrisma.dbInitError ?? null;

/** Lazy PrismaClient — only creates the instance on first use, not on import */
let _db: PrismaClientInstance | undefined = globalForPrisma.prisma;

function getDb(): PrismaClientInstance {
  if (_db) return _db;
  if (_dbInitError) throw _dbInitError;
  try {
    _db = new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _db;
    return _db;
  } catch (error) {
    _dbInitError = error instanceof Error ? error : new Error(String(error));
    globalForPrisma.dbInitError = _dbInitError;
    console.error('[DB] Failed to initialize PrismaClient:', _dbInitError.message);
    throw _dbInitError;
  }
}

/** Proxy that defers PrismaClient creation to first property access */
export const db = new Proxy({} as PrismaClientInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

/** True if PrismaClient was initialized successfully (or not yet attempted) */
export function isDbReady(): boolean {
  return !_dbInitError;
}

/** Returns the init error if PrismaClient failed to connect */
export function getDbError(): Error | null {
  return _dbInitError;
}
