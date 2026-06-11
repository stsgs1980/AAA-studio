# AGENT RULES -- VIOLATION IS NOT ACCEPTABLE

<!-- AHG:START -->
<!-- Do NOT edit between START and END markers. This block is managed by anti-hallucination-guard/setup.sh -->
## Rule 1: worklog -- BEFORE and AFTER every action

- Before ANY action: read /worklog.md
- After ANY action: update /worklog.md
- Format: only blocks with --- separator
- Content: specific facts (files, commands, results)

## Rule 2: Read before write (READ BEFORE WRITE)

- NEVER write a file without reading it first (Read tool)
- Exception: if file does not exist (verify via LS/Glob)
- Reason: without reading, agent risks destroying existing code

## Rule 3: One logical block -- one commit

- Finished a meaningful chunk of work -> git add -A && git commit
- Commit message: specific description (not "update", not "fix")
- Commit without updated worklog -> ERROR (pre-commit hook will block)

## Rule 4: No loops

- If you are doing the same thing for the 3rd time with the same result -> STOP
- Do not try "once more, but differently"
- Write in chat: "Stuck on [specific step], need help"
- This is NOT a failure -- this saves user time

## Rule 5: Honest reporting

- Do NOT write "work completed" if tests are not passed
- Do NOT write "file created" if it does not exist
- Do NOT write "error fixed" if you did not verify
- Every claim -> must be verifiable

## Rule 6: Work structure

1. Read AGENT_RULES.md and worklog.md
2. Determine the specific next step
3. Execute the step
4. Record in worklog
5. Git commit
6. Go to step 2

## Rule 7: Sandbox verification (no fake setup)

Agents MUST verify sandbox infrastructure is real before proceeding. Known anti-hallucination patterns in Z.ai Sandbox:

1. **Clone to subfolder, not root**: Code cloned into `/tmp/` or `/home/z/my-project/subdir/` is NOT served by the dev server. The sandbox server only serves code in `/home/z/my-project/` root. Verify: `ls /home/z/my-project/src/app/page.tsx`.

2. **Dev server is managed by sandbox**: Do NOT manually start `next dev`. The sandbox starts it via `.zscripts/dev.sh`. Verify: `pgrep -f ".zscripts/dev.sh"`. If absent, re-init: `curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash`.

3. **HMR 500 is NOT "it works":** A 500 response in `dev.log` means broken code, not a working server. Verify: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/` must return `200`.

4. **Editing wrong location is silent failure**: Writing to `/tmp/my-repo/src/app/page.tsx` changes NOTHING visible in the browser. Always confirm you are editing files under `/home/z/my-project/`.


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