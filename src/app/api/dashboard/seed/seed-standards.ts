import { db } from '@/lib/db';

/** Seed 17 standards from Zai-agent-toolkit into the database */
export async function seedStandards() {
  const STANDARDS = [
    { id: 'STD-FE-001', name: 'Frontend Development', category: 'architecture', severity: 'error' as const, version: '1.5', description: 'Defines patterns, conventions, and quality gates for frontend code including component architecture, state management, and styling rules.' },
    { id: 'STD-GIT-001', name: 'GitHub Core', category: 'general', severity: 'error' as const, version: '2.0', description: 'Core Git workflow standards including branching strategy, commit conventions, PR templates, and merge policies.' },
    { id: 'STD-GIT-002', name: 'GitHub Sandbox Safety', category: 'general', severity: 'error' as const, version: '1.0', description: 'Safety protocols for sandbox environments including access controls, permission boundaries, and destructive action guards.' },
    { id: 'STD-DOC-002', name: 'Markdown Formatting', category: 'general', severity: 'warning' as const, version: '2.2.0', description: 'Consistent markdown formatting for all documentation including headings, lists, code blocks, and link conventions.' },
    { id: 'STD-DOC-003', name: 'No-Unicode Policy', category: 'general', severity: 'error' as const, version: '2.1.3', description: 'Prohibits unicode escape sequences in source code. Use literal characters or HTML tags instead.' },
    { id: 'STD-DOC-004', name: 'README Template', category: 'general', severity: 'warning' as const, version: '2.1', description: 'Standard README structure with sections for overview, installation, usage, API reference, and contributing guidelines.' },
    { id: 'STD-DOC-005', name: 'Code Examples Guide', category: 'general', severity: 'warning' as const, version: '1.1', description: 'Guidelines for writing clear, runnable code examples with proper imports, error handling, and output demonstration.' },
    { id: 'STD-ARCH-001', name: 'Implementation Order', category: 'architecture', severity: 'warning' as const, version: '2.2', description: 'Defines the build order for implementation phases, dependency chains between components, and what must be completed before proceeding.' },
    { id: 'STD-ENV-001', name: 'Reproducibility', category: 'security', severity: 'error' as const, version: '2.0', description: 'Ensures environments are reproducible through lockfiles, pinned dependencies, container specs, and explicit version declarations.' },
    { id: 'STD-ENV-002', name: 'Z.ai Integration', category: 'security', severity: 'error' as const, version: '1.1', description: 'Integration standards for Z.ai platform including config loading, credential management, sandbox execution, and error handling.' },
    { id: 'STD-TEST-001', name: 'Testing', category: 'quality', severity: 'error' as const, version: '1.1', description: 'Testing requirements including unit test coverage, integration test patterns, assertion standards, and test naming conventions.' },
    { id: 'STD-ERR-001', name: 'Error Handling Core', category: 'quality', severity: 'error' as const, version: '2.0', description: 'Core error handling patterns including typed errors, error propagation, user-facing messages, and structured error responses.' },
    { id: 'STD-ERR-002', name: 'Error Recovery', category: 'quality', severity: 'error' as const, version: '1.0', description: 'Error recovery strategies including retry with backoff, circuit breakers, fallback responses, and graceful degradation.' },
    { id: 'STD-SEC-001', name: 'Security Core', category: 'security', severity: 'error' as const, version: '2.0', description: 'Core security requirements including input validation, output encoding, authentication, authorization, and secret management.' },
    { id: 'STD-SEC-002', name: 'Security Extended', category: 'security', severity: 'error' as const, version: '1.0', description: 'Extended security covering rate limiting, CORS policies, CSP headers, dependency auditing, and penetration testing requirements.' },
    { id: 'STD-AGENT-001', name: 'Subagent Standard', category: 'agent', severity: 'error' as const, version: '1.0', description: 'Standards for AI subagent behavior including tool usage protocols, output format contracts, error reporting, and scope boundaries.' },
    { id: 'STD-AGENT-002', name: 'Orchestration Standard', category: 'agent', severity: 'error' as const, version: '1.0', description: 'Multi-agent orchestration patterns including delegation protocols, handoff formats, conflict resolution, and result aggregation.' },
  ];

  let created = 0;
  for (const std of STANDARDS) {
    const existing = await db.standard.findUnique({ where: { id: std.id } });
    if (!existing) {
      await db.standard.create({
        data: { ...std, rules: JSON.stringify([]) },
      });
      created++;
    }
  }
  return created;
}
