import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('3a-session')?.value;
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/** POST /api/dashboard/reset — clear all data from all tables. */
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  try {
    const order = [
      'agentExecution',
      'pipelineExecution',
      'flowVersion',
      'flow',
      'knowledgeDocument',
      'knowledgeCollection',
      'promptTemplate',
      'skill',
      'standard',
      'auditLog',
      'settings',
      'agent',
    ] as const;

    for (const model of order) {
      await (db[model as keyof typeof db] as { deleteMany: () => Promise<unknown> }).deleteMany();
    }

    return NextResponse.json({ message: 'All data cleared' });
  } catch (error) {
    console.error('[POST /api/dashboard/reset]', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
