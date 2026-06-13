# AGENT RULES -- VIOLATION IS NOT ACCEPTABLE





<!-- AHG:START -->
<!-- Do NOT edit between START and END markers. This block is managed by anti-hallucination-guard/setup.sh -->
<!-- ANTI-MONOLITH exception: single-source rules reference for AI agents.
     Splitting would force agents to search multiple files. Per Rule 12. -->
# AGENT_RULES.md

> **QUICK REFERENCE -- 5 Critical Rules**
>
> 1. **[C] Rule 1**: ANSWER BEFORE ACT -- question -> answer, task -> execute
> 2. **[C] Rule 3**: Read before write -- never write without reading first
> 3. **[C] Rule 6**: Honest reporting -- every claim must be verifiable
> 4. **[C] Rule 11**: Integrity protection -- never bypass anti-hallucination mechanisms
> 5. **[C] Rule 12**: Anti-monolith -- no file over 250 lines

## Table of Contents
- [Rule 1 [C]: Answer Before Act](#rule-1-c-answer-before-act-no-unsolicited-action)
- [Rule 2 [C]: worklog](#rule-2-c-worklog--before-and-after-every-action)
- [Rule 3 [C]: Read before write](#rule-3-c-read-before-write-read-before-write)
- [Rule 4 [C]: One logical block -- one commit](#rule-4-c-one-logical-block----one-commit)
- [Rule 5 [C]: No loops](#rule-5-c-no-loops)
- [Rule 6 [C]: Honest reporting](#rule-6-c-honest-reporting)
- [Rule 7 [W]: Work structure](#rule-7-w-work-structure)
- [Rule 8 [C]: Sandbox verification](#rule-8-c-sandbox-verification-no-fake-setup)
- [Rule 9 [C]: Session Start Protocol](#rule-9-c-session-start-protocol-drift-prevention)
- [Rule 10 [C]: Documentation sync](#rule-10-c-documentation-sync-no-code-without-docs)
- [Rule 11 [C]: Integrity protection](#rule-11-c-integrity-protection-no-self-sabotage)
- [Rule 12 [C]: Anti-monolith](#rule-12-c-anti-monolith-no-file-over-250-lines)
- [Rule 13 [C]: ahg bump](#rule-13-c-use-ahg-bump-for-version-updates)
- [Rule 14 [C]: Pre-commit checklist](#rule-14-c-pre-commit-mandatory-checklist)
- [Rule 15 [W]: UNICODE_POLICY](#rule-15-w-no-unicode-graphics-unicode_policy-compliance)
- [Rule 16 [C]: AHG submodule is immutable](#rule-16-c-ahg-submodule-is-immutable-architecture-no-removal-no-inlining)
- [Rule 17 [C]: Upstream write protection](#rule-17-c-upstream-write-protection-no-consumer-agent-may-push-to-ahg)
- [worklog.md format](#worklogmd-format)

<!-- ID: RULE-001 | ver:1.0 | Level: C | Related: RULE-006, RULE-007 -->
## Rule 1 [C]: ANSWER BEFORE ACT (NO UNSOLICITED ACTION)
IF ASKED A QUESTION -- ANSWER THE QUESTION. DO NOT START IMPLEMENTING.
DO NOT CREATE FILES. DO NOT MODIFY CODE. DO NOT COMMIT.
ONLY ACT WHEN GIVEN AN EXPLICIT TASK.

1. Question -> ANSWER, nothing else
2. Task -> EXECUTE
3. Unsure -> ASK, do NOT guess
4. "Do it" / "Go ahead" / "Make it so" -> that is a task, execute

This rule is the FIRST rule for a reason. Every session, every agent,
every time. Read it. Follow it.

<!-- ID: RULE-002 | ver:1.0 | Level: C | Related: RULE-004, RULE-007 -->
## Rule 2 [C]: worklog -- BEFORE and AFTER every action

- Before ANY action: read /worklog.md
- After ANY action: update /worklog.md
- Format: only blocks with --- separator
- Content: specific facts (files, commands, results)

<!-- ID: RULE-003 | ver:1.0 | Level: C | Related: RULE-010 -->
## Rule 3 [C]: Read before write (READ BEFORE WRITE)

- NEVER write a file without reading it first (Read tool)
- Exception: if file does not exist (verify via LS/Glob)
- Reason: without reading, agent risks destroying existing code

<!-- ID: RULE-004 | ver:1.0 | Level: C | Related: RULE-002 -->
## Rule 4 [C]: One logical block -- one commit

- Finished a meaningful chunk of work -> git add -A && git commit
- Commit message: specific description (not "update", not "fix")
- Commit without updated worklog -> ERROR (pre-commit hook will block)

<!-- ID: RULE-005 | ver:1.0 | Level: C | Related: RULE-006 -->
## Rule 5 [C]: No loops

- If you are doing the same thing for the 3rd time with the same result -> STOP
- Do not try "once more, but differently"
- Write in chat: "Stuck on [specific step], need help"
- This is NOT a failure -- this saves user time

<!-- ID: RULE-006 | ver:1.0 | Level: C | Related: RULE-011 -->
## Rule 6 [C]: Honest reporting

- Do NOT write "work completed" if tests are not passed
- Do NOT write "file created" if it does not exist
- Do NOT write "error fixed" if you did not verify
- Every claim -> must be verifiable

<!-- ID: RULE-007 | ver:1.0 | Level: W | Related: RULE-002, RULE-004 -->
## Rule 7 [W]: Work structure

1. Read AGENT_RULES.md and worklog.md
2. Determine the specific next step
3. Execute the step
4. Record in worklog
5. Git commit
6. Go to step 2

<!-- ID: RULE-008 | ver:1.0 | Level: C | Related: STD-ENV-001, STD-ENV-002 -->
## Rule 8 [C]: Sandbox verification (no fake setup)

Agents MUST verify sandbox infrastructure is real before proceeding. Known anti-hallucination patterns in Z.ai Sandbox:

1. **Clone to subfolder, not root**: Code cloned into `/tmp/` or `/home/z/my-project/subdir/` is NOT served by the dev server. The sandbox server only serves code in `/home/z/my-project/` root. Verify: `ls /home/z/my-project/src/app/page.tsx`.

2. **Dev server is managed by sandbox**: Do NOT manually start `next dev`. The sandbox starts it via `.zscripts/dev.sh`. Verify: `pgrep -f ".zscripts/dev.sh"`. If absent, re-init: `curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash`.

3. **HMR 500 is NOT "it works":** A 500 response in `dev.log` means broken code, not a working server. Verify: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/` must return `200`.

4. **Editing wrong location is silent failure**: Writing to `/tmp/my-repo/src/app/page.tsx` changes NOTHING visible in the browser. Always confirm you are editing files under `/home/z/my-project/`.

<!-- ID: RULE-009 | ver:1.0 | Level: C | Related: RULE-010, TOOL-VERIFY -->
## Rule 9 [C]: Session Start Protocol (drift prevention)

Before ANY work in a new session, the agent MUST:

1. **Scan project structure**: list source files to understand what exists
2. **Read version source of truth** (manifest.json, package.json, etc.)
3. **Compare actual structure with documentation** (ARCHITECTURE.md, README)
4. **If drift > 3 items**: UPDATE DOCUMENTATION FIRST, then do the task
5. **Record scan results** in worklog.md

Detection of drift (automatic flags):
- New files not in ARCHITECTURE.md or docCoverage targets -> flag
- Stub markers in docs but implementation files exist -> flag
- Version in docs != version in source of truth -> flag
- Files mentioned in docs that no longer exist -> flag

This rule prevents the most common documentation decay pattern:
an agent writes code but does not update docs, causing documentation
to gradually become misleading and unreliable.

<!-- ID: RULE-010 | ver:1.0 | Level: C | Related: RULE-009, TOOL-VERIFY -->
## Rule 10 [C]: Documentation sync (no code without docs)

When changing the codebase, documentation MUST be kept in sync:

1. **New file** -> add to ARCHITECTURE.md (modules section) + update file counts in README
2. **New functionality** -> remove from "not working" / "stubs" section + add to "working" section
3. **Deleted/renamed file** -> update all references in all docs
4. **Version change** -> update ONLY the source of truth (e.g. manifest.json);
   all other docs must read from there (verified by verify-docs Section 3)

Pre-commit checklist:
- [ ] manifest.json version updated?
- [ ] ARCHITECTURE.md reflects new/changed modules?
- [ ] README.md does not contain stale "stubs"?
- [ ] task state file statuses are current?
- [ ] verify-docs passes without errors?

<!-- ID: RULE-011 | ver:1.0 | Level: C | Related: RULE-006, PROC-SETUP -->
## Rule 11 [C]: Integrity protection (no self-sabotage)

Agents MUST NOT disable, bypass, or weaken the anti-hallucination mechanisms.
This rule is non-negotiable and applies regardless of task urgency.

**Forbidden actions:**
1. `git commit --no-verify` -- bypasses all hooks
2. `git -c core.hooksPath=/dev/null commit` -- redirects hooks to nothing
3. Modifying `.git/hooks/pre-commit` or `.git/hooks/pre-push` to remove checks
4. Deleting or truncating worklog.md to avoid accountability
5. Removing AHG marker blocks from AGENT_RULES.md
6. Removing checks from verify-docs.json to avoid failures
7. Setting `core.hooksPath` in git config to bypass hooks
8. Creating fake worklog entries that don't describe real work

**If you encounter a situation where hooks block legitimate work:**
- Fix the underlying issue (update worklog, fix docs, etc.)
- Ask the user for guidance
- NEVER remove the guard mechanisms

**Detection:**
- check-hooks-integrity.sh compares fingerprints of hooks and configs
- verify-docs detects missing or weakened checks
- audit.sh scores integrity as part of session quality
- CI pipeline runs verify-docs independently (cannot be bypassed locally)

<!-- ID: RULE-012 | ver:1.1 | Level: C | Related: RULE-004, PROC-LINECOUNT -->
## Rule 12 [C]: Anti-monolith (no file over 250 lines)

Every file MUST stay under 250 lines. When a file crosses this threshold,
the agent MUST stop writing, split the file, and continue with smaller modules.

**This rule is enforced by the pre-commit hook (Phase 4).**
Violations are BLOCKED automatically -- the commit will not succeed.

**Thresholds:**
- File: 250 lines hard limit (150 recommended)
- Function: 50 lines max (longer = extract helper)
- One file = one responsibility

**Auto-activation (MUST NOT wait to be asked):**
1. Agent writes a file that approaches 250 lines -> STOP, split, continue
2. Agent opens a file that already exceeds 250 lines -> split before editing
3. Agent plans a new file that will clearly exceed limits -> plan decomposition upfront

**When threshold is crossed:**
1. STOP writing immediately
2. Announce: `[ANTI-MONOLITH] Threshold exceeded: <file> is N lines (limit 250)`
3. Identify sub-responsibilities within the file
4. Extract each into a separate file with a clear single purpose
5. Keep original as thin orchestrator that imports extracted modules
6. Continue the task with decomposed structure

**Valid exceptions (must be documented with comment in file):**
- Auto-generated code (Prisma schema, OpenAPI types)
- Configuration files that are naturally flat
- Files between 250-300 lines AND well-organized with clear sections

**Invalid exceptions:**
- File exceeds 400 lines (no excuses, decompose)
- "I'll refactor later" (later never comes)
- "It's easier to read in one file" (that's what imports are for)

<!-- ID: RULE-013 | ver:1.1 | Level: C | Related: TOOL-BUMP -->
## Rule 13 [C]: Use ahg bump for version updates

When changing the project version, use the atomic bump command:
  bash scripts/ahg.sh bump X.Y.Z

This command:
- Auto-discovers ALL files containing version numbers
- Updates them atomically (no file forgotten)
- Adds CHANGELOG entry if CHANGELOG exists
- Supports --dry-run for preview

Do NOT update versions manually in individual files.
Manual updates cause version drift -- one file gets updated,
another is forgotten. ahg bump eliminates this class of errors.

<!-- ID: RULE-014 | ver:1.1 | Level: C | Related: RULE-002, RULE-004, TOOL-VERIFY -->
## Rule 14 [C]: Pre-commit mandatory checklist

Before EVERY commit, verify ALL of these items:
- [ ] Code written and tested
- [ ] worklog.md updated (hook will verify freshness)
- [ ] If version changed: ahg bump used (not manual edit)
- [ ] If new files added: documented in README/ARCHITECTURE
- [ ] If files deleted: no stale references remain
- [ ] cascade-state.json: task statuses current (auto-sync in hook)
- [ ] verify-docs passes (or discover shows no errors)

If ANY item is unclear: run "bash scripts/ahg.sh discover" first.
Do NOT commit with known documentation drift.

<!-- ID: RULE-015 | ver:1.0 | Level: W | Related: -->
## Rule 15 [W]: No Unicode graphics (UNICODE_POLICY compliance)

All AHG output must comply with No-Unicode Policy v2.1.
No emoji, no Unicode pictograms, no decorative symbols.

**Allowed:**
- ASCII: a-z, A-Z, 0-9, standard punctuation
- Cyrillic: a-ya, A-Ya
- Status markers: [OK], [ERR], [WARN], [INFO], [FAIL] -- plain text only
- Diagrams: ASCII only: -> <- => <= | + - v ^ >
- Section dividers in comments: // -- or # -- (not Unicode dashes)

**Prohibited:**
- Emoji (any pictograms: emotions, objects, UI-symbols)
- Unicode box drawing (U+2500 and similar)
- Em dash (U+2014), en dash (U+2013) -- use -- instead
- Any Unicode decorative symbols

**Application levels:**
- Production code: [C] Critical (blocks)
- CLI output, scripts: [W] Warning
- AI-agent chat responses: [W] Warning
- Documentation (.md): regulated by MARKDOWN_STANDARD v2.1

<!-- ID: RULE-016 | ver:1.0 | Level: C | Related: RULE-011, ARCH-SUBMODULE -->
## Rule 16 [C]: AHG submodule is immutable architecture (no removal, no inlining)

The anti-hallucination-guard git submodule is a structural component of this
project, not an optional dependency. Agents MUST NOT propose or execute any
action that removes, inlines, or restructures the AHG submodule relationship.

**What the submodule provides (single source of truth):**
- Pre-commit hook: worklog freshness + verify-docs consistency
- Pre-push hook: repository purity + doc consistency enforcement
- setup.sh: idempotent deployment of hooks, scripts, and rules
- update.sh: one-command update (git pull + re-deploy)
- validate.sh: purity enforcement (only AHG files in AHG repo)
- verify-docs: documentation drift detection engine
- cascade-state.json: cross-project version tracking
- AGENT_RULES.md: this rule set (deployed, not hand-written)

**Why a submodule (not inline files):**
1. **Version synchronization**: bugfixes in AHG reach ALL consumer projects
   via `git submodule update`. Inlined copies diverge within days.
2. **Purity validation**: validate.sh can only verify a module repo, not a
   folder mixed with consumer project files. Inlining makes purity checks
   impossible.
3. **Atomic updates**: update.sh pulls + redeploys in one step. With inlined
   files, each project manually copies scripts -- versions drift, fixes are
   lost, hooks silently stop working.
4. **Protected upstream**: the AHG repo has branch protection. Consumer
   projects cannot accidentally push broken changes to the guard system.
5. **Cross-project consistency**: every consumer project runs the SAME version
   of the same hooks. No "HH-Copilot has v2.1 hooks, ProjectB has v1.8 hooks".

**Forbidden actions (this rule extends Rule 11):**
1. Proposing to remove the git submodule and inline AHG files
2. Moving AHG scripts to `scripts/ahg/`, `.ahg/`, or any local path
3. Copying hook files into the project and deleting the submodule reference
4. Suggesting that AHG is "just scripts that could live in the project"
5. Creating a parallel local copy of any AHG-managed file
6. Removing `.gitmodules` entries for anti-hallucination-guard

**What to do when something breaks:**
- If hooks block a push: fix the underlying issue (update worklog, fix docs)
- If validate.sh fails in wrong context: run `bash anti-hallucination-guard/update.sh`
  to update hooks to the latest version with bugfixes
- If a hook has a bug: report it, fix it IN the AHG submodule repo, then
  update the submodule pointer. Do NOT patch hooks locally.
- If the submodule seems unnecessary: re-read this rule. It IS necessary.

**The submodule is not causing problems -- bugs in context detection were.
Those bugs are fixed in the AHG repo. Update the submodule to get fixes.**

<!-- ID: RULE-017 | ver:1.0 | Level: C | Related: RULE-011, RULE-016, ARCH-UPSTREAM -->
## Rule 17 [C]: Upstream write protection (no consumer agent may push to AHG)

No agent running in a consumer project context may push, merge, create PRs,
or modify the AHG upstream repository in any way. The AHG repository is
maintained exclusively by its owner. Consumer projects are READ-ONLY consumers
of the AHG submodule.

**The problem this rule solves:**
Consumer project agents (e.g. HH-Copilot, ProjectB-agent) have access to the
AHG submodule directory inside their project. Without this rule, an agent can:
- Push branches to the AHG upstream repository
- Create pull requests against AHG main
- Claim "my fix is already merged via PR #N" and update the submodule pointer
- Merge their own PRs if branch protection is not configured

This is NOT a theoretical risk -- it has already happened. A consumer project
agent pushed branch `fix/pre-commit-bun-path` and merged it as PR #8 into
AHG main, bypassing review. The fix was incorrect (used `git rev-parse
--show-toplevel` which returns wrong path in submodules) and had to be
superseded by a proper fix in PR #9.

**Forbidden actions for consumer project agents (this extends Rule 16):**
1. `git push` from inside the AHG submodule directory
2. Creating branches in the AHG upstream repository
3. Creating pull requests against the AHG repository
4. Merging or approving PRs in the AHG repository
5. Claiming a fix has been merged into AHG upstream without owner confirmation
6. Updating the submodule pointer to an unverified commit
7. Running `AHG_MODULE_PUSH=1 git push` from a consumer project context
8. Modifying AHG files and committing them directly (not via submodule update)

**What consumer project agents MUST do instead:**
- If AHG has a bug: report it to the owner, do NOT fix it yourself in the upstream
- If AHG hooks block a push: fix the consumer project, do NOT patch AHG
- If AHG seems to need an update: ask the owner, do NOT merge PRs yourself
- If you need a newer version of AHG: `git submodule update --remote` after
  the owner publishes a release

**Enforcement layers (defense in depth):**
1. **Rule 16 + Rule 17**: Agent-level prohibition in AGENT_RULES.md
2. **CODEOWNERS**: Only @stsgs1980 can approve changes (requires GitHub
   branch protection with "Require review from Code Owners")
3. **pr-guard.yml workflow**: CI-level check that blocks PRs from forks,
   non-collaborators, and tampering attempts (removing Rule 16/16 or CODEOWNERS)
4. **validate.sh**: Blocks push from inside submodule unless AHG_MODULE_PUSH=1
5. **GitHub branch protection**: Must be configured by owner (see below)

**GitHub branch protection (MUST be configured by owner):**
```
Repository Settings > Branches > Branch protection rules > main
  [x] Require a pull request before merging
  [x] Require approvals (1)
  [x] Require review from Code Owners
  [x] Restrict who can push to matching branches (only @stsgs1980)
  [x] Do not allow bypassing the above settings
```


## worklog.md format

```markdown
Task ID: [step number]
Agent: [agent name or "main"]
Task: [what we are doing]

Work Log:
- [FACT: what specifically was done]
- [FACT: which file was changed, command]
- [FACT: command result or operation outcome]

Stage Summary:
- [What was accomplished, what is next]
```



<!-- AHG:END -->
