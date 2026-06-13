#!/usr/bin/env python3
"""
AAA Studio Cross-Consistency Audit v1
Checks: numbers in docs vs actual code, dead links, file references,
        version mismatches, duplicate configs, route/file mismatches.
"""
import re, json, os, glob, subprocess

ROOT = "/home/z/my-project"
EXCLUDE = ["anti-hallucination-guard", "node_modules", ".next", ".git"]
results = []  # list of (severity, check_name, file, detail)

def fail(name, file, detail):
    results.append(("FAIL", name, file, detail))

def warn(name, file, detail):
    results.append(("WARN", name, file, detail))

def info(name, file, detail):
    results.append(("INFO", name, file, detail))

def read(path):
    try:
        with open(path, "r") as f:
            return f.read()
    except:
        return ""

def count_pattern(text, pattern):
    return len(re.findall(pattern, text, re.MULTILINE))

def count_files(glob_pattern):
    files = glob.glob(os.path.join(ROOT, glob_pattern), recursive=True)
    # exclude anti-hallucination-guard
    files = [f for f in files if "/anti-hallucination-guard/" not in f]
    return files

# ========== 1. NUMBERS IN DOCS vs ACTUAL CODE ==========

readme = read(f"{ROOT}/README.md")
workflow = read(f"{ROOT}/WORKFLOW.md")
doc = read(f"{ROOT}/3A-Studio-Documentation.md")
task_list = read(f"{ROOT}/UNIFIED_TASK_LIST.md")
audit_doc = read(f"{ROOT}/AUDIT-DONORS-vs-IMPLEMENTATION.md")

# 1a. Screens count
# README says "Screens (19)"
actual_screens = len(re.findall(r"\| .+ \| /[\w-]+ \|", readme))
# More precise: count dashboard screens from the table
screen_table_matches = re.findall(r"\| (Dashboard|Flow Editor|Templates|Agents|Agent Creator|Hierarchy|Pipelines|Workflows|Prompt Studio|Knowledge Base|Skill Forge|Standards Manager|Audit Log|Settings|Tasks|Testing|Quality Analyzer|Self-Correction|Wiki) \|", readme)
readme_screen_count_match = re.search(r"Screens \((\d+)\)", readme)
if readme_screen_count_match:
    claimed_screens = int(readme_screen_count_match.group(1))
    actual_count = len(screen_table_matches)
    if claimed_screens != actual_count:
        fail("Screen count", "README.md",
             f"Claims {claimed_screens} screens, table has {actual_count} entries. "
             f"Missing from table: check if count includes 'Landing' or 'Auth' pages.")

# 1b. Node types count
node_registry = read(f"{ROOT}/src/features/flow-editor/nodes/node-registry.ts")
actual_nodes = count_pattern(node_registry, r"\{ type: '")
# README: "(20 node types)"
readme_node_match = re.search(r"(\d+) node types", readme)
if readme_node_match:
    claimed_nodes = int(readme_node_match.group(1))
    if claimed_nodes != actual_nodes:
        fail("Node types", "README.md",
             f"Claims {claimed_nodes} node types, node-registry.ts has {actual_nodes}")

# 1c. Wiki articles count
wiki_pages = count_files("src/features/wiki/pages/*.tsx")
actual_wiki = len(wiki_pages)
# README: "16 articles"
readme_wiki_match = re.search(r"Wiki \| /wiki \| (\d+) articles", readme)
if readme_wiki_match:
    claimed_wiki = int(readme_wiki_match.group(1))
    if claimed_wiki != actual_wiki:
        fail("Wiki articles", "README.md",
             f"Claims {claimed_wiki} wiki articles, found {actual_wiki} .tsx files in wiki/pages/")

# Also check WORKFLOW.md
workflow_wiki_match = re.search(r"Wiki.*?(\d+) страниц", workflow)
if workflow_wiki_match:
    claimed = int(workflow_wiki_match.group(1))
    if claimed != actual_wiki:
        fail("Wiki articles (WORKFLOW)", "WORKFLOW.md",
             f"Claims '{claimed} страниц', found {actual_wiki} wiki pages")

# 1d. Formulas count
formulas = read(f"{ROOT}/packages/prompting/src/formulas/index.ts")
actual_formulas = count_pattern(formulas, r'^\s+id: "')
# README: "Formulas (10)"
readme_formula_match = re.search(r"Formulas \((\d+)\)", readme)
if readme_formula_match:
    claimed = int(readme_formula_match.group(1))
    if claimed != actual_formulas:
        fail("Formulas count", "README.md",
             f"Claims {claimed} formulas, formulas/index.ts has {actual_formulas}")

# 1e. Frameworks count
frameworks = read(f"{ROOT}/packages/prompting/src/frameworks/data.ts")
actual_frameworks = count_pattern(frameworks, r'^\s+id: "')
# README: "Frameworks (11)"
readme_fw_match = re.search(r"Frameworks \((\d+)\)", readme)
if readme_fw_match:
    claimed = int(readme_fw_match.group(1))
    if claimed != actual_frameworks:
        fail("Frameworks count", "README.md",
             f"Claims {claimed} frameworks, frameworks/data.ts has {actual_frameworks}")

# 1f. Techniques count
techniques = read(f"{ROOT}/packages/prompting/src/techniques/data.ts")
actual_techniques = count_pattern(techniques, r'^\s+id: "')
# README: "Techniques (17)"
readme_tech_match = re.search(r"Techniques \((\d+)\)", readme)
if readme_tech_match:
    claimed = int(readme_tech_match.group(1))
    if claimed != actual_techniques:
        fail("Techniques count", "README.md",
             f"Claims {claimed} techniques, techniques/data.ts has {actual_techniques}")

# 1g. Edge types count
flow_validations = read(f"{ROOT}/src/lib/validations/flow.ts")
actual_edges = len(re.findall(r"'command'|'sync'|'twin'|'delegate'|'feedback'|'supervise'|'broadcast'", flow_validations))
# README: "7 edge types"
readme_edge_match = re.search(r"(\d+) edge types", readme)
if readme_edge_match:
    claimed = int(readme_edge_match.group(1))
    if claimed != actual_edges:
        fail("Edge types", "README.md",
             f"Claims {claimed} edge types, flow.ts has {actual_edges}")

# 1h. Flow templates count
templates = read(f"{ROOT}/src/features/pipelines/data/flow-templates.ts")
actual_templates = count_pattern(templates, r'^  id: "')
# README: "6 flow templates"
readme_tmpl_match = re.search(r"(\d+) flow templates", readme)
if readme_tmpl_match:
    claimed = int(readme_tmpl_match.group(1))
    if claimed != actual_templates:
        fail("Flow templates", "README.md",
             f"Claims {claimed} flow templates, flow-templates.ts has {actual_templates}")

# 1i. Monorepo Packages count
# README: "Monorepo Packages (5)"
pkg_dirs = [d for d in os.listdir(f"{ROOT}/packages") if os.path.isdir(os.path.join(f"{ROOT}/packages", d))]
actual_pkgs = len(pkg_dirs)
readme_pkg_match = re.search(r"Monorepo Packages \((\d+)\)", readme)
if readme_pkg_match:
    claimed = int(readme_pkg_match.group(1))
    if claimed != actual_pkgs:
        fail("Packages count", "README.md",
             f"Claims {claimed} packages, packages/ has {actual_pkgs}: {pkg_dirs}")

# 1j. ESLint rules count
eslint_index = read(f"{ROOT}/packages/eslint-plugin/src/index.ts")
actual_eslint = len(re.findall(r'"max-lines"|"max-use-state"|"no-cross-layer"|"no-unicode-escapes"', eslint_index))
# README: "4 rules: max-lines"
readme_eslint_match = re.search(r"(\d+) rules: max-lines", readme)
if readme_eslint_match:
    claimed = int(readme_eslint_match.group(1))
    if claimed != actual_eslint:
        fail("ESLint rules", "README.md",
             f"Claims {claimed} rules, eslint-plugin/src/index.ts exports {actual_eslint}")

# 1k. Scoring criteria
scoring = read(f"{ROOT}/packages/prompting/src/scoring/index.ts")
actual_scoring = count_pattern(scoring, r"^\s+\w+: number;")
actual_scoring -= 1  # exclude 'overall'
# README: "6-criteria scoring"
readme_scoring_match = re.search(r"(\d+)-criteria scoring", readme)
if readme_scoring_match:
    claimed = int(readme_scoring_match.group(1))
    if claimed != actual_scoring:
        fail("Scoring criteria", "README.md",
             f"Claims {claimed}-criteria, scoring/index.ts has {actual_scoring} (excl. overall)")

# 1l. Prisma models
schema = read(f"{ROOT}/prisma/schema.prisma")
actual_models = count_pattern(schema, r"^model \w+")
# Various docs claim different numbers
doc_model_match = re.search(r"(\d+) Prisma-модел", doc)
if doc_model_match:
    claimed = int(doc_model_match.group(1))
    if claimed != actual_models:
        fail("Prisma models (Doc)", "3A-Studio-Documentation.md",
             f"Claims {claimed} models, schema.prisma has {actual_models}")

task_model_match = re.search(r"Prisma schema: (\d+) models", task_list)
if task_model_match:
    claimed = int(task_model_match.group(1))
    if claimed != actual_models:
        fail("Prisma models (TaskList)", "UNIFIED_TASK_LIST.md",
             f"Claims {claimed} models, schema.prisma has {actual_models}")

audit_model_match = re.search(r"(\d+) Prisma models", audit_doc)
if audit_model_match:
    claimed = int(audit_model_match.group(1))
    if claimed != actual_models:
        fail("Prisma models (Audit)", "AUDIT-DONORS-vs-IMPLEMENTATION.md",
             f"Claims {claimed} models, schema.prisma has {actual_models}")

# ========== 2. WORKFLOW.md vs README.md CONSISTENCY ==========

# 2a. WORKFLOW says "12 экранов, 4 пакета", README says 19 screens, 5 packages
if "12 экранов" in workflow or "12 экран" in workflow:
    warn("Screen count (WORKFLOW)", "WORKFLOW.md",
         "Says '12 экранов' but README lists 19 screens")

# WORKFLOW: "eslint-plugin-3a (3 правила)"
if "3 правила" in workflow:
    fail("ESLint rules (WORKFLOW)", "WORKFLOW.md",
         "Says '3 правила' but there are 4 rules (max-lines, max-use-state, no-cross-layer, no-unicode-escapes)")

# WORKFLOW: "18 nodes"
if "18 nodes" in workflow or "18 узлов" in workflow or "18 node" in workflow:
    if actual_nodes != 18:
        fail("Node count (WORKFLOW)", "WORKFLOW.md",
             f"Says '18 nodes' but node-registry has {actual_nodes}")

# WORKFLOW: Wiki "14 страниц" vs actual 15
if "14 страниц" in workflow:
    fail("Wiki pages (WORKFLOW)", "WORKFLOW.md",
         f"Says '14 страниц' but there are {actual_wiki} wiki pages")

# WORKFLOW: Prompt Studio "5 модулей" + "Formulas (10)" + "Frameworks (4)" 
# but actual frameworks = 11
if "Frameworks \(4\)" in workflow:
    fail("Frameworks (WORKFLOW)", "WORKFLOW.md",
         f"Says 'Frameworks (4)' but there are {actual_frameworks} frameworks")

# WORKFLOW: "125 тестов" but we need to check actual
if "125 тестов" in workflow:
    # Count actual test files
    test_files = count_files("src/**/*.test.ts")
    integration_files = count_files("src/tests/integration/*.test.ts")
    lib_test_files = count_files("src/lib/**/*.test.ts")
    all_test_files = set(test_files + integration_files + lib_test_files)
    warn("Test count (WORKFLOW)", "WORKFLOW.md",
         f"Says '125 тестов' but found {len(all_test_files)} test files (need to count individual tests)")

# WORKFLOW: Tests "90" in another place
if "90 тест" in workflow or "90 tests" in workflow:
    warn("Test count 90 (WORKFLOW)", "WORKFLOW.md",
         "Says '90 tests' but also says '125 тестов' elsewhere -- inconsistent")

# WORKFLOW: Packages says "4 пакета" but there are 5
if "4 пакета" in workflow:
    fail("Packages count (WORKFLOW)", "WORKFLOW.md",
         f"Says '4 пакета' but packages/ has {actual_pkgs} ({', '.join(pkg_dirs)})")

# ========== 3. DOCUMENTATION vs DOCUMENTATION CONSISTENCY ==========

# 3a. WORKFLOW says "Prompt Studio: 5 модулей" but AUDIT-DONORS says "5 модулей: Write, Compare, Formulas, Frameworks, Intent" (no Techniques)
# Actually Prompt Studio page has 6 tabs if you count Techniques
# README says "6 modules: Write (live scoring) + Formulas (10) + Frameworks (11) + Techniques (17) + Compare + Intent"
if "5 модул" in workflow and "Prompt Studio" in workflow:
    warn("Prompt Studio modules", "WORKFLOW.md",
         "Says '5 модулей' for Prompt Studio but README says '6 modules' (includes Techniques tab)")

# 3b. UNIFIED_TASK_LIST says "37 models" in inventory but schema has actual_models
task_list_37 = re.search(r"Prisma schema: 37 models", task_list)
if task_list_37 and actual_models != 37:
    fail("Prisma 37 models (TaskList)", "UNIFIED_TASK_LIST.md",
         f"Inventory says '37 models' but schema.prisma has {actual_models}")

# 3c. UNIFIED_TASK_LIST says "66 route files" but let's verify
api_routes = count_files("src/app/api/**/route.ts")
if len(api_routes) != 66:
    warn("API routes count", "UNIFIED_TASK_LIST.md",
         f"Says '66 route files' but found {len(api_routes)} route.ts files")

# 3d. UNIFIED_TASK_LIST says "17 feature modules"
feature_dirs = [d for d in os.listdir(f"{ROOT}/src/features") if os.path.isdir(os.path.join(f"{ROOT}/src/features", d))]
if len(feature_dirs) != 17:
    warn("Feature modules count", "UNIFIED_TASK_LIST.md",
         f"Says '17 feature modules' but src/features/ has {len(feature_dirs)}: {feature_dirs}")

# 3e. UNIFIED_TASK_LIST says "i18n (en/ru, 8 namespaces)"
i18n_files = count_files("src/lib/i18n/translations/*.ts")
if len(i18n_files) != 8:
    warn("i18n namespaces", "UNIFIED_TASK_LIST.md",
         f"Says '8 namespaces' but found {len(i18n_files)} translation files")

# 3f. DOC says "(32 endpoints)" in architecture diagram
if "32 endpoints" in doc and len(api_routes) != 32:
    fail("API endpoints (Doc)", "3A-Studio-Documentation.md",
         f"Architecture diagram says '32 endpoints' but found {len(api_routes)} route.ts files")

# 3g. DOC says "16 фич-модулей" in project structure
if "16 фич-модул" in doc and len(feature_dirs) != 16:
    fail("Feature modules (Doc)", "3A-Studio-Documentation.md",
         f"Says '16 фич-модулей' but src/features/ has {len(feature_dirs)}: {feature_dirs}")

# 3h. DOC says "20 узлов" in Flow Editor section
if "20 узлов" in doc or "20 типов узлов" in doc:
    if actual_nodes != 20:
        fail("Node types (Doc)", "3A-Studio-Documentation.md",
             f"Says '20 типов узлов' but node-registry has {actual_nodes}")

# 3i. DOC says "30 моделей" in project structure
if "30 моделей" in doc:
    if actual_models != 30:
        fail("Prisma models (Doc-struct)", "3A-Studio-Documentation.md",
             f"Project structure says '30 моделей' but schema.prisma has {actual_models}")

# 3j. DOC says "15 страниц" for Wiki
if "15 страниц" in doc or "15 статей" in doc:
    if actual_wiki != 15:
        fail("Wiki pages (Doc)", "3A-Studio-Documentation.md",
             f"Says '15 страниц/статей' but wiki/pages/ has {actual_wiki}")

# 3k. DOC says "90+ тестов в 18 файлах" in tech stack
if "18 файл" in doc:
    warn("Test files count (Doc)", "3A-Studio-Documentation.md",
         f"Says '18 файлов' for tests, found {len(all_test_files)} test files")

# 3l. UNIFIED_TASK_LIST: Prompt Library "15 шаблонов" but WORKFLOW also says 15 -- verify
# src/features/prompt-library/data/prompt-library.ts would have the data
prompt_lib_data = read(f"{ROOT}/src/features/prompt-library/data/prompt-library.ts")
if prompt_lib_data:
    lib_templates = count_pattern(prompt_lib_data, r'id: "')
    if lib_templates > 0 and lib_templates != 15:
        warn("Prompt Library templates", "UNIFIED_TASK_LIST.md",
             f"Says '15 шаблонов' but prompt-library.ts has {lib_templates}")

# ========== 4. VERSION CONSISTENCY ==========

root_pkg = json.loads(read(f"{ROOT}/package.json"))
root_ver = root_pkg.get("version", "?")

shared_pkg = json.loads(read(f"{ROOT}/packages/shared/package.json"))
prompting_pkg = json.loads(read(f"{ROOT}/packages/prompting/package.json"))
ui_pkg = json.loads(read(f"{ROOT}/packages/ui/package.json"))
eslint_pkg = json.loads(read(f"{ROOT}/packages/eslint-plugin/package.json"))

for name, pkg in [("@stsgs/shared", shared_pkg), ("@stsgs/prompting", prompting_pkg),
                    ("@stsgs/ui", ui_pkg), ("eslint-plugin-3a", eslint_pkg)]:
    pkg_ver = pkg.get("version", "?")
    if pkg_ver != root_ver:
        info("Version mismatch", f"{name}/package.json",
             f"Version {pkg_ver} vs root {root_ver} (private packages, may be OK)")

# verify-docs is separate: version 1.0.0, not 0.1.0
verify_pkg = json.loads(read(f"{ROOT}/packages/verify-docs/package.json"))
if verify_pkg.get("version") == "1.0.0":
    info("verify-docs version", "packages/verify-docs/package.json",
         f"Version 1.0.0 while all other packages are {root_ver}")

# ========== 5. DUPLICATE CONFIG FILES ==========

# verify-docs.json vs verify-config.json are identical?
vd1 = read(f"{ROOT}/verify-docs.json")
vd2 = read(f"{ROOT}/verify-config.json")
if vd1 == vd2:
    warn("Duplicate config", "verify-config.json",
         "verify-config.json is IDENTICAL to verify-docs.json -- redundant file")
elif vd1.strip() == vd2.strip():
    warn("Duplicate config (whitespace)", "verify-config.json",
         "verify-config.json is identical to verify-docs.json (ignoring whitespace)")

# tools/verify-docs/ is duplicated in packages/verify-docs/?
tools_vd = f"{ROOT}/tools/verify-docs"
pkg_vd = f"{ROOT}/packages/verify-docs"
if os.path.isdir(tools_vd) and os.path.isdir(pkg_vd):
    warn("Duplicate verify-docs", "tools/verify-docs/",
         "verify-docs exists in BOTH tools/ and packages/ -- potential sync issue")

# ========== 6. FILE REFERENCE CHECKS ==========

# 6a. WORKFLOW mentions "docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md"
if "docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md" in workflow:
    if not os.path.exists(f"{ROOT}/docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md"):
        fail("Dead link", "WORKFLOW.md",
             "References 'docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md' which does not exist")

# 6b. DOC mentions StsDev-Wiki/ directory
if "StsDev-Wiki/" in doc:
    if not os.path.isdir(f"{ROOT}/StsDev-Wiki"):
        fail("Dead dir reference", "3A-Studio-Documentation.md",
             "Project structure lists 'StsDev-Wiki/' directory which does not exist")

# 6c. DOC mentions "(platform)" route group but actual is "(dashboard)"
if "(platform)" in doc:
    warn("Route group name", "3A-Studio-Documentation.md",
         "Mentions '(platform)' route group but actual layout is '(dashboard)'")

# 6d. DOC mentions "5 auth" pages but let's count
auth_pages = count_files("src/app/(auth)/*/page.tsx")
if "5 auth" in doc:
    if len(auth_pages) != 5:
        warn("Auth pages count (Doc)", "3A-Studio-Documentation.md",
             f"Says '5 auth' pages, found {len(auth_pages)}: {auth_pages}")

# 6e. README: "Additional: Landing page (/), Auth (login/signup/verify/reset/forgot)"
# Count auth pages
if len(auth_pages) != 5:
    warn("Auth pages count (README)", "README.md",
         f"Mentions 5 auth routes (login/signup/verify/reset/forgot), found {len(auth_pages)} page files")

# 6f. DOC mentions "db/" directory (SQLite)
if os.path.exists(f"{ROOT}/db"):
    pass  # exists
elif "db/" in doc and "Файл SQLite-базы" in doc:
    info("db/ directory", "3A-Studio-Documentation.md",
         "Mentions 'db/SQLite' directory but it may not exist in repo (generated at runtime)")

# ========== 7. WORKFLOW-MD PHASE/SCREEN INCONSISTENCIES ==========

# WORKFLOW says "Prompt Studio: Frameworks (4)" in status table
if "Frameworks \(4\)" in workflow:
    fail("Frameworks in status", "WORKFLOW.md",
         f"Status table says 'Frameworks (4)' but there are {actual_frameworks}")

# WORKFLOW: Phase 1 says "Wiki (14 статей, drawer)"
if "14 статей" in workflow:
    fail("Wiki in Phase 1", "WORKFLOW.md",
         f"Phase 1 checkbox says '14 статей' but there are {actual_wiki}")

# WORKFLOW: Prompt Library "15 шаблонов, 6 категорий"
# Check categories
prompt_categories = read(f"{ROOT}/src/features/prompt-library/data/prompt-categories.ts")
if prompt_categories:
    cat_count = count_pattern(prompt_categories, r"id: \"")
    if cat_count > 0 and cat_count != 6:
        warn("Prompt Library categories", "WORKFLOW.md",
             f"Says '6 категорий' but prompt-categories.ts has {cat_count}")

# ========== 8. AGENT_RULES.md REFERENCES ==========

agent_rules = read(f"{ROOT}/AGENT_RULES.md")

# 8a. Rule 11 Detection mentions check-hooks-integrity.sh
if "check-hooks-integrity.sh" in agent_rules:
    # This was a known AHG issue but the reference is in AAA Studio's AGENT_RULES.md
    scripts_dir = f"{ROOT}/scripts"
    has_integrity = os.path.exists(f"{scripts_dir}/check-hooks-integrity.sh")
    has_verify = os.path.exists(f"{scripts_dir}/check-hooks-verify.sh")
    if not has_integrity and has_verify:
        warn("AHG Rule 11 reference", "AGENT_RULES.md",
             "Rule 11 Detection mentions 'check-hooks-integrity.sh' but only 'check-hooks-verify.sh' exists in scripts/")

# 8b. Rule 16 references ARCH-SUBMODULE, Rule 17 references ARCH-UPSTREAM
if "ARCH-SUBMODULE" in agent_rules:
    info("ARCH-SUBMODULE ref", "AGENT_RULES.md",
         "Rule 16 references ARCH-SUBMODULE -- this is an AHG registry.json concept, not defined in AAA Studio")
if "ARCH-UPSTREAM" in agent_rules:
    info("ARCH-UPSTREAM ref", "AGENT_RULES.md",
         "Rule 17 references ARCH-UPSTREAM -- this is an AHG registry.json concept, not defined in AAA Studio")

# ========== 9. ENV VARIABLE CONSISTENCY ==========

# README env table vs DOC env table
readme_envs = set(re.findall(r"`(\w+)`", readme[readme.find("## Environment Variables"):readme.find("## Development Rules")]))
doc_envs_section = doc[doc.find("Переменные окружения"):doc.find("Доступные скрипты")] if "Переменные окружения" in doc else ""
doc_envs = set(re.findall(r"`(\w+)`", doc_envs_section))

# Check for env vars mentioned in one but not the other
readme_only = readme_envs - doc_envs - {"DATABASE_URL", "AUTH_SECRET", "ENCRYPTION_KEY"}  # common ones
doc_only = doc_envs - readme_envs - {"DATABASE_URL", "AUTH_SECRET", "ENCRYPTION_KEY"}

if "ADMIN_EMAIL" in doc_only and "ADMIN_EMAIL" not in readme_envs:
    warn("Env var mismatch", "3A-Studio-Documentation.md",
         "Lists ADMIN_EMAIL but README.md does not")
if "ADMIN_EMAIL" in doc_envs and "ADMIN_EMAIL" not in readme_envs:
    warn("Env var mismatch", "README.md",
         "Does not list ADMIN_EMAIL but 3A-Studio-Documentation.md does")
if "ZAI_BASE_URL" in readme_envs and "ZAI_BASE_URL" not in doc_envs:
    warn("Env var mismatch", "3A-Studio-Documentation.md",
         "Missing ZAI_BASE_URL which README.md lists")

# ========== 10. INSTALL INSTRUCTIONS ==========

# README says "bun install" but DOC says "pnpm install"
if "bun install" in readme and "pnpm install" in doc:
    warn("Install command", "README.md vs 3A-Studio-Documentation.md",
         "README says 'bun install', DOC says 'pnpm install' -- which is correct?")

# DOC says "npx prisma migrate dev" but README says "bun run db:push"
if "npx prisma migrate dev" in doc and "bun run db:push" in readme:
    warn("DB setup command", "README.md vs 3A-Studio-Documentation.md",
         "DOC says 'npx prisma migrate dev --name init', README says 'bun run db:push' -- inconsistent")

# DOC says "npx prisma db seed" but package.json has "db:seed": "bun run prisma/seed.ts"
if "npx prisma db seed" in doc:
    warn("Seed command", "3A-Studio-Documentation.md",
         "Says 'npx prisma db seed' but package.json has 'db:seed': 'bun run prisma/seed.ts'")

# ========== 11. DEAD/MISLEADING REFERENCES ==========

# DOC mentions "upload/" directory
if not os.path.isdir(f"{ROOT}/upload"):
    if "upload/" in doc:
        warn("Dead dir", "3A-Studio-Documentation.md",
             "Project structure lists 'upload/' directory which does not exist")

# DOC mentions ".env.example"
if not os.path.exists(f"{ROOT}/.env.example"):
    if ".env.example" in doc:
        warn("Dead file", "3A-Studio-Documentation.md",
             "Installation mentions '.env.example' which does not exist")

# ========== OUTPUT ==========
print(f"\n{'='*70}")
print(f"AAA Studio Cross-Consistency Audit Results")
print(f"{'='*70}")

fails = [r for r in results if r[0] == "FAIL"]
warns = [r for r in results if r[0] == "WARN"]
infos = [r for r in results if r[0] == "INFO"]

print(f"\nFAIL: {len(fails)}  WARN: {len(warns)}  INFO: {len(infos)}")
print()

if fails:
    print("--- FAIL ---")
    for i, (sev, name, file, detail) in enumerate(fails, 1):
        print(f"  {i}. [{name}] {file}")
        print(f"     {detail}")
    print()

if warns:
    print("--- WARN ---")
    for i, (sev, name, file, detail) in enumerate(warns, 1):
        print(f"  {i}. [{name}] {file}")
        print(f"     {detail}")
    print()

if infos:
    print("--- INFO ---")
    for i, (sev, name, file, detail) in enumerate(infos, 1):
        print(f"  {i}. [{name}] {file}")
        print(f"     {detail}")
    print()

print(f"Total issues: {len(fails) + len(warns) + len(infos)}")