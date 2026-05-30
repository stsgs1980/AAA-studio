import { success } from '@/lib/api-error';

export async function GET() {
  return success({
    status: 'ok',
    version: '0.1.0-alpha',
    timestamp: new Date().toISOString(),
  });
}
