import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const tables = ['Agent', 'AgentExecution', 'Flow', 'FlowVersion', 'PipelineExecution', 'PromptTemplate', 'KnowledgeCollection', 'KnowledgeDocument', 'Skill', 'Standard', 'AuditLog', 'Settings'];
  for (const t of tables) {
    try {
      const count = await (db as any)[t].count();
      console.log(t + ': ' + count);
    } catch(e: any) { console.log(t + ': ERROR ' + e.message?.slice(0,50)); }
  }
  await db.$disconnect();
}
main();
