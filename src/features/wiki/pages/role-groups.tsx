import { WikiCallout } from "../components/wiki-callout";

export function RoleGroupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Role Groups</h2>
        <p className="mt-1 text-sm text-text-muted">
          8 functional domains for agent classification
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Role groups define an agent&apos;s functional domain within the system.
        Each group comes with tailored prompt templates, scoring weights, and
        recommended tools. Assigning the correct role group ensures the agent
        operates within its intended scope.
      </p>

      <div className="space-y-3">
        {[
          { name: "Strategy", color: "text-brand-purple", desc: "High-level planning and decision-making. Typical agents: Supervisor, Chief Architect.", icon: "S" },
          { name: "Tactics", color: "text-brand-accent", desc: "Translates strategy into actionable plans. Typical agents: Coordinator, Sprint Planner.", icon: "T" },
          { name: "Execution", color: "text-brand-green", desc: "Performs specific tasks using tools and APIs. Typical agents: Code Writer, Data Analyst.", icon: "E" },
          { name: "Control", color: "text-brand-amber", desc: "Monitors execution quality and enforces constraints. Typical agents: QA Reviewer, Gatekeeper.", icon: "C" },
          { name: "Memory", color: "text-brand-cyan", desc: "Manages context, knowledge retrieval, and state. Typical agents: Context Manager, RAG Retriever.", icon: "M" },
          { name: "Communication", color: "text-brand-accent", desc: "Handles inter-agent messaging and user interaction. Typical agents: Translator, Summarizer.", icon: "Com" },
          { name: "Interface", color: "text-brand-purple", desc: "Bridges the system with external tools and APIs. Typical agents: API Gateway, Browser Agent.", icon: "I" },
          { name: "Security", color: "text-brand-red", desc: "Enforces safety policies, sanitizes inputs, and audits outputs. Typical agents: Input Guard, Output Filter.", icon: "Sec" },
        ].map((group) => (
          <div
            key={group.name}
            className="flex gap-3 rounded-md border border-midnight-border p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-midnight-elevated text-xs font-bold text-text-primary">
              {group.icon}
            </div>
            <div>
              <p className={`text-sm font-semibold ${group.color}`}>
                {group.name}
              </p>
              <p className="text-sm text-text-secondary">{group.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <WikiCallout variant="info" title="Custom Roles">
        You can create custom role groups to match your domain. Custom roles
        inherit default scoring dimensions but allow you to override weights
        and add domain-specific evaluation criteria.
      </WikiCallout>
    </div>
  );
}
