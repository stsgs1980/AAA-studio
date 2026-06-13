#!/usr/bin/env python3
"""
AAA Studio Cross-Consistency Audit v1.0
Checks numerical claims, file references, and cross-document consistency.
"""

import re, os, sys
from pathlib import Path
from collections import defaultdict

ROOT = Path("/home/z/my-project")
EXCLUDE = {"anti-hallucination-guard", "node_modules", ".next", ".git", "download", "skills"}

results = []  # (severity, file, claim, actual, detail)

def add(sev, file, claim, actual, detail):
    results.append((sev, file, claim, actual, detail))

def read(path):
    try:
        return (ROOT / path).read_text()
    except:
        return ""

def count_in_file(path, pattern, flags=0):
    return len(re.findall(pattern, read(path), flags))

def count_files(glob_path):
    return len(list(ROOT.glob(glob_path)))

# ============================================================
# 1. PRISMA MODEL COUNT
# ============================================================
prisma_models = count_in_file("prisma/schema.prisma", r"^model \w+", re.MULTILINE)
add("INFO", "prisma/schema.prisma", "Prisma models", prisma_models, "Source of truth")

# Docs claims
doc_claims_models = {
    "README.md": (r"Prisma Schema \(36 models\)", "36"),
    "3A-Studio-Documentation.md": (r"37 Prisma", "37"),
    "UNIFIED_TASK_LIST.md": (r"37 models", "37"),
    "WORKFLOW.md": (r"30 моделей", "30"),
}
for doc, (pat, claimed) in doc_claims_models.items():
    if re.search(pat, read(doc)):
        if claimed != str(prisma_models):
            add("FAIL", doc, f"Prisma models = {claimed}", prisma_models,
                f"schema.prisma has {prisma_models} models, doc says {claimed}")

# ============================================================
# 2. NODE TYPES
# ============================================================
node_reg = read("src/features/flow-editor/nodes/node-registry.ts")
node_types = re.findall(r"type:\s*'([^']+)'", node_reg)
# deduplicate
node_types_unique = sorted(set(node_types))
actual_nodes = len(node_types_unique)

doc_claims_nodes = {
    "README.md": [
        (r"\(5 AI \+ 4 Mgmt \+ 4 Data \+ 2 Knowledge \+ 2 Integration \+ 3 Special\)", "20"),
        (r"20 node types", "20"),
    ],
    "3A-Studio-Documentation.md": [
        (r"18 типов узлов", "18"),
        (r"20 узлов", "20"),
        (r"20 node types", "20"),
    ],
    "WORKFLOW.md": [
        (r"18 nodes", "18"),
        (r"20 nodes", "20"),
    ],
    "UNIFIED_TASK_LIST.md": [
        (r"18 node types", "18"),
        (r"20 node types", "20"),
    ],
}
for doc, claims in doc_claims_nodes.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_nodes):
                add("FAIL", doc, f"Node types = {claimed}", actual_nodes,
                    f"node-registry has {actual_nodes} unique types: {node_types_unique}")

# ============================================================
# 3. WIKI PAGES
# ============================================================
wiki_pages_files = count_files("src/features/wiki/pages/*.tsx")
wiki_registry = read("src/features/wiki/data/page-registry.ts")
wiki_slugs = re.findall(r'"([^"]+)":\s*lazy', wiki_registry)
actual_wiki = len(wiki_slugs)

doc_claims_wiki = {
    "README.md": [
        (r"16 articles", "16"),
        (r"16 страниц", "16"),
        (r"15 статей", "15"),
    ],
    "3A-Studio-Documentation.md": [
        (r"15 страниц", "15"),
        (r"16 статей", "16"),
        (r"Wiki \(15", "15"),
        (r"Wiki \(16", "16"),
    ],
    "WORKFLOW.md": [
        (r"14 статей", "14"),
        (r"15 статей", "15"),
        (r"16 статей", "16"),
        (r"15 pages", "15"),
        (r"16 pages", "16"),
    ],
}
for doc, claims in doc_claims_wiki.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_wiki):
                add("FAIL", doc, f"Wiki articles = {claimed}", actual_wiki,
                    f"page-registry.ts has {actual_wiki} entries: {wiki_slugs}")

# ============================================================
# 4. FORMULAS COUNT
# ============================================================
formulas_content = read("packages/prompting/src/formulas/index.ts")
formula_ids = re.findall(r'id:\s*"([^"]+)"', formulas_content)
# Deduplicate by lowercase
formula_ids_unique = sorted(set(f.lower() for f in formula_ids))
actual_formulas = len(formula_ids_unique)

doc_claims_formulas = {
    "README.md": [(r"Formulas \(10\)", "10")],
    "WORKFLOW.md": [(r"Formulas \(10\)", "10"), (r"10 формул", "10")],
    "3A-Studio-Documentation.md": [(r"10 когнитивных формул", "10")],
}
for doc, claims in doc_claims_formulas.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_formulas):
                add("FAIL", doc, f"Formulas = {claimed}", actual_formulas,
                    f"formulas/index.ts has {actual_formulas} unique IDs: {formula_ids_unique}")

# ============================================================
# 5. FRAMEWORKS COUNT
# ============================================================
fw_content = read("packages/prompting/src/frameworks/data.ts")
fw_ids = re.findall(r'id:\s*"([^"]+)"', fw_content)
fw_ids_unique = sorted(set(f.lower() for f in fw_ids))
actual_fw = len(fw_ids_unique)

doc_claims_fw = {
    "README.md": [(r"Frameworks \(11\)", "11")],
    "WORKFLOW.md": [(r"Frameworks \(4\)", "4"), (r"Frameworks \(11\)", "11")],
    "3A-Studio-Documentation.md": [(r"11 промпт-фреймворков", "11")],
}
for doc, claims in doc_claims_fw.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_fw):
                add("FAIL", doc, f"Frameworks = {claimed}", actual_fw,
                    f"frameworks/data.ts has {actual_fw} unique IDs: {fw_ids_unique}")

# ============================================================
# 6. TECHNIQUES COUNT
# ============================================================
tech_content = read("packages/prompting/src/techniques/data.ts")
tech_ids = re.findall(r'id:\s*"([^"]+)"', tech_content)
tech_ids_unique = sorted(set(t.lower() for t in tech_ids))
actual_tech = len(tech_ids_unique)

doc_claims_tech = {
    "README.md": [(r"Techniques \(17\)", "17")],
    "3A-Studio-Documentation.md": [(r"17 техник", "17")],
}
for doc, claims in doc_claims_tech.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_tech):
                add("FAIL", doc, f"Techniques = {claimed}", actual_tech,
                    f"techniques/data.ts has {actual_tech} unique IDs")

# ============================================================
# 7. ESLINT RULES COUNT
# ============================================================
eslint_content = read("packages/eslint-plugin/src/index.ts")
eslint_rules = re.findall(r'"(max-lines|max-use-state|no-cross-layer|no-unicode-escapes)"', eslint_content)
eslint_rules_unique = sorted(set(eslint_rules))
actual_eslint = len(eslint_rules_unique)

doc_claims_eslint = {
    "README.md": [(r"4 rules:", "4")],
    "3A-Studio-Documentation.md": [(r"4 правила", "4"), (r"4 правил", "4")],
    "WORKFLOW.md": [(r"3 правила", "3"), (r"4 правила", "4")],
    "UNIFIED_TASK_LIST.md": [(r"4 rules", "4"), (r"4 правила", "4")],
}
for doc, claims in doc_claims_eslint.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_eslint):
                add("FAIL", doc, f"ESLint rules = {claimed}", actual_eslint,
                    f"index.ts has {actual_eslint} rules: {eslint_rules_unique}")

# ============================================================
# 8. MONOREPO PACKAGES COUNT
# ============================================================
pkg_dirs = [d for d in (ROOT / "packages").iterdir()
            if d.is_dir() and not d.name.startswith(".") and (d / "package.json").exists()]
actual_pkgs = len(pkg_dirs)
pkg_names = [d.name for d in pkg_dirs]

doc_claims_pkgs = {
    "README.md": [(r"Monorepo Packages \(5\)", "5"), (r"Packages \(5\)", "5")],
    "WORKFLOW.md": [(r"4 пакета", "4"), (r"4 packages", "4")],
    "3A-Studio-Documentation.md": [(r"четырьмя внутренними пакетами", "4"), (r"5 монорепозиторий пакет", "5"), (r"4 пакета", "4")],
    "UNIFIED_TASK_LIST.md": [(r"4 packages", "4"), (r"5 packages", "5")],
}
for doc, claims in doc_claims_pkgs.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_pkgs):
                add("FAIL", doc, f"Packages = {claimed}", actual_pkgs,
                    f"packages/ has {actual_pkgs} dirs with package.json: {pkg_names}")

# ============================================================
# 9. i18n NAMESPACES
# ============================================================
i18n_index = read("src/lib/i18n/translations/index.ts")
i18n_imports = re.findall(r"from '\./(\w+)'", i18n_index)
# Filter to actual namespace imports (not pages-en/pages-ru)
i18n_base = sorted(set(i for i in i18n_imports if not i.endswith("-en") and not i.endswith("-ru")))
actual_i18n = len(i18n_base)

doc_claims_i18n = {
    "README.md": [(r"7 namespaces", "7")],
    "WORKFLOW.md": [(r"7 namespaces", "7"), (r"7 неймспейсов", "7")],
    "3A-Studio-Documentation.md": [(r"8 namespaces", "8"), (r"8 namespace", "8")],
}
for doc, claims in doc_claims_i18n.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_i18n):
                add("FAIL", doc, f"i18n namespaces = {claimed}", actual_i18n,
                    f"translations/index.ts imports {actual_i18n} base namespaces: {i18n_base}")

# ============================================================
# 10. API ROUTE FILES
# ============================================================
api_routes = list(ROOT.glob("src/app/api/**/route.ts"))
# Exclude AHG
api_routes = [r for r in api_routes if "anti-hallucination-guard" not in str(r)]
actual_api = len(api_routes)

doc_claims_api = {
    "3A-Studio-Documentation.md": [(r"32 endpoints", "32"), (r"66 API", "66"), (r"66 API-эндпоинт", "66")],
    "UNIFIED_TASK_LIST.md": [(r"66 route files", "66")],
    "README.md": [(r"66 route", "66"), (r"32 endpoints", "32")],
}
for doc, claims in doc_claims_api.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_api):
                add("FAIL", doc, f"API route files = {claimed}", actual_api,
                    f"Found {actual_api} route.ts files in src/app/api/")

# ============================================================
# 11. FLOW TEMPLATES COUNT
# ============================================================
templates_content = read("src/features/pipelines/data/flow-templates.ts")
# Count only the 6 exported template IDs in FLOW_TEMPLATES array
template_ids = re.findall(r'^const \w+: FlowTemplate = \{\s*id: "([^"]+)"', templates_content, re.MULTILINE)
template_ids_unique = sorted(set(template_ids))
actual_templates = len(template_ids_unique)

doc_claims_templates = {
    "README.md": [(r"6 flow templates", "6"), (r"6 шаблонов", "6")],
    "WORKFLOW.md": [(r"6 flow templates", "6"), (r"6 шаблонов", "6")],
}
for doc, claims in doc_claims_templates.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_templates):
                add("FAIL", doc, f"Flow templates = {claimed}", actual_templates,
                    f"flow-templates.ts has {actual_templates} unique IDs: {template_ids_unique}")

# ============================================================
# 12. EDGE TYPES COUNT
# ============================================================
flow_validations = read("src/lib/validations/flow.ts")
edge_match = re.findall(r"'(command|sync|twin|delegate|feedback|supervise|broadcast)'", flow_validations)
actual_edges = len(sorted(set(edge_match)))

doc_claims_edges = {
    "README.md": [(r"7 edge types", "7"), (r"7 типов", "7")],
    "WORKFLOW.md": [(r"7 edge types", "7"), (r"7 типов", "7")],
}
for doc, claims in doc_claims_edges.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_edges):
                add("FAIL", doc, f"Edge types = {claimed}", actual_edges,
                    f"flow.ts has {actual_edges} edge types")

# ============================================================
# 13. SCORING CRITERIA COUNT
# ============================================================
scoring_content = read("packages/prompting/src/scoring/index.ts")
criteria = re.findall(r"^\s+(\w+):\s*number;", scoring_content, re.MULTILINE)
criteria = [c for c in criteria if c != "overall"]
actual_criteria = len(criteria)

doc_claims_criteria = {
    "README.md": [(r"6-criteria scoring", "6"), (r"6-мерн", "6"), (r"6 критериев", "6")],
    "3A-Studio-Documentation.md": [(r"6 критериев", "6")],
}
for doc, claims in doc_claims_criteria.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_criteria):
                add("FAIL", doc, f"Scoring criteria = {claimed}", actual_criteria,
                    f"scoring/index.ts has {actual_criteria}: {criteria}")

# ============================================================
# 14. TEST COUNTS
# ============================================================
test_files = list(ROOT.glob("src/**/*.test.ts"))
test_files = [t for t in test_files if "anti-hallucination-guard" not in str(t)]
total_tests = 0
per_file = {}
for tf in test_files:
    content = tf.read_text()
    count = len(re.findall(r"\bit\(|\btest\(|\bdescribe\(", content))
    # subtract describe counts (they are not tests)
    describe_count = len(re.findall(r"\bdescribe\(", content))
    actual_count = count - describe_count
    total_tests += actual_count
    per_file[tf.name] = actual_count

doc_claims_tests = {
    "WORKFLOW.md": [(r"125 тестов", "125"), (r"125 tests", "125")],
    "UNIFIED_TASK_LIST.md": [
        (r"90 tests", "90"),
        (r"90 тест", "90"),
        (r"Total: 12 files, 90 tests", "90"),
    ],
    "3A-Studio-Documentation.md": [(r"90\+ тестов в 18 файлах", "90+ in 18"),
                                    (r"90\+ тестов", "90+"),
                                    (r"18 файлах", "18")],
}
for doc, claims in doc_claims_tests.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if "18 файл" in pat and len(test_files) != 18:
                add("FAIL", doc, f"Test files = 18", len(test_files),
                    f"Found {len(test_files)} test files")
            elif "90" in claimed and total_tests != 90:
                add("FAIL", doc, f"Tests = {claimed}", total_tests,
                    f"Counted {total_tests} it()/test() across {len(test_files)} files")
            elif "125" in claimed and total_tests != 125:
                add("FAIL", doc, f"Tests = {claimed}", total_tests,
                    f"Counted {total_tests} it()/test() across {len(test_files)} files")

# ============================================================
# 15. FEATURE MODULES COUNT
# ============================================================
feature_dirs = [d for d in (ROOT / "src/features").iterdir() if d.is_dir()]
actual_features = len(feature_dirs)
feature_names = sorted(d.name for d in feature_dirs)

doc_claims_features = {
    "3A-Studio-Documentation.md": [(r"16 фич-модулей", "16"), (r"17 feature", "17"), (r"17 фич", "17")],
    "UNIFIED_TASK_LIST.md": [(r"17 feature", "17")],
}
for doc, claims in doc_claims_features.items():
    content = read(doc)
    for pat, claimed in claims:
        if re.search(pat, content):
            if claimed != str(actual_features):
                add("FAIL", doc, f"Feature modules = {claimed}", actual_features,
                    f"src/features/ has {actual_features} dirs: {feature_names}")

# ============================================================
# 16. DUPLICATE verify-docs (packages/ vs tools/)
# ============================================================
pkg_vd = ROOT / "packages" / "verify-docs" / "package.json"
tools_vd = ROOT / "tools" / "verify-docs" / "package.json"
if pkg_vd.exists() and tools_vd.exists():
    pkg_vd_src = sorted(f.name for f in (ROOT / "packages" / "verify-docs" / "src").iterdir()) if (ROOT / "packages" / "verify-docs" / "src").exists() else []
    tools_vd_src = sorted(f.name for f in (ROOT / "tools" / "verify-docs" / "src").iterdir()) if (ROOT / "tools" / "verify-docs" / "src").exists() else []
    if pkg_vd.read_text() == tools_vd.read_text():
        add("WARN", "packages/verify-docs/ + tools/verify-docs/",
            "Duplicate verify-docs packages", "2 copies",
            f"Identical package.json. packages/ has {len(pkg_vd_src)} src files, tools/ has {len(tools_vd_src)} src files. tools/ has extra: {set(tools_vd_src) - set(pkg_vd_src)}")

# ============================================================
# 17. CROSS-DOC SCREEN COUNT (WORKFLOW title says "12 screens")
# ============================================================
workflow = read("WORKFLOW.md")
if re.search(r"12 экранов", workflow):
    add("FAIL", "WORKFLOW.md", "Architecture title says '12 screens'",
        "19 dashboard screens + auth + landing",
        "WORKFLOW.md title says '12 экранов, 4 пакета' but body lists 19 dashboard screens")

# ============================================================
# 18. WORKFLOW.md says "Frameworks (4)" in Prompt Studio row
# ============================================================
if re.search(r"Frameworks \(4\)", workflow):
    add("FAIL", "WORKFLOW.md", "Prompt Studio: Frameworks (4)", actual_fw,
        f"frameworks/data.ts has {actual_fw} frameworks, not 4")

# ============================================================
# 19. README says "36 models" for donor 3a-studio-mas
# ============================================================
readme = read("README.md")
if "Prisma Schema (36 models)" in readme:
    # This refers to the DONOR repo, not current. Check if it's in the Resource Map table.
    if "3a-studio-mas" in readme and "Prisma Schema (36 models)" in readme:
        add("WARN", "README.md", "Donor 3a-studio-mas: 'Prisma Schema (36 models)'",
            f"Current project has {prisma_models} models",
            "This refers to the DONOR repo, not current. May be stale if donor was updated.")

# ============================================================
# 20. MIDDLEWARE IS DISABLED
# ============================================================
middleware = read("src/middleware.ts")
if "Auth disabled" in middleware and "return NextResponse.next()" in middleware:
    if "Edge middleware" in read("3A-Studio-Documentation.md") or "Edge middleware" in readme:
        add("WARN", "src/middleware.ts", "Auth middleware is DISABLED",
            "No auth check running",
            "middleware.ts has 'Auth disabled' comment and returns NextResponse.next() for ALL routes, but docs claim JWT Edge middleware protection")

# ============================================================
# 21. STALE TASK_STATE.json
# ============================================================
import json
ts_path = ROOT / "TASK_STATE.json"
if ts_path.exists():
    ts = json.loads(ts_path.read_text())
    last_updated = ts.get("meta", {}).get("lastUpdated", "")
    if "2026-06-03" in last_updated:
        add("WARN", "TASK_STATE.json", f"lastUpdated = {last_updated}",
            "11+ days stale (current: 2026-06-14)",
            "TASK_STATE.json was last updated 2026-06-03 but current date is 2026-06-14")

# ============================================================
# 22. WORKFLOW.md Prompt Studio modules discrepancy
# ============================================================
if "5 модулей: Write, Formulas, Frameworks, Compare, Intent" in workflow:
    pass  # This is correct
if "Prompt Studio v2 (scoring, формулы, фреймворки, compare)" in workflow:
    add("FAIL", "WORKFLOW.md", "Prompt Studio '4 modules' in Phase 1 row",
        "5 modules",
        "Phase 1 row says 'scoring, формулы, фреймворки, compare' (4 modules) but Prompt Studio has 5: Write, Formulas, Frameworks, Compare, Intent (+ Techniques)")

# ============================================================
# 23. 3A-Studio-Documentation.md says "8 namespaces" 
# ============================================================
doc3a = read("3A-Studio-Documentation.md")
if "8 namespaces" in doc3a or "8 namespace" in doc3a:
    if actual_i18n != 8:
        add("FAIL", "3A-Studio-Documentation.md", "i18n = 8 namespaces", actual_i18n,
            f"translations/index.ts has {actual_i18n} base namespace imports: {i18n_base}")

# ============================================================
# 24. verify-docs.json crossRepo references to non-existent paths
# ============================================================
vd_config = json.loads(read("verify-docs.json"))
seen_repos = set()
for cr in vd_config.get("crossRepo", []):
    repo = cr.get("repo", "")
    if repo in seen_repos:
        continue
    seen_repos.add(repo)
    repo_path = ROOT / repo
    if not repo_path.exists():
        add("WARN", "verify-docs.json",
            f"crossRepo repo '{repo}' does not exist",
            "N/A",
            f"Referenced repo path {repo_path} not found in sandbox. Cross-repo checks will be skipped.")

# ============================================================
# 25. WORKFLOW.md says "eslint-plugin-3a (3 правила)" in packages table
# ============================================================
if re.search(r"eslint-plugin-3a \(3 правила\)", workflow):
    add("FAIL", "WORKFLOW.md", "eslint-plugin-3a = 3 rules", actual_eslint,
        f"Actual: {actual_eslint} rules: {eslint_rules_unique}")

# ============================================================
# 26. README note about "planned but not implemented" screens
# ============================================================
if "Approvals, Cost Monitor, Analysis, and Comparison screens are planned but not yet implemented" in readme:
    utl = read("UNIFIED_TASK_LIST.md")
    if "HITL Approvals" in utl and "DONE" in utl:
        add("WARN", "README.md",
            "Note says Approvals/Cost screens 'planned but not yet implemented'",
            "Partially DONE (Wave 7.5)",
            "UNIFIED_TASK_LIST shows ApprovalRequest (HITL), CostRecord, LatencyAlert APIs+UI all DONE in Wave 7.5")

# ============================================================
# 27. 3A-Studio-Documentation.md says "37 Prisma моделей" in section title
# ============================================================
# Already checked above - verified correct

# ============================================================
# 28. WORKFLOW.md says "Prisma Schema -- 30 models" in Wave 0.2
# ============================================================
if "Prisma Schema -- 30 models" in workflow:
    add("FAIL", "WORKFLOW.md", "Wave 0.2: 'Prisma Schema -- 30 models'",
        prisma_models,
        f"schema.prisma has {prisma_models} models, Wave 0.2 task says 30")

# ============================================================
# 29. WORKFLOW.md Wiki count inconsistency within same file
# ============================================================
wiki_14 = bool(re.search(r"Wiki.*14 статей", workflow))
wiki_15 = bool(re.search(r"Wiki.*15 статей", workflow))
if wiki_14 and wiki_15:
    add("WARN", "WORKFLOW.md", "Wiki articles: both 14 and 15 claimed", actual_wiki,
        f"Same file claims both 14 and 15. Actual: {actual_wiki} in page-registry")

# ============================================================
# 30. 3A-Studio-Documentation.md: "packages/verify-docs (субмодуль)"
# ============================================================
if "verify-docs (субмодуль)" in doc3a or "verify-docs (submodule)" in doc3a:
    gitmodules = read(".gitmodules")
    if "verify-docs" not in gitmodules:
        add("FAIL", "3A-Studio-Documentation.md",
            "verify-docs described as 'submodule'",
            "Not a git submodule",
            ".gitmodules does not list verify-docs. It's a regular directory (duplicated in packages/ and tools/)")

# ============================================================
# 31. UNIFIED_TASK_LIST says "66 route files" but actual is different
# ============================================================
utl_content = read("UNIFIED_TASK_LIST.md")
if "66 route files" in utl_content:
    if actual_api != 66:
        add("FAIL", "UNIFIED_TASK_LIST.md", "66 route files", actual_api,
            f"Found {actual_api} route.ts files in src/app/api/")

# ============================================================
# 32. cascade-state.json ahgVersion vs actual AHG
# ============================================================
cascade = json.loads(read("cascade-state.json"))
ahg_ver = cascade.get("ahgVersion", "")
ahg_pkg = ROOT / "anti-hallucination-guard" / "package.json"
if ahg_pkg.exists():
    ahg_real = json.loads(ahg_pkg.read_text()).get("version", "unknown")
    if ahg_ver != ahg_real:
        add("WARN", "cascade-state.json",
            f"ahgVersion = {ahg_ver}",
            ahg_real,
            f"AHG package.json has version {ahg_real}")

# ============================================================
# 33. SCREENS TABLE in README (19) vs 3A-Studio-Documentation (26 pages)
# ============================================================
# README explicitly says "Screens (19)" for dashboard area
# 3A-Studio-Documentation says "26 pages (5 auth + 1 root + 20 platform)"
# 20 platform = 19 dashboard + wiki/[slug] dynamic route
# This is NOT a contradiction - they count different scopes
# But let's verify the 20 platform count
platform_pages = list(ROOT.glob("src/app/(dashboard)/**/page.tsx"))
actual_platform = len(platform_pages)
if "20 platform" in doc3a and actual_platform != 20:
    add("WARN", "3A-Studio-Documentation.md",
        "20 platform pages", actual_platform,
        f"Found {actual_platform} page.tsx files in src/app/(dashboard)/")

# ============================================================
# 34. WORKFLOW.md says "Prompt Library (15 шаблонов)" 
# ============================================================
if "15 шаблонов" in workflow or "15 templates" in workflow:
    # Count actual prompts across data files
    prompt_lib = read("src/features/prompt-library/data/prompt-library.ts")
    prompt_count = len(re.findall(r"export const \w+Prompts", prompt_lib))
    # Also count from individual files
    total_prompts = 0
    for pf in ROOT.glob("src/features/prompt-library/data/*-prompts.ts"):
        c = pf.read_text()
        total_prompts += len(re.findall(r"name:", c))
    # Add system prompts
    sys_prompts = read("src/features/prompt-library/data/system-prompts.ts")
    total_prompts += len(re.findall(r"name:", sys_prompts))
    if total_prompts != 15 and total_prompts > 0:
        add("WARN", "WORKFLOW.md", f"Prompt Library: 15 templates", total_prompts,
            f"Counted {total_prompts} named prompts across data files")

# ============================================================
# 35. 3A-Studio-Documentation.md: "18 node types" in section 10 header
# ============================================================
# Only flag if it appears in sections about 3A Studio itself, not donor tables
doc3a_sections = doc3a.split("## ")
studio_sections = [s for s in doc3a_sections if not any(d in s for d in ["FLOW_STUDIO", "P-MAS", "MVP-Flow", "prompting-v0.0"])]
studio_text = "\n".join(studio_sections)
if ("18 типов узлов" in studio_text or "18 node types" in studio_text) and "FLOW_STUDIO" not in doc3a[doc3a.find("18 node types")-200:doc3a.find("18 node types")+50] if "18 node types" in doc3a else True:
    if actual_nodes != 18:
        add("FAIL", "3A-Studio-Documentation.md",
            "Section 10: '18 node types'", actual_nodes,
            f"node-registry.ts has {actual_nodes} types. Doc also claims 20 in other places.")

# ============================================================
# 36. UNIFIED_TASK_LIST says "12 files, 90 tests" but actual differs
# ============================================================
if "12 files, 90 tests" in utl_content:
    if len(test_files) != 12:
        add("FAIL", "UNIFIED_TASK_LIST.md", "12 test files", len(test_files),
            f"Found {len(test_files)} test files")
    if total_tests != 90:
        add("FAIL", "UNIFIED_TASK_LIST.md", "90 tests", total_tests,
            f"Counted {total_tests} it()/test()")

# ============================================================
# 37. WORKFLOW.md says "Tests | 125 тестов" in screens table
# ============================================================
if "125 тестов" in workflow or "125 tests" in workflow:
    add("FAIL", "WORKFLOW.md", "Tests: 125", total_tests,
        f"Counted {total_tests} it()/test() across {len(test_files)} files")

# ============================================================
# 38. Check WORKFLOW.md "Prompt Studio" screen row for module count
# ============================================================
# The screen table says "5 модулей" but Phase 1 says "4 modules" 
# Check if "Techniques" is listed
if "Techniques" not in workflow.split("Prompt Studio")[1].split("\n\n")[0] if "Prompt Studio" in workflow else True:
    if "Techniques (17)" in readme and "Prompt Studio" in workflow:
        ps_section = workflow[workflow.index("Prompt Studio"):] if "Prompt Studio" in workflow else ""
        screen_row_end = ps_section.find("\n|") if "|" in ps_section[1:] else len(ps_section)
        screen_row = ps_section[:screen_row_end + 1] if screen_row_end > 0 else ps_section[:200]
        if "Techniques" not in screen_row and "5 модул" in workflow:
            add("WARN", "WORKFLOW.md",
                "Prompt Studio screen row omits Techniques module",
                "5 modules claimed elsewhere",
                "Screen table row may be missing Techniques mention while body text says 5 modules")

# ============================================================
# OUTPUT
# ============================================================
fails = [r for r in results if r[0] == "FAIL"]
warns = [r for r in results if r[0] == "WARN"]
infos = [r for r in results if r[0] == "INFO"]

print(f"{'='*80}")
print(f"AAA Studio Cross-Consistency Audit")
print(f"{'='*80}")
print(f"Total issues: {len(fails) + len(warns)}")
print(f"  FAIL: {len(fails)}")
print(f"  WARN: {len(warns)}")
print(f"  INFO: {len(infos)}")
print(f"{'='*80}")

if infos:
    print(f"\n--- INFO ---")
    for i, (sev, file, claim, actual, detail) in enumerate(infos, 1):
        print(f"\n  INFO-{i:02d} | {file}")
        print(f"  Claim: {claim}")
        print(f"  Actual: {actual}")
        print(f"  Detail: {detail}")

if fails:
    print(f"\n--- FAIL ---")
    for i, (sev, file, claim, actual, detail) in enumerate(fails, 1):
        print(f"\n  FAIL-{i:02d} | {file}")
        print(f"  Claim: {claim}")
        print(f"  Actual: {actual}")
        print(f"  Detail: {detail}")

if warns:
    print(f"\n--- WARN ---")
    for i, (sev, file, claim, actual, detail) in enumerate(warns, 1):
        print(f"\n  WARN-{i:02d} | {file}")
        print(f"  Claim: {claim}")
        print(f"  Actual: {actual}")
        print(f"  Detail: {detail}")

print(f"\n{'='*80}")
print(f"SUMMARY: {len(fails)} FAIL + {len(warns)} WARN")
print(f"{'='*80}")