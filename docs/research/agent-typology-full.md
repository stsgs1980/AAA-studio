# AI Agent Typology: Comprehensive Research Report
## For 3A Studio — Agent Generation Tool Development

---

## PART 1: FRAMEWORK-BY-FRAMEWORK ANALYSIS

---

### 1. LANGCHAIN / LANGGRAPH

**Core Philosophy:** LangGraph is a low-level orchestration framework for building stateful agents as directed graphs. LangChain provides the higher-level agent abstractions.

#### Agent Types in LangGraph/LangChain

| Agent Type | How It Works | Prompting Pattern | Tools/Capabilities | Use Cases |
|---|---|---|---|---|
| **ReAct Agent** (`create_react_agent`) | Interleaves **Thought → Action → Observation** in a loop. The LLM decides what to do next based on its reasoning. Explicit thought steps before each tool call. | System prompt instructs: "Think step-by-step about what tool to use and why. Format: Thought: ... Action: ... Observation: ..." The LLM generates structured Thought/Action/Observation blocks. | Any tools (search, calculator, DB, API). Tools are described in a specific format the ReAct parser expects. | General-purpose Q&A, research, multi-step reasoning, coding tasks |
| **Tool-Calling Agent** (`create_tool_calling_agent`) | Relies on the LLM's **native tool/function calling** (OpenAI-style). The model natively outputs tool_use blocks; no thought/reasoning text is required. More efficient — fewer tokens, faster. | System prompt is simpler: "You have access to tools. Use them when needed." The model's native function-calling mechanism handles the decision. No structured Thought/Action/Observation format needed. | Same tools as ReAct, but described via OpenAI function schemas (name, description, parameters). | Same use cases as ReAct but faster; production workloads, structured data tasks |
| **Structured Chat Agent** | Specialized for multi-input tools. Parses user input to extract structured arguments for tools before calling them. | System prompt includes instructions for extracting arguments from natural language and mapping to tool parameters. Includes examples of expected structured output. | Tools with complex multi-parameter inputs (e.g., search engines, database queries). | Tasks requiring structured parameter extraction from natural language |
| **Plan-and-Execute Agent** | Two-phase: (1) **Planner** creates a high-level plan, (2) **Executor** carries out each step. Can re-plan after execution. | **Planner prompt**: "Break down the user's request into a step-by-step plan. Output the plan as a numbered list." **Executor prompt**: "Execute step N of the plan: [step description]. Use tools as needed." | Tools + plan state tracking. Executor has access to tools; planner has access to prior plans and outcomes. | Complex multi-step tasks where upfront planning helps (reports, research, code generation) |

#### Key Prompting Differences (LangChain)

**ReAct vs Tool-Calling — the critical difference:**
- **ReAct**: Requires a `system_prompt` that explicitly teaches the model the Thought/Action/Observation pattern. The output parser expects specific formatting. More tokens consumed per step because the model generates reasoning text.
- **Tool-Calling**: Leverages the model's native `tool_choice` parameter. The system prompt just needs to describe available tools and overall mission. The model natively decides when to call a tool vs respond with text. Significantly fewer tokens and faster.

#### LangGraph-Specific Patterns

LangGraph goes beyond single agents to define **graph-based workflows**:

| Pattern | Description |
|---|---|
| **Simple StateGraph** | Nodes = LLM calls or tool calls; edges = transitions. A linear chain of nodes with conditional branching. |
| **Tool Node** | A node that runs tool calls based on the LLM's output, then returns results. |
| **Human-in-the-loop** | Adds `interrupt_before` or `interrupt_after` on nodes to pause for human approval. |
| **Subgraph / Multi-Agent** | Agents as nodes in a larger graph. Each agent is its own stateful subgraph. |
| **Memory/Checkpointing** | Thread-scoped state persisted across turns. Each turn can access and modify shared state. |

**Practical prompt structure for a LangGraph ReAct agent:**
```
You are a helpful assistant with access to the following tools:
{tools_description}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!
```

---

### 2. CREWAI

**Core Philosophy:** Agents as **role-playing team members**. Each agent has a persona defined by `role`, `goal`, `backstory`. Collaboration patterns orchestrate how agents delegate and work together.

#### Agent Types & Roles

| Agent Type | How It Works | Prompting Pattern | Tools/Capabilities | Use Cases |
|---|---|---|---|---|
| **Researcher** | Investigates topics, gathers information, synthesizes findings. One of CrewAI's predefined roles. | System prompt: "You are a {role}. Your goal is {goal}. Your backstory: {backstory}." The role/goal/backstory construct creates a narrative persona. Backstory provides context and expertise framing. | Web search, document readers, database queries, knowledge base tools. | Market research, competitor analysis, academic literature review |
| **Analyst** | Evaluates data, performs critical analysis, produces structured insights. | Same role/goal/backstory structure but the **goal** focuses on analysis: "Analyze the gathered information and produce structured insights." | Data analysis tools, charting/visualization, spreadsheet tools, statistical tools. | Data analysis, business intelligence, report generation |
| **Writer** | Creates content based on research and analysis outputs. Takes structured input and produces polished prose. | Goal: "Write compelling, accurate content based on the provided research." Backstory establishes writing style, tone, audience awareness. | Text editors, formatting tools, grammar checkers, CMS publishing tools. | Blog posts, reports, documentation, marketing copy |
| **Manager** (Hierarchical Process) | Orchestrator in hierarchical mode. Assigns tasks to workers, reviews outputs, delegates further. | System prompt emphasizes: "Your role is to manage a team. Delegate tasks to the appropriate specialist. Review their work and request revisions if needed." | Task delegation interface (built-in), ability to send tasks to subordinate agents. | Project management, complex multi-step workflows |
| **Custom Agent** | Any user-defined role. The `role`, `goal`, `backstory` pattern is fully flexible. | Developer provides custom `role` (e.g., "Senior Python Architect"), `goal` (e.g., "Design scalable system architectures"), `backstory` (e.g., "15 years of distributed systems experience..."). | Any tools — CrewAI has a rich tool ecosystem plus custom tools. | Domain-specific tasks, specialized roles |

#### CrewAI Collaboration/Delegation Patterns

| Pattern | Description | Prompting Implications |
|---|---|---|
| **Sequential** | Agents execute in order. Agent A → Agent B → Agent C. Output of A becomes context for B. | Each agent's prompt includes the previous agent's output as context. Each agent sees only its predecessor's work. |
| **Hierarchical** | A manager agent delegates tasks to worker agents. Manager reviews and can re-delegate. | Manager's system prompt includes delegation instructions. Workers' prompts are self-contained for their specific task. Manager sees all outputs. |
| **Collaborative (Round-Robin)** | Agents discuss in a loop, building on each other's outputs until consensus or max iterations. | Each agent's prompt includes the full conversation history. The system prompt should encourage building on others' ideas and constructive critique. |
| **Delegation** | Any agent can delegate a subtask to another agent mid-execution (if `allow_delegation=True`). | Agent prompts include knowledge of available teammates: "You can delegate to [other_agent] if you need help with [their specialty]." |

#### Key Prompting Differences (CrewAI)

**CrewAI's unique system prompt structure:**
```
# ROLE
{role_name}

# GOAL  
{goal_description}

# BACKSTORY
{rich_backstory_providing_context_and_personality}

# AVAILABLE TOOLS
{tools_descriptions}

# COLLABORATION CONTEXT
[If sequential]: "After you complete your task, your output will be passed to {next_agent}."
[If hierarchical]: "You report to {manager}. You may be assigned tasks by {manager}."
[If delegation enabled]: "You can delegate tasks to {available_agents} when you need specialized help."

# TASK
{current_task_description}
```

**Critical insight:** CrewAI's `backstory` field is its most distinctive prompting feature. A well-crafted backstory (3-5 sentences of domain expertise, personality, constraints) significantly affects output quality. This is what differentiates CrewAI from other frameworks — it's essentially **persona-driven prompting**.

---

### 3. AUTOGEN (Microsoft)

**Core Philosophy:** Conversation-driven multi-agent framework. Everything is a conversation between agents. The fundamental building block is the `ConversableAgent`.

#### Agent Types

| Agent Type | How It Works | Prompting Pattern | Tools/Capabilities | Use Cases |
|---|---|---|---|---|
| **ConversableAgent** (Base) | Can both send and receive messages. Supports LLM calls, tool execution, and human input. Configurable via `system_message`. | `system_message`: The agent's core personality and behavior instructions. Defines what it should do, how it should respond, what tools it can use. | Any tools registered via `register_for_llm()` and `register_for_execution()`. Also supports `function_call` for native tool calling. | Foundation for all agent types; general-purpose |
| **AssistantAgent** (Subclass) | LLM-backed agent that generates text and tool calls. Does NOT execute code. Designed to always respond with LLM output. | Default system message: "You are a helpful AI assistant. You can help with coding, analysis, and general questions. When asked to write code, suggest code but do not execute it." | Can suggest tool/code calls but relies on partner agents for execution. | Research, analysis, code suggestion, planning |
| **UserProxyAgent** (Subclass) | Human-in-the-loop agent. Can execute code automatically (detects executable code blocks) or ask for human input. | Usually no LLM/no system message. When human_input_mode is "ALWAYS", it simply passes human input. When "NEVER", it auto-executes code blocks it receives. | Code execution environment, human input collection. Automatically runs Python code from messages. | Running code, providing human feedback, executing tool results |
| **GroupChatManager** | Orchestrates group conversations. Selects which agent speaks next based on conversation context. | Internal system message with list of participating agents and their descriptions. Uses LLM to select the next speaker. | Selection mechanism (can be round-robin, LLM-based, or custom function). | Managing multi-agent discussions, facilitating group chats |

#### Conversation Patterns (AutoGen's Core Orchestration)

| Pattern | Description | Prompting Implications |
|---|---|---|
| **Two-Agent Chat** | Simple back-and-forth between two agents until termination condition. | Each agent's `system_message` defines its role in the conversation. The conversation history is passed as messages. |
| **Sequential Chat** | A → B → C → D. Each pair has its own chat context. Output of one chat is summarized and passed to next. | Each agent's system prompt is scoped to its specific conversation. The handoff between chats involves a summary, not full history. |
| **Group Chat** | Multiple agents in a room. GroupChatManager decides who speaks next. All agents see the full history. | Each agent's `system_message` should be concise since it sees ALL messages. Should indicate when it's relevant to speak vs stay silent. |
| **Nested Chat** | Agent A initiates a private sub-conversation between agents X and Y, then returns the result to the outer chat. | Inner agents' system messages are isolated from outer chat. The outer agent sees only the result. Useful for private deliberation. |

#### Key Prompting Differences (AutoGen)

**AutoGen's system_message structure:**
```python
assistant = ConversableAgent(
    name="Researcher",
    system_message="""You are a research specialist. 
    Your job is to thoroughly investigate the topic and provide detailed findings.
    When you have sufficient information, clearly state your conclusions.
    If you need clarification, ask the user directly.
    Always cite your sources.""",
    llm_config={"config_list": config_list},
    tools=[search_tool],
)
```

**Critical insight:** AutoGen's `system_message` vs `description` distinction is important. In GroupChat, the `description` field (short, ~1 line) is what the GroupChatManager sees to decide who speaks next. The `system_message` (full, multi-paragraph) is what the agent itself sees. Best practice:
- `description`: "Senior researcher specializing in web searches and data analysis"
- `system_message`: [Full detailed instructions about behavior, constraints, output format]

**Termination conditions** in AutoGen are also prompt-adjacent:
- `max_consecutive_auto_reply` — limits agent autonomy
- `is_termination_msg` — custom function that checks if the conversation should end
- Human input mode controls when humans intervene

---

### 4. ANTHROPIC / CLAUDE PATTERNS

**Core Philosophy:** Anthropic's famous "Building Effective Agents" article (Dec 2024) argues for **simplicity over complexity**. They explicitly categorize systems into **Workflows** (predefined code paths) vs **Agents** (dynamic LLM-directed processes).

#### Anthropic's Pattern Taxonomy

| Pattern | Type | How It Works | Prompting Pattern | Use Cases |
|---|---|---|---|---|
| **Augmented LLM** | Building Block | Single LLM call enhanced with retrieval, tools, memory via MCP. | Straightforward system prompt describing capabilities. Tool descriptions provided via API tool definitions, not in the system prompt itself. | Every agent application starts here. If this works, you don't need more. |
| **Prompt Chaining** | Workflow | Sequential LLM calls, each processing the previous output. Programmatic checks ("gates") between steps. | Each step has its own focused prompt. Gate checks are programmatic (code), not LLM calls. Each step is simpler because it handles a subtask. | Marketing copy → translation. Outline → verify → write document. |
| **Routing** | Workflow | Classify input → direct to specialized prompt/path. | **Router prompt**: "Classify this input into one of: [categories]. Output ONLY the category name." Each downstream path has a specialized prompt optimized for that category. | Customer service routing (general vs refund vs technical). Easy questions to Haiku, hard to Sonnet. |
| **Parallelization (Sectioning)** | Workflow | Split task into independent subtasks → run LLM calls in parallel → aggregate. | Each parallel branch has a focused prompt for its subtask. The aggregation step can be LLM-based or programmatic. | Guardrails (one model for content, another for safety). Multi-aspect evaluation. |
| **Parallelization (Voting)** | Workflow | Run the same task multiple times → aggregate by voting/majority. | Same prompt template run N times, possibly with variations. Aggregation can be majority vote, threshold, or another LLM call. | Code vulnerability review (flag if any reviewer finds issue). Content moderation (flag if N/M vote inappropriate). |
| **Orchestrator-Workers** | Workflow | Central LLM dynamically breaks down task → delegates to workers → synthesizes results. | **Orchestrator prompt**: "Break down this task into subtasks and delegate each to a worker. Synthesize worker results into a final answer." **Worker prompt**: "Execute the following subtask: {subtask}. Use available tools." | Coding (many files to change). Multi-source research. |
| **Evaluator-Optimizer** | Workflow | One LLM generates response → another evaluates → loop until satisfactory. | **Generator prompt**: "Produce [output type] for [task]." **Evaluator prompt**: "Evaluate this [output] against criteria: [criteria]. Provide specific feedback for improvement. Score: [1-10]." | Literary translation refinement. Complex search requiring multiple rounds. |
| **Autonomous Agent** | Agent | LLM in a loop with tools, deciding its own path. Gains ground truth from environment each step. Can pause for human feedback. | System prompt defines: (1) Overall mission, (2) Available tools with clear descriptions, (3) Planning protocol, (4) When to ask for help, (5) Stopping conditions. **Critical**: Tool descriptions are prompt-engineered as carefully as the system prompt itself ("ACI" — Agent-Computer Interface). | SWE-bench coding. Computer use (Claude controlling a GUI). Open-ended tasks with unpredictable steps. |

#### Anthropic's Tool Prompting Philosophy (Critical for 3A Studio)

Anthropic explicitly states: **"We spent more time optimizing our tools than the overall prompt."** Key principles:

1. **Put yourself in the model's shoes**: Is it obvious how to use this tool from the description alone?
2. **Good tool definitions include**: Example usage, edge cases, input format requirements, clear boundaries from other tools.
3. **Poka-yoke your tools**: Design arguments to prevent common mistakes. (E.g., always require absolute filepaths, not relative.)
4. **Token thinking space**: Give the model room to think before committing to tool calls.
5. **Natural formats**: Keep tool formats close to what the model has seen in natural text on the internet.
6. **Minimize overhead**: Avoid formats that require extra escaping, counting, or boilerplate.

#### Key Prompting Differences (Anthropic)

Anthropic's system prompt for their SWE-bench coding agent follows this structure:
```
You are a software engineer working on a GitHub issue.

# Context
{repository structure, relevant files}

# Your Task  
{issue description}

# Available Tools
- read_file(path): Read a file's contents
- write_file(path, content): Write/overwrite a file  
- run_command(cmd): Execute a shell command
- search_files(pattern): Search for patterns in the codebase

# Instructions
1. First, understand the codebase structure
2. Identify the files that need to be changed
3. Plan your changes
4. Implement changes step by step
5. Run tests to verify
6. If tests fail, debug and fix
7. Report what you changed

# Constraints
- Always use absolute paths
- Run tests after every change
- If you're stuck after 3 attempts, describe what you've tried
```

---

### 5. OPENAI AGENTS SDK

**Core Philosophy:** Agents as LLMs configured with **instructions, tools, and handoffs**. Minimalist abstraction. Three core primitives: Agent, Handoff, Guardrail.

#### Agent Architecture

| Component | Description |
|---|---|
| **Agent** | LLM + instructions (system prompt) + tools + optional handoffs, guardrails, structured outputs |
| **Handoff** | Mechanism for transferring control from one agent to another. The LLM decides when to hand off based on the handoff's description. |
| **Guardrail** | Input/output validators that can modify, reject, or redirect agent interactions. |
| **Agent-as-Tool** | An agent registered as a tool for another agent to call. Creates orchestrator-subagent pattern. |

#### Agent Types / Patterns

| Agent Type | How It Works | Prompting Pattern | Tools/Capabilities | Use Cases |
|---|---|---|---|---|
| **Single Agent** | LLM with instructions and tools. Runs in a loop until it produces a final response or calls tools. | `instructions` parameter: The system prompt. Defines what the agent does, how to use tools, and when to stop. | Any tools (OpenAI function calling format). File search, code execution, web browsing, etc. | Simple tasks: customer service, Q&A, single-step actions |
| **Orchestrator (Handoff)** | Triage agent that routes to specialized agents via `handoff()`. Each specialist handles one domain. | **Orchestrator instructions**: "You are a triage agent. Analyze the user's request and hand off to the appropriate specialist. Available specialists: {list with descriptions of each}." **Specialist instructions**: Focused system prompt for their domain only. | Orchestrator typically has no tools (just handoffs). Specialists have domain-specific tools. | Customer service triage. Multi-department workflows. |
| **Agent-as-Tool** | Orchestrator calls sub-agents as tools (`.asTool()`). Unlike handoffs, the sub-agent returns to the orchestrator after completing. | **Orchestrator instructions**: "Use the available specialist tools to gather information, then synthesize a final answer." **Sub-agent instructions**: "You are a specialist in {domain}. Complete the specific subtask and return results." | Orchestrator has sub-agents as tools. Sub-agents have their own tools. | Research agents, code review pipelines, multi-source synthesis |
| **Guarded Agent** | Agent with input/output guardrails that validate and potentially modify interactions. | Guardrails are defined via separate functions/classes. The agent's instructions may reference guardrail behavior: "If the user's input is invalid, explain what's wrong." | Tools + guardrail validators on inputs and outputs. | Production deployments, safety, compliance. |

#### Key Prompting Differences (OpenAI Agents SDK)

**Handoff-based system prompt structure:**
```python
# Triage agent
triage_agent = Agent(
    name="Triage Agent",
    instructions="""You are a customer service triage agent.
    
    Analyze the user's request and hand off to the appropriate specialist:
    - For billing issues → hand off to BillingAgent
    - For technical support → hand off to TechSupportAgent  
    - For general questions → answer directly
    
    Only hand off when you're confident in the classification.
    If unsure, ask the user a clarifying question first.""",
    tools=[],  # No tools, just handoffs
    handoffs=[billing_agent, tech_agent],
)

# Specialist agent
billing_agent = Agent(
    name="Billing Agent",
    instructions="""You are a billing specialist.
    
    Your job is to help customers with billing issues:
    - Explain charges on their bill
    - Process refund requests
    - Update payment methods
    
    Available tools: look_up_account, process_refund, update_payment
    Always verify the customer's identity before making changes.""",
    tools=[look_up_account, process_refund, update_payment],
)
```

**Handoff vs Agent-as-Tool — key difference:**
- **Handoff**: Full transfer of control. The receiving agent takes over the conversation. The original agent is done.
- **Agent-as-Tool**: The sub-agent completes a task and returns results. The orchestrator remains in control and continues synthesizing.

---

### 6. GOOGLE ADK (Agent Development Kit)

**Core Philosophy:** Multi-agent-first framework with three core agent types. Built around **adapters** for different LLM backends.

#### Core Agent Types

| Agent Type | How It Works | Prompting Pattern | Tools/Capabilities | Use Cases |
|---|---|---|---|---|
| **LlmAgent** | Standard LLM-based agent with tools. Uses Gemini or other models for reasoning and action. | `instruction` parameter serves as system prompt. Includes tool descriptions. Can include multi-turn context management. | Any tools via the ADK tool system. Google Search, code execution, custom tools. | General-purpose agent tasks, conversational AI, tool-using agents |
| **HumanAgent** | Represents a human participant in a multi-agent system. Routes decisions to human input. | No LLM prompt. Instead, instructions define what the human should be asked and how their input should be processed. | Human input interface. Can be terminal, web UI, or API. | Human-in-the-loop workflows, approval gates, expert consultation |
| **ToolAgent** (Custom) | Agents built from custom logic, not LLMs. Execute deterministic code. | No system prompt. Defined via callbacks and Python functions. | Custom Python functions, API calls, deterministic logic. | Deterministic sub-steps, API integrations, data processing |

#### Google ADK Multi-Agent Patterns (8 patterns documented)

| Pattern | Description |
|---|---|
| **Sequential Pipeline** | Agents execute in order, each processing the previous agent's output. |
| **Parallel Fan-Out** | A coordinator sends tasks to multiple agents simultaneously, then aggregates. |
| **Hierarchical** | Manager agent delegates to worker agents, monitors progress, synthesizes results. |
| **Peer-to-Peer** | Agents communicate directly without a central coordinator. |
| **Blackboard** | Shared state (blackboard) that agents read from and write to. |
| **Mixture of Agents** | Multiple agents each produce an answer, then a synthesizer produces final output. |
| **Agent Swarm** | Many identical agents work on subtasks from a shared queue. |
| **Reflect & Improve** | Agent produces output, then a reflection agent critiques and triggers revision. |

---

### 7. AMAZON BEDROCK AGENTS

**Core Philosophy:** Managed service approach. Agents are defined by **instruction, action groups (tools), and knowledge bases**. Multi-agent collaboration (MAC) added in 2025.

#### Agent Architecture

| Component | Description |
|---|---|
| **Agent** | LLM + instructions + action groups + knowledge bases. Orchestrates tool calls and reasoning. |
| **Action Group** | Collection of related tools/APIs that the agent can invoke. Defined via OpenAPI schemas. |
| **Knowledge Base** | Connected data source (S3, web pages) for RAG retrieval. |
| **Supervisor Agent** | (MAC) Routes tasks to specialized sub-agents. |
| **Sub-Agent** | (MAC) Specialized agent that handles a specific domain/task type. |

#### Key Prompting Differences (Bedrock)

Bedrock uses **instruction** as the system prompt:
```json
{
  "instruction": "You are a customer service agent for Acme Corp. 
   Help customers with orders, returns, and product questions.
   Always verify customer identity before sharing account details.
   Use the available tools to look up orders and process returns.",
  "actionGroups": [
    {
      "actionGroupName": "OrderTools",
      "description": "Tools for looking up and managing orders",
      "actionSchema": { "$ref": "openapi-schema.json" }
    }
  ],
  "knowledgeBases": [
    { "knowledgeBaseId": "kb-123", "description": "Product catalog and FAQs" }
  ]
}
```

---

## PART 2: CROSS-FRAMEWORK PATTERN TAXONOMY

### The 10 Fundamental Agent Architectural Patterns

Based on synthesizing all frameworks, academic literature, and Anthropic's taxonomy:

| # | Pattern Name | Core Loop | Who Decides Next Step? | When to Use | Prompting Signature |
|---|---|---|---|---|---|
| 1 | **Augmented LLM** | Single LLM call + tools | Model (one-shot) | Simple tasks, RAG, basic tool use | "You are {role}. You have access to {tools}. Help with {task}." |
| 2 | **Prompt Chaining** | Sequential LLM calls with gates | Code (predefined) | Multi-step pipelines with verification | Each step: focused subtask prompt. Gates: programmatic checks. |
| 3 | **Router / Classifier** | Classify → route to specialist | Model (classification) or code | Different inputs need different handling | Router: "Classify into {categories}." Each branch: specialist prompt. |
| 4 | **ReAct Loop** | Thought → Action → Observation → repeat | Model (decides each step) | General-purpose multi-step reasoning | "Think step by step. Format: Thought/Action/Observation." |
| 5 | **Tool-Calling Agent** | Model calls tools natively → loop | Model (native function calling) | Production tool-using agents | "You have tools: {descriptions}. Use them when helpful." |
| 6 | **Plan-and-Execute** | Plan (once) → Execute (step by step) → Re-plan if needed | Model plans; code orchestrates execution | Complex tasks benefiting from upfront planning | Planner: "Create a step-by-step plan." Executor: "Execute step N." |
| 7 | **Orchestrator-Workers** | Orchestrator delegates → workers execute → orchestrator synthesizes | Orchestrator model (dynamic) | Tasks with unpredictable subtasks (coding, research) | Orchestrator: "Break down task and delegate." Worker: "Execute subtask {task}." |
| 8 | **Evaluator-Optimizer** | Generate → Evaluate → Revise → repeat | Evaluator model decides if good enough | Tasks with clear quality criteria, iterative improvement | Generator: "Produce {output}." Evaluator: "Score 1-10, give feedback." |
| 9 | **Parallel / Voting** | Multiple LLM calls in parallel → aggregate | Code dispatches; model or code aggregates | Need diverse perspectives or speed | Same or varied prompt across N instances. Aggregator merges. |
| 10 | **Autonomous Agent** | LLM in open-ended loop with tools | Model (fully autonomous) | Open-ended tasks, unpredictable steps, trusted environments | Full system prompt with: mission, tools, planning protocol, constraints, stop conditions. |

---

## PART 3: SYSTEM PROMPT PATTERNS FOR 3A STUDIO

### What Goes Into Each Agent Type's System Prompt

Below is the **practical template** for what should go into each agent type's system prompt when building 3A Studio.

### A. SINGLE-TOOL USER (Augmented LLM)
```yaml
system_prompt_template:
  identity: "You are a {role} that helps users with {domain}."
  capabilities: "You have access to the following tools: {tool_descriptions}"
  task: "Help the user with their {task_type} request."
  constraints: 
    - "Always use {tool} when you need {specific_info}."
    - "If you don't know something, say so rather than guessing."
  output_format: "Respond in {format}. {format_guidelines}"
```

### B. REACT AGENT
```yaml
system_prompt_template:
  identity: "You are a {role} that solves problems step by step."
  reasoning_framework: |
    You MUST follow this format exactly:
    Thought: [your reasoning about what to do next]
    Action: [tool_name]
    Action Input: [input for the tool]
    Observation: [result of the tool - will be provided]
    ... repeat until you have enough information ...
    Thought: I now have the final answer
    Final Answer: [your answer]
  tools: "{tool_names_and_descriptions}"
  constraints:
    - "Always reason before acting."
    - "Use one tool at a time."
    - "If a tool returns an error, think about why and try a different approach."
  output_format: "After completing all necessary steps, provide a Final Answer."
```

### C. TOOL-CALLING AGENT (Native Function Calling)
```yaml
system_prompt_template:
  identity: "You are a {role} with expertise in {domain}."
  capabilities: "You have access to tools. Use them when they would help answer the user's question or complete their request."
  task: "Help the user with {task_type} by using the most appropriate tools."
  tool_usage_guidance:
    - "Call tools when you need information you don't have."
    - "You can call multiple tools in one response if they're independent."
    - "After receiving tool results, reason about them before responding."
    - "If tool results are insufficient, try a different tool or approach."
  constraints: "{domain_specific_rules}"
  output_format: "Respond conversationally, citing tool results when relevant."
```

### D. PLAN-AND-EXECUTE PLANNER
```yaml
system_prompt_template:
  identity: "You are an expert planner for {domain} tasks."
  task: "Create a detailed, step-by-step plan to accomplish the following goal: {user_goal}"
  plan_format: |
    Output your plan as a numbered list:
    1. [Step description] - [expected tool/resources needed]
    2. [Step description] - [expected tool/resources needed]
    ...
  constraints:
    - "Each step should be atomic and independently executable."
    - "Consider dependencies between steps."
    - "Order steps logically."
    - "Include verification steps where appropriate."
  output_format: "Output ONLY the plan, nothing else."
```

### E. PLAN-AND-EXECUTE EXECUTOR
```yaml
system_prompt_template:
  identity: "You are a task executor. You receive individual steps from a plan and carry them out."
  current_task: "Execute step {N}/{total}: {step_description}"
  tools: "{available_tools}"
  constraints:
    - "Focus only on the current step."
    - "Use the appropriate tools for this step."
    - "If you encounter an error, describe it clearly."
    - "Don't skip ahead to other steps."
  output_format: "Provide the result of this step, including any tool outputs."
```

### F. ORCHESTRATOR / MANAGER
```yaml
system_prompt_template:
  identity: "You are a {role} manager overseeing a team of specialists."
  task: "Analyze the user's request, break it into subtasks, and delegate to the appropriate team member."
  team_description: |
    Your team members:
    - {agent_1_name}: {description of what they do}
    - {agent_2_name}: {description of what they do}
    - {agent_3_name}: {description of what they do}
  delegation_protocol:
    - "Identify which subtasks are needed."
    - "For each subtask, select the best team member."
    - "Delegate with a clear, specific instruction."
    - "After all subtasks complete, synthesize results into a coherent response."
  constraints:
    - "Delegate one subtask at a time."
    - "Each delegation should be self-contained."
    - "If a team member's result is unsatisfactory, re-delegate with better instructions."
  output_format: "Present the final synthesized answer to the user."
```

### G. SPECIALIST / WORKER AGENT
```yaml
system_prompt_template:
  identity: "You are a specialist in {specialty} on a team."
  role: "Your expertise: {detailed_expertise_description}"
  backstory: "{2-3 sentences establishing credibility and approach in this domain}"  # CrewAI-style
  task: "You will receive specific subtasks to execute. Complete them to the best of your ability."
  tools: "{domain_specific_tools}"
  constraints:
    - "Focus on your area of expertise."
    - "If a task is outside your expertise, say so."
    - "Provide detailed, accurate results."
  output_format: "{structured_output_format_for_this_domain}"
```

### H. ROUTER / CLASSIFIER AGENT
```yaml
system_prompt_template:
  identity: "You are a routing agent that classifies user requests."
  task: "Analyze the user's message and classify it into exactly one category."
  categories: |
    - {category_1}: {when_to_choose_this_category}
    - {category_2}: {when_to_choose_this_category}
    - {category_3}: {when_to_choose_this_category}
  output_format: "Output ONLY the category name. No explanation."
  constraints:
    - "Choose the single best matching category."
    - "If unsure, choose the closest match."
```

### I. EVALUATOR AGENT
```yaml
system_prompt_template:
  identity: "You are a quality evaluator for {output_type}."
  evaluation_criteria: |
    Evaluate the following {output} against these criteria:
    1. {criterion_1}: {what_good_looks_like}
    2. {criterion_2}: {what_good_looks_like}
    3. {criterion_3}: {what_good_looks_like}
  output_format: |
    Score: [1-10]
    Feedback: [specific, actionable feedback for improvement]
    Pass: [yes/no]
  constraints:
    - "Be specific and constructive in feedback."
    - "Only pass if score >= {threshold}."
```

### J. AUTONOMOUS CODING AGENT
```yaml
system_prompt_template:
  identity: "You are an expert software engineer."
  task: "Resolve the following GitHub issue: {issue_description}"
  context: "{repository_info, relevant_file_list}"
  tools: |
    - read_file(path): Read file contents
    - write_file(path, content): Create/overwrite file
    - run_command(cmd): Execute shell commands
    - search_files(pattern): Search codebase
  protocol: |
    1. Explore the codebase to understand relevant code
    2. Plan your changes
    3. Implement changes one file at a time
    4. Run tests after each change
    5. If tests fail, debug and fix
    6. Summarize all changes made
  constraints:
    - "Always use absolute file paths."
    - "Read a file before editing it."
    - "Run tests after every code change."
    - "If stuck after 3 attempts, report what you tried."
  output_format: "At the end, provide a summary of all files changed and what was modified."
```

---

## PART 4: ACADEMIC / INDUSTRY TAXONOMIES

### Key Papers and Their Classifications

| Source | Taxonomy | Key Dimensions |
|---|---|---|
| **"Large Language Model Agent: A Survey" (Wang et al., 2023/2025)** | 4-module architecture: Perception → Memory → Planning → Action | Planning types: No Planning, Task Decomposition, Reflection/ReAct |
| **"AI Agents vs. Agentic AI: A Conceptual Taxonomy" (arxiv 2505.10468, 2025)** | Distinguishes AI Agents (discrete entities) from Agentic AI (capability continuum) | Agency level, autonomy degree, memory type, tool access |
| **"Agentic AI: Architectures, Taxonomies" (arxiv 2601.12560, 2025)** | 6 modular dimensions: Core Components, Cognitive Architecture, Collaboration, Modality, Domain, Evaluation | Cognitive arch: Single-step, Few-step, Multi-step, Infinite-step; Collaboration: Solo, Duo, Multi-agent |
| **Anthropic "Building Effective Agents" (2024)** | Workflows vs Agents. 5 workflow patterns + 1 agent pattern. | Complexity spectrum: Augmented LLM → Workflows → Agents |
| **MIT AI Agent Index (2025)** | Tracks agent deployments by capability level and domain | Safety, economic impact, capability progression |
| **IBM "What is a ReAct Agent?"** | ReAct as fusion of Chain-of-Thought + Tool Use | Reasoning before action, grounded in observations |
| **"Multi-Agent AI Patterns for Developers" (Suman Das, 2025)** | 6 patterns: Router, Specialist-Performer, Debate, Supervisor, Swarm, Blackboard | Emphasis on real-world developer patterns |

### Canonical Agent Architecture (Consensus Across Literature)

```
┌─────────────────────────────────────────┐
│              AGENT SYSTEM                │
│                                         │
│  ┌─────────┐  ┌──────────────────────┐ │
│  │ Profile │  │    Profiling Module  │ │
│  │  Module │  │ (user/task context) │ │
│  └────┬────┘  └──────────┬───────────┘ │
│       │                  │              │
│  ┌────▼──────────────────▼───────────┐  │
│  │          MEMORY MODULE            │  │
│  │  (short-term + long-term)        │  │
│  └──────────────────┬────────────────┘  │
│                     │                   │
│  ┌──────────────────▼────────────────┐  │
│  │       PLANNING MODULE             │  │
│  │  (ReAct / Plan-and-Execute /    │  │
│  │   Reflection / Decomposition)   │  │
│  └──────────────────┬────────────────┘  │
│                     │                   │
│  ┌──────────────────▼────────────────┐  │
│  │        ACTION MODULE             │  │
│  │  (Tool calling / Code execution/ │  │
│  │   API calls / Environment interaction) │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Planning Strategy Taxonomy (Most Important for Prompting)

| Planning Type | Description | Prompt Implication |
|---|---|---|
| **No Planning** | Single LLM call, no step decomposition | Simple system prompt. No planning instructions needed. |
| **Task Decomposition** | Break task into ordered sub-steps | "First break down the task into steps, then execute each." |
| **ReAct (Reasoning+Acting)** | Interleave thinking and acting | "Think about what to do, act, observe, think again." |
| **Reflection / Self-Critique** | Agent reviews its own output and improves | "After producing output, critique it and improve." |
| **Plan-and-Execute** | Separate planning and execution phases | Two distinct prompt templates (planner + executor). |
| **Debate / Multi-Agent Deliberation** | Multiple agents argue and reach consensus | Each agent gets a stance-specific prompt. |

---

## PART 5: COMPARATIVE MATRIX — WHAT PROMPTING DIFFERS BETWEEN TYPES

| Agent Type | System Prompt Length | Reasoning Instructions | Tool Usage Instructions | Output Format | Collaboration Context | Unique Element |
|---|---|---|---|---|---|---|
| **Augmented LLM** | Short | None | Brief tool list | Free-form | None | Minimal — simplest agent |
| **ReAct Agent** | Medium | Explicit Thought/Action/Observation format | Detailed tool descriptions + when to use each | Structured (Final Answer) | None | Format enforcement in prompt |
| **Tool-Calling Agent** | Short-Medium | None (model decides natively) | Brief tool descriptions | Free-form | None | Relies on model's native function calling |
| **Router** | Short | Classification instructions | Usually none | Category name only | List of downstream agents | Must be concise and decisive |
| **Planner** | Medium | Step-by-step decomposition | May list available tools for planning | Numbered list | May reference executor | Output structure is critical |
| **Executor** | Short-Medium | Focus on current step only | Detailed tool instructions | Step result | Receives plan from planner | Scoped to one task at a time |
| **Orchestrator/Manager** | Long | Task analysis + delegation logic | Usually none (delegates to workers) | Synthesized answer | Full team roster with descriptions | Team management instructions |
| **Specialist/Worker** | Medium | Domain-specific reasoning | Domain-specific tools | Domain format | Part of a team; may receive delegated tasks | Backstory/persona (CrewAI-style) |
| **Evaluator** | Medium | Evaluation criteria + scoring rubric | May test tools | Score + Feedback | Evaluates another agent's output | Rubric-based assessment |
| **Autonomous Agent** | Long | Full planning + reasoning + self-check | Comprehensive tool descriptions + ACI | Mission-dependent | May coordinate with other agents | Stop conditions + error recovery + ground truth loops |

---

## PART 6: RECOMMENDATIONS FOR 3A STUDIO

### Agent Types to Support (Priority Order)

Based on prevalence across frameworks and practical utility:

1. **🔥 Tool-Calling Agent** — The most common modern pattern. Native function calling. All frameworks support it.
2. **🔥 ReAct Agent** — Classic pattern, widely documented. Good for non-function-calling models.
3. **🔥 Router Agent** — Essential for multi-capability systems. Found in every framework.
4. **🔥 Specialist Agent** (CrewAI-style persona) — Unique value prop with backstory-driven prompting.
5. **🔥 Orchestrator + Workers** — The most powerful multi-agent pattern. Essential for complex tasks.
6. **Plan-and-Execute** — Important for complex, predictable tasks.
7. **Evaluator-Optimizer** — Important for quality-critical tasks.
8. **Autonomous Coding Agent** — High-demand use case with specific prompt needs.
9. **Parallel/Voting** — Useful for reliability and diverse perspectives.
10. **Sequential Workflow** — Simple chaining, but important for multi-step pipelines.

### Key Prompt Engineering Insights for 3A Studio

1. **Tool descriptions are as important as system prompts.** Anthropic says they spent MORE time on tools than the prompt. Each tool definition should include: what it does, when to use it, parameters with descriptions, examples, and edge cases.

2. **The "backstory" pattern from CrewAI is surprisingly effective.** 3-5 sentences establishing the agent's expertise, experience, and approach significantly improves output. This should be a field in 3A Studio.

3. **Stop conditions matter for autonomous agents.** Without explicit stopping rules (max iterations, completion criteria, "ask for help if stuck after N tries"), agents can loop indefinitely.

4. **The Router agent prompt should be SHORT and DECISIVE.** A router that explains its reasoning wastes tokens and can confuse downstream processing.

5. **Separate planning from execution in prompts.** Plan-and-Execute requires two distinct prompt templates with different concerns.

6. **Evaluation prompts need rubrics, not vague instructions.** "Is this good?" doesn't work. "Score 1-10 on: accuracy, completeness, clarity. Provide specific feedback." does.

7. **Collaboration context in multi-agent systems is critical.** Each agent needs to know: Who else is on the team? What can they do? How do I hand off to them?

### Universal System Prompt Structure (Recommended for 3A Studio)

```yaml
agent_prompt_template:
  # Section 1: Identity (always present)
  identity: "You are {role_name}."
  
  # Section 2: Expertise / Backstory (optional, for specialist agents)
  expertise: "{domain_knowledge_and_approach}"  # CrewAI-style backstory
  
  # Section 3: Task / Mission (always present)
  mission: "Your job is to {primary_task}."
  
  # Section 4: Available Tools (if agent has tools)
  tools: "{tool_descriptions_with_usage_guidance}"
  tool_guidance: "{when_and_how_to_use_tools}"
  
  # Section 5: Reasoning Protocol (varies by agent type)
  reasoning: "{type_specific_reasoning_instructions}"
  
  # Section 6: Collaboration Context (if multi-agent)
  team: "{team_members_and_their_capabilities}"
  delegation: "{how_to_delegate_or_receive_delegated_tasks}"
  
  # Section 7: Constraints & Guardrails (always present)
  constraints: "{rules_and_limitations}"
  
  # Section 8: Output Format (always present)
  output_format: "{expected_response_structure}"
  
  # Section 9: Stop Conditions (for autonomous agents)
  stop_conditions: "{when_to_stop_or_ask_for_help}"
```

---

## Sources

- Anthropic, "Building Effective AI Agents" (Dec 2024) — https://www.anthropic.com/research/building-effective-agents
- LangChain/LangGraph Docs — https://docs.langchain.com/oss/python/langgraph/workflows-agents
- CrewAI Documentation — https://docs.crewai.com/en/concepts/agents
- Microsoft AutoGen — https://microsoft.github.io/autogen/0.2/docs/tutorial/conversation-patterns
- OpenAI Agents SDK — https://openai.github.io/openai-agents-python/agents
- Google ADK — https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk
- Amazon Bedrock Agents — https://aws.amazon.com/bedrock/agents
- "AI Agents vs. Agentic AI: A Conceptual Taxonomy" (arxiv 2505.10468, 2025)
- "Agentic AI: Architectures, Taxonomies" (arxiv 2601.12560, 2025)
- Wang et al., "A Survey on Large Language Model Agents" (2023/2025)
- "Multi-Agent AI Patterns for Developers" (Suman Das, 2025)
- "Agent Architecture Patterns: 2026 Taxonomy Guide" (digitalapplied.com)
- IBM, "What is a ReAct Agent?"
- MIT AI Agent Index (2025)
