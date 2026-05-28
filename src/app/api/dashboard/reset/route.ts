import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/** POST /api/dashboard/reset — clear all data from all tables. */
export async function POST() {
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
