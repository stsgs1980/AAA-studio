import { describe, it, expect } from 'vitest';
import { AppError, NotFound, BadRequest, Unauthorized, Forbidden, Conflict, handleError } from './api-error';
import { ZodError, ZodIssue } from 'zod';

describe('AppError', () => {
  it('creates with default values', () => {
    const err = new AppError('test');
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.details).toBeUndefined();
  });

  it('creates with custom values', () => {
    const err = new AppError('custom', 400, 'CUSTOM', { foo: 'bar' });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('CUSTOM');
    expect(err.details).toEqual({ foo: 'bar' });
  });
});

describe('Convenience constructors', () => {
  it('NotFound defaults', () => {
    const err = NotFound();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
  });

  it('NotFound custom message', () => {
    const err = NotFound('Agent not found');
    expect(err.message).toBe('Agent not found');
  });

  it('BadRequest with details', () => {
    const err = BadRequest('Invalid input', { field: 'name' });
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'name' });
  });

  it('Unauthorized defaults', () => {
    const err = Unauthorized();
    expect(err.statusCode).toBe(401);
  });

  it('Forbidden defaults', () => {
    const err = Forbidden();
    expect(err.statusCode).toBe(403);
  });

  it('Conflict defaults', () => {
    const err = Conflict();
    expect(err.statusCode).toBe(409);
  });
});

describe('handleError', () => {
  it('handles ZodError', () => {
    const issues: ZodIssue[] = [{
      code: 'invalid_type', expected: 'string', received: 'number',
      path: ['name'], message: 'Expected string'
    }];
    const zodErr = new ZodError(issues);
    const res = handleError(zodErr);
    expect(res.status).toBe(400);
  });

  it('handles AppError', () => {
    const res = handleError(NotFound('Agent missing'));
    expect(res.status).toBe(404);
  });

  it('handles Prisma P2025 not found', () => {
    const prismaErr = { code: 'P2025', message: 'Record not found' };
    const res = handleError(prismaErr);
    expect(res.status).toBe(404);
  });

  it('handles Prisma P2002 unique constraint', () => {
    const prismaErr = { code: 'P2002', message: 'Unique constraint failed' };
    const res = handleError(prismaErr);
    expect(res.status).toBe(409);
  });

  it('handles unknown error as 500', () => {
    const res = handleError(new Error('Something unexpected'));
    expect(res.status).toBe(500);
  });
});
