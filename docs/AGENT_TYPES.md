# 3A Studio -- Agent Typology

Cross-framework analysis of AI agent architectures. Sources: LangChain/LangGraph, CrewAI, AutoGen, Anthropic, OpenAI Agents SDK, Google ADK, Amazon Bedrock Agents. Academic references: Wang et al. 2023/2025, Anthropic "Building Effective Agents" 2024, arxiv 2505.10468, 2601.12560.

---

## 10 Fundamental Agent Patterns

| # | Pattern | Core Loop | Who Decides | When to Use | Phase |
|---|---------|-----------|-------------|-------------|-------|
| 1 | Tool-Calling Agent | Model calls tools natively, loops | Model (native function calling) | Default agent for most tasks. Production tool-using. | Phase 3 |
| 2 | Router / Classifier | Classify input, route to specialist | Model (classification) or code | Multi-capability systems, triage, cost optimization | Phase 3 |
| 3 | Specialist (CrewAI-style) | Role + Goal + Backstory prompting | User configures persona | Domain experts with deep expertise framing | Phase 3 |
| 4 | Orchestrator + Workers | Break task, delegate, synthesize | Orchestrator model (dynamic) | Complex multi-step tasks, coding, research | Phase 3 |
| 5 | Evaluator | Generate, score, feedback, repeat | Evaluator model decides | Quality loops, iterative improvement | Phase 3 |
| 6 | ReAct Agent | Thought, Action, Observation, repeat | Model (decides each step) | Non-function-calling models, reasoning tasks | Phase 4 |
| 7 | Plan-and-Execute | Plan once, execute steps, re-plan | Model plans, code orchestrates | Complex predictable tasks, multi-file changes | Phase 4 |
| 8 | Autonomous Agent | Open-ended loop with tools | Model (fully autonomous) | Open-ended coding, computer use, trusted environments | Phase 5 |
| 9 | Parallel / Voting | Multiple LLM calls in parallel, aggregate | Code dispatches, model aggregates | Reliability, diverse perspectives, code review | Phase 5 |
| 10 | Prompt Chaining | Sequential LLM calls with gates | Code (predefined paths) | Multi-step pipelines, verification gates | Phase 4 |

---

## Phase 3 Priority: Types 1-5

### 1. Tool-Calling Agent (default)

Most common modern pattern. All major frameworks support native function calling. This is the default agent type in 3A Studio.

**System prompt template:**
```
You are {role} with expertise in {domain}.

You have access to tools. Use them when they help answer the user's request.
- Call tools when you need information you don't have.
- You can call multiple tools in one response if independent.
- After receiving tool results, reason about them before responding.

{domain_specific_rules}

Respond conversationally, citing tool results when relevant.
```

**Key properties:**
- System prompt: short-medium
- Reasoning: none required (model decides natively)
- Tool descriptions: critical -- as important as system prompt itself (Anthropic)
- Output: free-form

---

### 2. Router / Classifier

Essential for any multi-capability system. Short, decisive prompt. Found in every framework.

**System prompt template:**
```
You are a routing agent that classifies user requests.

Analyze the user's message and classify it into exactly one category.

Categories:
- {category_1}: {when to choose this}
- {category_2}: {when to choose this}
- {category_3}: {when to choose this}

Output ONLY the category name. No explanation.
If unsure, choose the closest match.
```

**Key properties:**
- System prompt: short
- No tools, no reasoning
- Output: exactly one category name
- Must be fast and cheap (use small model)

---

### 3. Specialist (CrewAI-style persona)

Role + Goal + Backstory. The "backstory" field (3-5 sentences of domain expertise, personality, constraints) dramatically affects output quality.

**System prompt template:**
```
You are a specialist in {specialty} on a team.

Role: {detailed expertise description}
Backstory: {2-3 sentences establishing credibility and approach}

You will receive specific subtasks to execute. Complete them to the best of your ability.

{domain specific tools}

Focus on your area of expertise.
If a task is outside your expertise, say so.
Provide detailed, accurate results.

Output format: {structured output format}
```

**Key properties:**
- Backstory is the secret weapon (CrewAI finding)
- Can be used as Worker in Orchestrator pattern
- Temperature varies by domain (0.2 for code, 0.6 for creative)
- System prompt: medium

---

### 4. Orchestrator + Workers

Most powerful multi-agent pattern. Orchestrator delegates subtasks, Workers execute, Orchestrator synthesizes results.

**Orchestrator system prompt:**
```
You are a {role} manager overseeing a team of specialists.

Analyze the user's request, break it into subtasks, and delegate to the appropriate team member.

Your team members:
- {agent_1_name}: {description}
- {agent_2_name}: {description}
- {agent_3_name}: {description}

Delegation protocol:
1. Identify which subtasks are needed.
2. For each subtask, select the best team member.
3. Delegate with a clear, specific instruction.
4. After all subtasks complete, synthesize results.

Delegate one subtask at a time.
Each delegation should be self-contained.
If a result is unsatisfactory, re-delegate with better instructions.

Present the final synthesized answer to the user.
```

**Worker system prompt:** same as Specialist (type 3) with added collaboration context.

**Key properties:**
- Orchestrator prompt: long
- Needs team roster with descriptions
- Two handoff modes: Handoff (full transfer) vs Agent-as-Tool (returns to orchestrator)
- Collaboration context is critical for multi-agent systems

---

### 5. Evaluator

Generates output, scores it against criteria, provides feedback, loops until threshold met.

**System prompt template:**
```
You are a quality evaluator for {output_type}.

Evaluate the following {output} against these criteria:
1. {criterion_1}: {what good looks like}
2. {criterion_2}: {what good looks like}
3. {criterion_3}: {what good looks like}

Score: [1-10]
Feedback: [specific, actionable feedback for improvement]
Pass: [yes/no]

Be specific and constructive in feedback.
Only pass if score >= {threshold}.
```

**Key properties:**
- Needs rubric, not vague "is this good?" instructions
- Scoring must be concrete (1-10 with criteria)
- Works in loop with Generator agent
- Threshold configurable per use case

---

## Phase 4: Types 6, 7, 10

### 6. ReAct Agent

Classic pattern. Being replaced by native Tool-Calling (type 1) for modern models. Still needed for older models without function calling support.

**System prompt template:**
```
You are a {role} that solves problems step by step.

You MUST follow this format exactly:
Thought: [your reasoning about what to do next]
Action: [tool_name]
Action Input: [input for the tool]
Observation: [result of the tool - will be provided]
... repeat until you have enough information ...
Thought: I now have the final answer
Final Answer: [your answer]

Tools: {tool names and descriptions}

Always reason before acting. Use one tool at a time.
If a tool returns an error, think about why and try a different approach.
```

### 7. Plan-and-Execute

Separate planning and execution phases. Planner creates high-level plan, Executor carries out each step. Can re-plan after execution.

**Planner prompt:**
```
You are an expert planner for {domain} tasks.
Create a detailed, step-by-step plan: {user goal}

Output as numbered list:
1. [Step description] - [expected tool/resources needed]
...

Each step: atomic, independently executable.
Consider dependencies. Order logically.
Include verification steps.
Output ONLY the plan.
```

**Executor prompt:**
```
You are a task executor. You receive individual steps from a plan.

Execute step {N}/{total}: {step_description}
Tools: {available tools}

Focus only on the current step.
If you encounter an error, describe it clearly.
Don't skip ahead to other steps.
Provide the result of this step.
```

### 10. Prompt Chaining

Sequential LLM calls with programmatic gates between steps. Not an "agent" per se -- a workflow pattern (Anthropic classification). Code orchestrates the flow, each step has its own focused prompt.

**Each step:** focused subtask prompt with its own system prompt.
**Gates:** programmatic checks (code), not LLM calls.
**Key:** each step is simpler because it handles one subtask.

---

## Phase 5: Types 8, 9

### 8. Autonomous Agent

Open-ended loop with tools. Model decides its own path. Needs ground truth from environment. Requires stop conditions to prevent infinite loops.

**System prompt template:**
```
You are an expert software engineer.

Task: {issue description}
Context: {repository info, relevant file list}

Tools:
- read_file(path): Read file contents
- write_file(path, content): Create/overwrite file
- run_command(cmd): Execute shell commands
- search_files(pattern): Search codebase

Protocol:
1. Explore the codebase to understand relevant code
2. Plan your changes
3. Implement changes one file at a time
4. Run tests after each change
5. If tests fail, debug and fix
6. Summarize all changes made

Constraints:
- Always use absolute file paths.
- Read a file before editing it.
- Run tests after every code change.
- If stuck after 3 attempts, report what you tried.
```

**Critical:** tool descriptions are prompt-engineered as carefully as the system prompt itself (Anthropic ACI principle).

### 9. Parallel / Voting

Multiple LLM calls in parallel, then aggregate by voting or selection. Used for reliability and diverse perspectives.

**Same prompt template run N times**, possibly with variations. Aggregation: majority vote, threshold, or another LLM call. Use cases: code vulnerability review (flag if any reviewer finds issue), content moderation.

---

## Comparative Matrix: What Prompting Differs Between Types

| Agent Type | Prompt Length | Reasoning | Tool Usage | Output Format | Collaboration | Unique Element |
|---|---|---|---|---|---|---|
| Tool-Calling | Short-Medium | None (native) | Brief descriptions | Free-form | None | Model-native function calling |
| Router | Short | Classification | Usually none | Category name only | Downstream agent list | Must be concise and decisive |
| Specialist | Medium | Domain-specific | Domain tools | Domain format | Team context | Backstory/persona (CrewAI) |
| Orchestrator | Long | Task analysis + delegation | Usually none | Synthesized answer | Full team roster | Team management instructions |
| Evaluator | Medium | Criteria + rubric | May test tools | Score + Feedback | Evaluates other agent | Rubric-based assessment |
| ReAct | Medium | Explicit Thought/Action format | Detailed tool descriptions | Structured (Final Answer) | None | Format enforcement in prompt |
| Plan-and-Execute | Medium (planner) / Short (executor) | Step decomposition | May list tools | Numbered list / Step result | Planner references executor | Two distinct prompt templates |
| Autonomous | Long | Full planning + self-check | Comprehensive tool descriptions | Mission-dependent | May coordinate | Stop conditions + error recovery |
| Parallel/Voting | Per-instance | Per-instance prompt | Per-instance | Aggregated | N/A | Aggregation strategy |
| Prompt Chaining | Per-step (short) | Per-step | Per-step | Per-step | Sequential context | Gates are programmatic, not LLM |

---

## Universal System Prompt Structure (3A Studio)

All agent types share this base structure. Each type fills different sections:

```
# 1. Identity (always)
You are {role_name}.

# 2. Expertise / Backstory (specialist agents)
{domain_knowledge_and_approach}

# 3. Task / Mission (always)
Your job is to {primary_task}.

# 4. Available Tools (if agent has tools)
{tool_descriptions_with_usage_guidance}
{when_and_how_to_use_tools}

# 5. Reasoning Protocol (varies by agent type)
{type_specific_reasoning_instructions}

# 6. Collaboration Context (if multi-agent)
Team members: {team_members_and_their_capabilities}
Delegation: {how_to_delegate_or_receive_delegated_tasks}

# 7. Constraints & Guardrails (always)
{rules_and_limitations}

# 8. Output Format (always)
{expected_response_structure}

# 9. Stop Conditions (autonomous agents)
{when_to_stop_or_ask_for_help}
```

---

## Prompting Best Practices (Cross-Framework)

1. **Tool descriptions are as important as system prompts.** Anthropic spent MORE time on tools than the prompt. Include: what, when, parameters, examples, edge cases.

2. **Backstory pattern (CrewAI) is surprisingly effective.** 3-5 sentences establishing expertise, experience, approach. Should be a field in 3A Studio.

3. **Stop conditions matter for autonomous agents.** Without explicit stopping rules (max iterations, completion criteria, "ask for help after N tries"), agents loop indefinitely.

4. **Router prompts must be SHORT and DECISIVE.** A router that explains reasoning wastes tokens and confuses downstream processing.

5. **Separate planning from execution in prompts.** Plan-and-Execute needs two distinct templates with different concerns.

6. **Evaluation prompts need rubrics, not vague instructions.** "Score 1-10 on: accuracy, completeness, clarity. Provide specific feedback." works. "Is this good?" does not.

7. **Collaboration context in multi-agent systems is critical.** Each agent needs: Who else is on the team? What can they do? How do I hand off?

---

## Full research report

Saved at: `download/ai_agent_typology_research.md` (~700 lines, 7 frameworks, 10 patterns, 10 system prompt templates, academic references).
