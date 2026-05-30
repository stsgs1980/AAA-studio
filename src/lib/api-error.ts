// ============================================================================
// 3A Studio — Unified API Error Handling
// ============================================================================

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ---------------------------------------------------------------------------
// AppError — typed error class for API routes
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Convenience constructors
export const NotFound = (msg = 'Resource not found') =>
  new AppError(msg, 404, 'NOT_FOUND');

export const BadRequest = (msg = 'Bad request', details?: unknown) =>
  new AppError(msg, 400, 'BAD_REQUEST', details);

export const Unauthorized = (msg = 'Unauthorized') =>
  new AppError(msg, 401, 'UNAUTHORIZED');

export const Forbidden = (msg = 'Forbidden') =>
  new AppError(msg, 403, 'FORBIDDEN');

export const Conflict = (msg = 'Conflict') =>
  new AppError(msg, 409, 'CONFLICT');

// ---------------------------------------------------------------------------
// API Response helpers
// ---------------------------------------------------------------------------

/** Standard success response */
export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Standard created response */
export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/** Paginated response */
export function paginate<T>(items: T[], total: number, page: number, pageSize: number) {
  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// ---------------------------------------------------------------------------
// Error → Response converter
// ---------------------------------------------------------------------------

export function handleError(error: unknown): NextResponse {
  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: error.flatten() },
      { status: 400 },
    );
  }

  // Our typed AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode },
    );
  }

  // Prisma "not found" (P2025)
  if (isPrismaNotFoundError(error)) {
    return NextResponse.json(
      { error: 'Resource not found', code: 'NOT_FOUND' },
      { status: 404 },
    );
  }

  // Prisma unique constraint (P2002)
  if (isPrismaUniqueError(error)) {
    return NextResponse.json(
      { error: 'Resource already exists', code: 'CONFLICT' },
      { status: 409 },
    );
  }

  // Fallback — unknown error
  console.error('[API Error]', error);
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

// ---------------------------------------------------------------------------
// Prisma error detectors
// ---------------------------------------------------------------------------

function isPrismaNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  );
}

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}
