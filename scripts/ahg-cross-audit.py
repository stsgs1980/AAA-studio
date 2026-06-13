#!/usr/bin/env python3
"""
AHG Cross-Consistency Audit v2 (post-update check)
Checks internal consistency of anti-hallucination-guard submodule.
"""

import re, json
from pathlib import Path

AHG = Path("/home/z/my-project/anti-hallucination-guard")
results = []

def add(sev, f, claim, actual, detail):
    results.append((sev, f, claim, actual, detail))

def read(p):
    try: return (AHG / p).read_text()
    except: return ""

def exists(p):
    return (AHG / p).exists()

# ============================================================
# 1. VERSION CONSISTENCY (source of truth: registry.json version field)
# ============================================================
reg = json.loads(read("registry.json"))
truth_ver = reg.get("version", "?")

# Check all version sources
ver_sources = {
    "skills/anti-hallucination-guard/SKILL.md": (r"Anti-Hallucination Guard v([\d.]+)", None),
    "tools/verify-docs/package.json": None,  # json parse
    "scripts/ahg.sh": (r"version=.*?v([\d.]+)", None),
}
# SKILL.md
m = re.search(r"Anti-Hallucination Guard v([\d.]+)", read("skills/anti-hallucination-guard/SKILL.md"))
sk_ver = m.group(1) if m else "?"
if sk_ver != truth_ver:
    add("FAIL", "SKILL.md", f"version = {sk_ver}", truth_ver, f"registry says {truth_ver}")

# verify-docs/package.json
try:
    vd = json.loads(read("tools/verify-docs/package.json"))
    vd_ver = vd.get("version", "?")
    # verify-docs has its own versioning, check if it matches
    if vd_ver != truth_ver:
        add("WARN", "tools/verify-docs/package.json", f"version = {vd_ver}", truth_ver,
            "verify-docs may have independent versioning")
except: pass

# ahg.sh
m = re.search(r"version=.*?v([\d.]+)", read("scripts/ahg.sh"))
ahg_ver = m.group(1) if m else "?"
if ahg_ver != truth_ver:
    add("FAIL", "scripts/ahg.sh", f"version = {ahg_ver}", truth_ver, f"registry says {truth_ver}")

# CHANGELOG latest
cl = read("CHANGELOG.md")
m = re.search(r"## \[([\d.]+)\]", cl)
cl_ver = m.group(1) if m else "?"
if cl_ver != truth_ver:
    add("FAIL", "CHANGELOG.md", f"latest = {cl_ver}", truth_ver, f"registry says {truth_ver}")

# CHANGELOG date vs registry date
cl_date_match = re.search(r"## \[[\d.]+\] - (\d{4}-\d{2}-\d{2})", cl)
reg_date = reg.get("updated", "")
if cl_date_match:
    cl_date = cl_date_match.group(1)
    if cl_date != reg_date:
        add("WARN", "CHANGELOG.md", f"date = {cl_date}", reg_date, "registry.updated may differ")

# README.md version mentions
readme = read("README.md")
readme_vers = re.findall(r"v?(\d+\.\d+\.\d+)", readme)
# Just check latest version is mentioned
if truth_ver not in readme and truth_ver.split(".")[0:2] != ["2","5"]:
    add("WARN", "README.md", f"no mention of v{truth_ver}", truth_ver, "Check if latest version is documented")

add("INFO", "registry.json", f"version = {truth_ver}", truth_ver, "Source of truth")

# ============================================================
# 2. RULE COUNT
# ============================================================
rules_md = read("AGENT_RULES.md")
# Only count rules in AHG block
ahg_block = ""
if "AHG:START" in rules_md and "AHG:END" in rules_md:
    ahg_block = rules_md.split("AHG:START")[1].split("AHG:END")[0]
else:
    ahg_block = rules_md

rule_ids = re.findall(r"RULE-(\d+)", ahg_block)
rule_ids_unique = sorted(set(int(r) for r in rule_ids))
actual_rules = len(rule_ids_unique)
expected_rules = 17

# SKILL.md rule count
sk_content = read("skills/anti-hallucination-guard/SKILL.md")
sk_rules = re.findall(r"Rule (\d+)", sk_content)
sk_rules_unique = sorted(set(int(r) for r in sk_rules if 1 <= int(r) <= 20))
sk_rule_count = len(sk_rules_unique)

# README rule count
readme_rule_section = readme[readme.find("Rules"):] if "Rules" in readme else readme
readme_rules = re.findall(r"Rule (\d+)", readme)
readme_rules_unique = sorted(set(int(r) for r in readme_rules if 1 <= int(r) <= 20))

# setup.sh summary rule count
setup = read("setup.sh")
setup_rules = re.findall(r"Rule (\d+)", setup)
setup_rules_unique = sorted(set(int(r) for r in setup_rules if 1 <= int(r) <= 20))

if actual_rules != expected_rules:
    add("FAIL", "AGENT_RULES.md", f"{expected_rules} rules", actual_rules,
        f"Found RULE-IDs: {rule_ids_unique}")
if sk_rule_count != expected_rules:
    add("FAIL", "SKILL.md", f"{expected_rules} rules", sk_rule_count,
        f"Found Rule references: {sk_rules_unique}")
if len(readme_rules_unique) != expected_rules:
    add("WARN", "README.md", f"{expected_rules} rules", len(readme_rules_unique),
        f"Found Rule references: {readme_rules_unique}")

# ============================================================
# 3. FILE REFERENCES IN AGENT_RULES.md
# ============================================================
# Check that referenced scripts exist
script_refs = {
    "check-hooks-integrity.sh": "scripts/check-hooks-integrity.sh",
    "check-hooks-verify.sh": "scripts/check-hooks-verify.sh",
    "check-hooks-snapshot.sh": "scripts/check-hooks-snapshot.sh",
    "check-hooks-lib.sh": "scripts/check-hooks-lib.sh",
    "validate.sh": "scripts/validate.sh",
    "audit.sh": "scripts/audit.sh",
    "setup.sh": "setup.sh",
    "update.sh": "update.sh",
    "ahg.sh": "scripts/ahg.sh",
    "verify-docs": "tools/verify-docs/src/cli.ts",
}

dead_refs = []
for name, path in script_refs.items():
    if name in rules_md and not exists(path):
        dead_refs.append((name, path))

for name, path in dead_refs:
    add("FAIL", "AGENT_RULES.md", f"references {name}", "NOT FOUND",
        f"Path {path} does not exist")

# ============================================================
# 4. REGISTRY vs AGENT_RULES - rule IDs match
# ============================================================
reg_rule_ids = sorted([k for k in reg.get("items", {}) if k.startswith("RULE-")])
rules_in_md = sorted([f"RULE-{r:03d}" for r in rule_ids_unique])
missing_in_reg = set(rules_in_md) - set(reg_rule_ids)
missing_in_md = set(reg_rule_ids) - set(rules_in_md)

if missing_in_reg:
    add("FAIL", "registry.json", f"missing rules: {sorted(missing_in_reg)}", "N/A",
        "Rules in AGENT_RULES.md but not in registry.json")
if missing_in_md:
    add("FAIL", "AGENT_RULES.md", f"missing rules: {sorted(missing_in_md)}", "N/A",
        "Rules in registry.json but not in AGENT_RULES.md")

# ============================================================
# 5. CODEOWNERS
# ============================================================
codeowners = read(".github/CODEOWNERS")
if "Rule 17" not in codeowners and "Rule 16+17" not in codeowners:
    add("FAIL", ".github/CODEOWNERS", "should mention Rule 16+17", "not found",
        "CODEOWNERS should reference Rule 16+17 for upstream write protection")

# ============================================================
# 6. tests/ directory
# ============================================================
if not exists("tests") and '"test":' in read("package.json") if exists("package.json") else False:
    add("WARN", "N/A", "package.json has test script but no tests/", "N/A",
        "AHG has no tests/ directory")

# Actually AHG doesn't have package.json at root, check tools/verify-docs
if exists("tools/verify-docs/package.json"):
    vd_pkg = json.loads(read("tools/verify-docs/package.json"))
    if "test" in vd_pkg.get("scripts", {}) and not exists("tools/verify-docs/tests"):
        # Only warn if test script references tests/
        test_script = vd_pkg["scripts"]["test"]
        if "test" in test_script.lower():
            add("WARN", "tools/verify-docs/package.json", f"test script: {test_script}", "no tests/ dir",
                "Has test command but no tests directory")

# ============================================================
# 7. README Module Structure vs actual files
# ============================================================
# Extract script list from README module structure table
readme_scripts = re.findall(r"`scripts/([^`]+)`", readme)
readme_setup = re.findall(r"`setup/([^`]+)`", readme)
readme_tools = re.findall(r"`tools/([^`]+)`", readme)

actual_scripts = sorted([f.name for f in (AHG / "scripts").iterdir() if f.is_file()])
actual_setup = sorted([f.name for f in (AHG / "setup").iterdir() if f.is_file()]) if (AHG / "setup").exists() else []

missing_scripts = [s for s in actual_scripts if s not in readme_scripts and s not in ["co-change-check.sh", "line-count-check.sh", "check-hooks-lib.sh", "check-hooks-snapshot.sh", "check-hooks-verify.sh"]]
# Only flag if README is missing scripts that actually exist
for s in actual_scripts:
    if s not in readme_scripts:
        add("WARN", "README.md", f"script {s} not in Module Structure", "exists on disk",
            f"File scripts/{s} exists but not listed in README module structure table")

# ============================================================
# 8. CHANGELOG section consistency
# ============================================================
cl_sections = re.findall(r"## \[([\d.]+)\] - (\d{4}-\d{2}-\d{2})", cl)
# Check dates are descending
for i in range(len(cl_sections) - 1):
    ver1, date1 = cl_sections[i]
    ver2, date2 = cl_sections[i+1]
    if date1 < date2:
        add("WARN", "CHANGELOG.md", f"date order: {ver1} ({date1}) before {ver2} ({date2})", "should be descending",
            f"Section {ver1} has earlier date than {ver2}")

# Check v2.5.0 section content matches claims
v250 = cl[cl.find("## [2.5.0]"):cl.find("## [2.4.0]")] if "## [2.5.0]" in cl and "## [2.4.0]" in cl else ""
if v250:
    # Check that mentioned files were actually changed
    if "AGENT_RULES.md: fixed dead reference" in v250:
        if "check-hooks-integrity" not in rules_md:
            add("WARN", "CHANGELOG.md v2.5.0", "claims fixed check-hooks-integrity ref", "ref not found in AGENT_RULES.md",
                "CHANGELOG says fixed but old ref still present")
    if "removed ARCH-SUBMODULE and ARCH-UPSTREAM" in v250:
        if "ARCH-SUBMODULE" in rules_md or "ARCH-UPSTREAM" in rules_md:
            add("FAIL", "CHANGELOG.md v2.5.0", "claims removed ARCH-SUBMODULE/UPSTREAM", "still present",
                "AGENT_RULES.md still contains these references")

# ============================================================
# OUTPUT
# ============================================================
fails = [r for r in results if r[0] == "FAIL"]
warns = [r for r in results if r[0] == "WARN"]
infos = [r for r in results if r[0] == "INFO"]

print(f"{'='*80}")
print(f"AHG Cross-Consistency Audit (post v2.5.0 update)")
print(f"{'='*80}")
print(f"Total issues: {len(fails) + len(warns)}")
print(f"  FAIL: {len(fails)}")
print(f"  WARN: {len(warns)}")
print(f"  INFO: {len(infos)}")
print(f"{'='*80}")

if infos:
    print(f"\n--- INFO ---")
    for i, (sev, f, claim, actual, detail) in enumerate(infos, 1):
        print(f"\n  INFO-{i:02d} | {f}")
        print(f"  Claim: {claim} | Actual: {actual}")
        print(f"  Detail: {detail}")

if fails:
    print(f"\n--- FAIL ---")
    for i, (sev, f, claim, actual, detail) in enumerate(fails, 1):
        print(f"\n  FAIL-{i:02d} | {f}")
        print(f"  Claim: {claim}")
        print(f"  Actual: {actual}")
        print(f"  Detail: {detail}")

if warns:
    print(f"\n--- WARN ---")
    for i, (sev, f, claim, actual, detail) in enumerate(warns, 1):
        print(f"\n  WARN-{i:02d} | {f}")
        print(f"  Claim: {claim}")
        print(f"  Actual: {actual}")
        print(f"  Detail: {detail}")

print(f"\n{'='*80}")
print(f"SUMMARY: {len(fails)} FAIL + {len(warns)} WARN")
print(f"{'='*80}")