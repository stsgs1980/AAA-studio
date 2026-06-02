/** Flow Assistant 5-stage wizard — stage definitions + types */

export interface Choice { id: string; label: string; desc: string; icon?: string }
export interface Stage {
  id: string; title: string; question: string;
  multi?: boolean; choices: Choice[];
}

export const STAGES: Stage[] = [
  {
    id: 'goal', title: 'Goal',
    question: 'What task should your AI flow solve?',
    choices: [
      { id: 'qa', label: 'Q&A', desc: 'Answer questions from a knowledge base', icon: 'HelpCircle' },
      { id: 'content', label: 'Content Generation', desc: 'Create text, summaries, translations', icon: 'PenLine' },
      { id: 'analysis', label: 'Data Analysis', desc: 'Analyze, classify, extract information', icon: 'BarChart3' },
      { id: 'automation', label: 'Automation', desc: 'Automate multi-step workflows', icon: 'Workflow' },
      { id: 'chatbot', label: 'Chatbot', desc: 'Conversational AI with memory', icon: 'MessageCircle' },
      { id: 'custom', label: 'Custom', desc: 'Build from scratch with full control', icon: 'Settings2' },
    ],
  },
  {
    id: 'architecture', title: 'Architecture',
    question: 'How should your flow be structured?',
    choices: [
      { id: 'linear', label: 'Linear Pipeline', desc: 'Straight path: Input → Process → Output', icon: 'ArrowRight' },
      { id: 'branching', label: 'Branching', desc: 'Condition-based routing with multiple paths', icon: 'GitBranch' },
      { id: 'parallel', label: 'Parallel', desc: 'Multiple agents working simultaneously', icon: 'Columns' },
      { id: 'router', label: 'Router-Based', desc: 'Smart routing to specialized handlers', icon: 'Route' },
    ],
  },
  {
    id: 'features', title: 'Features',
    question: 'What capabilities should your flow have?',
    multi: true,
    choices: [
      { id: 'faq', label: 'FAQ / Knowledge', desc: 'Retrieve from documents or KB' },
      { id: 'search', label: 'Web Search', desc: 'Search the internet for info' },
      { id: 'api', label: 'External API', desc: 'Call external services' },
      { id: 'memory', label: 'Dialog Memory', desc: 'Remember conversation context' },
      { id: 'files', label: 'File Processing', desc: 'Upload and process documents' },
      { id: 'thinking', label: 'Multi-step Thinking', desc: 'Chain-of-thought reasoning' },
      { id: 'transform', label: 'Data Transform', desc: 'Format, clean, restructure data' },
      { id: 'approval', label: 'Human Approval', desc: 'Gate requiring human sign-off' },
    ],
  },
  {
    id: 'config', title: 'Configuration',
    question: 'Configure your flow settings',
    choices: [
      { id: 'gpt-4o', label: 'GPT-4o', desc: 'Best overall quality' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast and cost-effective' },
      { id: 'claude-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Strong reasoning' },
      { id: 'claude-haiku', label: 'Claude 3 Haiku', desc: 'Ultra-fast responses' },
      { id: 'later', label: 'Decide Later', desc: 'Choose after building' },
    ],
  },
  {
    id: 'review', title: 'Review',
    question: 'Review your choices and generate the flow',
    choices: [],
  },
];

/** Human-readable labels for answer values. */
export const LABELS: Record<string, Record<string, string>> = {
  goal: { qa: 'Q&A', content: 'Content Generation', analysis: 'Data Analysis', automation: 'Automation', chatbot: 'Chatbot', custom: 'Custom' },
  architecture: { linear: 'Linear Pipeline', branching: 'Branching', parallel: 'Parallel', router: 'Router-Based' },
  features: { faq: 'FAQ / Knowledge', search: 'Web Search', api: 'External API', memory: 'Dialog Memory', files: 'File Processing', thinking: 'Multi-step Thinking', transform: 'Data Transform', approval: 'Human Approval' },
  config: { 'gpt-4o': 'GPT-4o', 'gpt-4o-mini': 'GPT-4o Mini', 'claude-sonnet': 'Claude 3.5 Sonnet', 'claude-haiku': 'Claude 3 Haiku', later: 'Decide Later' },
};
