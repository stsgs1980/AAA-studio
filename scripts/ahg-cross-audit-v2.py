#!/usr/bin/env python3
"""
AHG Cross-Consistency Audit v2
Checks cross-consistency within the anti-hallucination-guard submodule
after update from d27c3f4 to fa51233.

Previous audit found: 24 FAIL + 3 WARN
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

AHG_ROOT = "/home/z/my-project/anti-hallucination-guard"

results_fail = []
results_warn = []


def fail(check_id: str, msg: str):
    results_fail.append((check_id, msg))


def warn(check_id: str, msg: str):
    results_warn.append((check_id, msg))


def file_exists(rel_path: str) -> bool:
    return os.path.isfile(os.path.join(AHG_ROOT, rel_path))


def read_file(rel_path: str) -> str:
    full = os.path.join(AHG_ROOT, rel_path)
    if not os.path.isfile(full):
        return ""
    with open(full, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def list_files(rel_dir: str) -> list:
    full = os.path.join(AHG_ROOT, rel_dir)
    if not os.path.isdir(full):
        return []
    return [f for f in os.listdir(full) if os.path.isfile(os.path.join(full, f))]


def list_files_recursive(rel_dir: str, ext: Optional[str] = None) -> list:
    full = os.path.join(AHG_ROOT, rel_dir)
    if not os.path.isdir(full):
        return []
    result = []
    for root, dirs, files in os.walk(full):
        for f in files:
            if ext is None or f.endswith(ext):
                rel = os.path.relpath(os.path.join(root, f), AHG_ROOT)
                result.append(rel)
    return sorted(result)


def extract_version(text: str, pattern: str) -> Optional[str]:
    m = re.search(pattern, text)
    if m:
        return m.group(1)
    return None


def header(title: str):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


# ============================================================
# 1. RULE COUNT
# ============================================================
def check_rule_count():
    header("CHECK 1: Rule Count Consistency")
    rules_text = read_file("AGENT_RULES.md")

    rule_headers = re.findall(r'^## Rule \d+', rules_text, re.MULTILINE)
    actual_count = len(rule_headers)

    rule_ids = re.findall(r'ID: RULE-(\d+)', rules_text)
    id_count = len(rule_ids)

    readme_text = read_file("README.md")
    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")

    print(f"  Actual Rule ## headers in AGENT_RULES.md: {actual_count}")
    print(f"  Actual RULE-XXX ID comments in AGENT_RULES.md: {id_count}")

    if actual_count != 17:
        fail("RULE-COUNT-001",
             f"AGENT_RULES.md has {actual_count} Rule headers, expected 17")
    else:
        print("  [OK] Rule header count matches 17")

    if id_count != 17:
        fail("RULE-COUNT-002",
             f"AGENT_RULES.md has {id_count} RULE-XXX ID comments, expected 17")
    else:
        print("  [OK] Rule ID comment count matches 17")

    readme_table_rows = re.findall(r'\| Rule \d+.*?\|', readme_text)
    if len(readme_table_rows) != 17:
        fail("RULE-COUNT-003",
             f"README.md rule table has {len(readme_table_rows)} rows, expected 17")
    else:
        print("  [OK] README.md rule table has 17 rows")

    skill_table_rows = re.findall(r'\| \d+ \|', skill_text)
    if len(skill_table_rows) != 17:
        fail("RULE-COUNT-004",
             f"SKILL.md rule table has {len(skill_table_rows)} rows, expected 17")
    else:
        print("  [OK] SKILL.md rule table has 17 rows")

    for doc_name, doc_text in [("README.md", readme_text), ("SKILL.md", skill_text)]:
        v = extract_version(doc_text, r'v(\d+\.\d+\.\d+)')
        if v and v != "2.5.0":
            fail("RULE-COUNT-005", f"{doc_name} claims version {v}, expected 2.5.0")
        elif v:
            print(f"  [OK] {doc_name} version = {v}")


# ============================================================
# 2. FILE REFERENCES
# ============================================================
def check_file_references():
    header("CHECK 2: File Reference Validity")

    readme_text = read_file("README.md")
    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")
    rules_text = read_file("AGENT_RULES.md")

    # Strip code blocks to avoid matching example paths
    all_docs_stripped = re.sub(r'```[\s\S]*?```', '', readme_text + "\n" + skill_text)

    # Find inline backtick file references (single-line, path-like, with /)
    path_refs = re.findall(r'`([\w./-]+\.(?:sh|ts|js|json|md|yml|yaml))`', all_docs_stripped)

    known_module_scripts = [
        "scripts/ahg.sh", "scripts/check-agent.sh", "scripts/audit.sh",
        "scripts/validate.sh", "scripts/sync-task-state.sh",
        "scripts/check-hooks-snapshot.sh", "scripts/check-hooks-verify.sh",
        "scripts/check-hooks-lib.sh", "scripts/line-count-check.sh",
        "scripts/co-change-check.sh", "scripts/branch-protect.sh",
        "scripts/branch-protect-lib.sh", "scripts/setup-branch-protection.sh"
    ]

    skip_patterns = [
        "src/components", "src/app", "src/features", "src/lib",
        "src/parsers", "src/services", "packages/", "prisma/",
        "website/", "WORKFLOW.md", "ARCHITECTURE.md", "TASK-CASCADE.md",
        "index.html", "package-lock.json", "cascade-state.json",
        ".ahg-baseline.json"
    ]

    missing = set()
    for ref in path_refs:
        if any(x in ref for x in skip_patterns):
            continue
        if "/" not in ref:
            continue
        if ref.startswith("scripts/") and ref not in known_module_scripts:
            continue
        if not file_exists(ref):
            missing.add(ref)

    for m in sorted(missing):
        fail("FILE-REF-001", f"Referenced file does not exist: {m}")

    if not missing:
        print("  [OK] All referenced files in README.md and SKILL.md exist")

    # Check README "What setup.sh installs" table files
    table_section = re.search(
        r'## What setup\.sh installs(.*?)(?:## |\Z)', readme_text, re.DOTALL)
    if table_section:
        table_refs = re.findall(
            r'`([^`]+\.(?:sh|json|md))`', table_section.group(1))
        for ref in table_refs:
            if any(x in ref for x in skip_patterns):
                continue
            if "new-check" in ref:
                continue
            if ref.startswith("scripts/") or ref.startswith("setup/") or ref.startswith("tools/"):
                if not file_exists(ref):
                    fail("FILE-REF-002",
                         f"README table references non-existent file: {ref}")

    # Check AGENT_RULES.md script references
    rules_refs = re.findall(r'`([^`]*\.sh)`', rules_text)
    for ref in rules_refs:
        if ref.startswith("scripts/") and not file_exists(ref):
            fail("FILE-REF-003",
                 f"AGENT_RULES.md references non-existent script: {ref}")

    # Check verify-docs source files in README module structure tree
    tree_section = re.search(
        r'## Module structure(.*?)(?:## |\Z)', readme_text, re.DOTALL)
    ts_files = list_files_recursive("tools/verify-docs/src", ".ts")
    if tree_section:
        tree_text = tree_section.group(1)
        # The tree uses indented filenames like "        types.ts"
        # Match both full paths (tools/verify-docs/src/X.ts) and bare names
        tree_ts_set = set(re.findall(
            r'tools/verify-docs/src/([\w-]+\.ts)', tree_text))
        # Also match bare .ts filenames under the src/ section only
        # Extract the src/ subsection from the tree (between src/ and templates/)
        src_section = re.search(
            r'src/\s*(.*?)templates/', tree_text, re.DOTALL)
        if src_section:
            bare_ts = set(re.findall(
                r'([\w][\w-]*\.ts)\s', src_section.group(1)))
            tree_ts_set.update(bare_ts)

        for ts in sorted(tree_ts_set):
            ts_path = f"tools/verify-docs/src/{ts}"
            if not file_exists(ts_path):
                fail("FILE-REF-004",
                     f"README module structure lists {ts_path} but file does not exist")

        # Check for .ts files NOT in README tree
        for ts in sorted(ts_files):
            basename = os.path.basename(ts)
            if basename not in tree_ts_set:
                warn("FILE-REF-005",
                     f"tools/verify-docs/src/{basename} exists but not in README module structure tree")

    print(f"  Checked {len(set(path_refs))} inline path references")


# ============================================================
# 3. HOOK FILE COMPLETENESS
# ============================================================
def check_hook_completeness():
    header("CHECK 3: Hook File Completeness")

    readme_text = read_file("README.md")

    expected_git_hooks = ["pre-commit", "pre-push", "post-checkout"]
    for hook in expected_git_hooks:
        path = f".git-hooks/{hook}"
        if file_exists(path):
            print(f"  [OK] {path} exists")
        else:
            fail("HOOK-001", f"Hook template missing: {path}")

    # Check setup.sh sources all 9 steps
    setup_text = read_file("setup.sh")
    setup_steps = re.findall(r'source.*setup/(\d+-[\w-]+\.sh)', setup_text)
    print(f"  setup.sh sources {len(setup_steps)} setup steps: {setup_steps}")

    for step in setup_steps:
        step_path = f"setup/{step}"
        if not file_exists(step_path):
            fail("HOOK-002", f"setup.sh references missing step: {step_path}")

    # setup/03 installs pre-commit AND post-checkout
    setup03 = read_file("setup/03-install-pre-commit-hook.sh")
    for hook in ["pre-commit", "post-checkout"]:
        if hook not in setup03:
            fail("HOOK-003",
                 f"setup/03-install-pre-commit-hook.sh does not reference {hook}")

    setup04 = read_file("setup/04-install-pre-push-hook.sh")
    if "pre-push" not in setup04:
        fail("HOOK-004", "setup/04 does not reference pre-push")

    for hook in ["pre-commit", "pre-push", "post-checkout"]:
        if hook not in readme_text:
            fail("HOOK-005", f"README.md does not mention {hook} hook")

    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")
    for hook in ["pre-commit", "pre-push", "post-checkout"]:
        if hook not in skill_text:
            fail("HOOK-006", f"SKILL.md does not mention {hook} hook")

    setup09 = read_file("setup/09-git-staging.sh")
    if ".git/hooks/pre-push" not in setup09:
        fail("HOOK-007", "setup/09 does not stage pre-push hook")
    if ".git/hooks/pre-commit" not in setup09:
        fail("HOOK-008", "setup/09 does not stage pre-commit hook")


# ============================================================
# 4. VERSION CONSISTENCY
# ============================================================
def check_version_consistency():
    header("CHECK 4: Version Consistency")

    version_sources = {
        "README.md badge": (read_file("README.md"), r'Version\s+([\d.]+)'),
        "README.md footer": (read_file("README.md"),
                             r'v([\d.]+\.[\d.]+\.[\d.]+)\s*\|'),
        "AGENT_RULES.md footer": (read_file("AGENT_RULES.md"),
                                  r'v(\d+\.\d+\.\d+)'),
        "registry.json": (read_file("registry.json"),
                          r'"version"\s*:\s*"([\d.]+)"'),
        "package.json": (read_file("tools/verify-docs/package.json"),
                         r'"version"\s*:\s*"([\d.]+)"'),
        ".ahg-cochange.json": (read_file(".ahg-cochange.json"),
                               r'"version"\s*:\s*"([\d.]+)"'),
        "CHANGELOG latest": (read_file("CHANGELOG.md"),
                             r'## \[([\d.]+)\]'),
        "SKILL.md header": (read_file("skills/anti-hallucination-guard/SKILL.md"),
                            r'v(\d+\.\d+)'),
        "ahg.sh help": (read_file("scripts/ahg.sh"),
                        r'v([\d.]+)'),
    }

    versions = {}
    for name, (text, pattern) in version_sources.items():
        v = extract_version(text, pattern)
        if v:
            versions[name] = v
            print(f"  {name}: {v}")
        else:
            fail("VER-001", f"Could not extract version from {name}")
            print(f"  {name}: NOT FOUND")

    expected = "2.5.0"
    acceptable_minor = {"SKILL.md header", "ahg.sh help"}
    for name, v in versions.items():
        if v != expected and name not in acceptable_minor:
            fail("VER-002", f"{name} has version {v}, expected {expected}")

    # Check verify-docs.json versionSync targets
    vd_config = read_file("verify-docs.json")
    try:
        vd = json.loads(vd_config)
        vs = vd.get("versionSync", {})
        source_file = vs.get("source", "").replace("file:", "")
        if source_file and not file_exists(source_file):
            fail("VER-003",
                 f"verify-docs.json versionSync source missing: {source_file}")

        for target in vs.get("targets", []):
            target_file = target.get("file", "")
            if target_file and not file_exists(target_file):
                fail("VER-004",
                     f"verify-docs.json versionSync target missing: {target_file}")
            else:
                print(f"  [OK] versionSync target exists: {target_file}")
    except json.JSONDecodeError as e:
        fail("VER-005", f"verify-docs.json is not valid JSON: {e}")


# ============================================================
# 5. RULE IDs
# ============================================================
def check_rule_ids():
    header("CHECK 5: Rule ID Cross-References")

    rules_text = read_file("AGENT_RULES.md")
    registry_text = read_file("registry.json")
    readme_text = read_file("README.md")
    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")

    rule_ids_in_rules = set(re.findall(r'ID: (RULE-\d+)', rules_text))

    try:
        registry = json.loads(registry_text)
        rule_ids_in_registry = {
            k for k in registry.get("items", {}).keys() if k.startswith("RULE-")}
        all_registry_ids = set(registry.get("items", {}).keys())
    except json.JSONDecodeError:
        rule_ids_in_registry = set()
        all_registry_ids = set()
        fail("ID-001", "registry.json is not valid JSON")

    for rid in sorted(rule_ids_in_rules):
        if rid not in rule_ids_in_registry:
            fail("ID-002",
                 f"{rid} in AGENT_RULES.md but NOT in registry.json")

    for rid in sorted(rule_ids_in_registry):
        if rid not in rule_ids_in_rules:
            fail("ID-003",
                 f"{rid} in registry.json but NOT in AGENT_RULES.md")

    docs_text = readme_text + "\n" + skill_text
    doc_refs = set(re.findall(r'RULE-\d+', docs_text))
    for ref in doc_refs:
        if ref not in rule_ids_in_rules:
            fail("ID-004",
                 f"{ref} referenced in docs but NOT in AGENT_RULES.md")

    # Check Related: field consistency
    for rid, entry in registry.get("items", {}).items():
        for rel in entry.get("related", []):
            if rel not in all_registry_ids:
                fail("ID-005",
                     f"{rid} references {rel} in Related but {rel} not in registry")

    # Check version in HTML comments matches registry version
    for rid in ["RULE-012", "RULE-013", "RULE-014"]:
        if rid in rule_ids_in_registry:
            reg_ver = registry["items"][rid].get("version", "?")
            pattern = rf'ID: {rid}\s*\|\s*ver:(\S+)'
            m = re.search(pattern, rules_text)
            comment_ver = m.group(1) if m else "?"
            if comment_ver != reg_ver:
                fail("ID-006",
                     f"{rid} HTML comment ver:{comment_ver} != registry ver:{reg_ver}")
            else:
                print(f"  [OK] {rid} comment ver:{comment_ver} == registry ver:{reg_ver}")

    print(f"  RULE IDs in AGENT_RULES.md: {len(rule_ids_in_rules)}")
    print(f"  RULE IDs in registry.json: {len(rule_ids_in_registry)}")
    print(f"  RULE IDs referenced in docs: {len(doc_refs)}")

    # Check all registered IDs have valid files
    for rid, entry in registry.get("items", {}).items():
        f_path = entry.get("file", "")
        if f_path and not file_exists(f_path):
            fail("ID-007",
                 f"registry.json {rid} points to non-existent file: {f_path}")


# ============================================================
# 6. NEW FILES FROM UPDATE
# ============================================================
def check_new_files():
    header("CHECK 6: New Files from Update (d27c3f4 -> fa51233)")

    readme_text = read_file("README.md")
    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")
    changelog_text = read_file("CHANGELOG.md")
    setup05 = read_file("setup/05-deploy-monitoring-scripts.sh")
    setup09 = read_file("setup/09-git-staging.sh")
    validate_text = read_file("scripts/validate.sh")
    gitignore_text = read_file(".gitignore")

    # 6a. .ahgrc
    print("\n  --- .ahgrc ---")
    if file_exists(".ahgrc"):
        print("  [OK] .ahgrc exists")
        if ".ahgrc" not in readme_text:
            fail("NEW-001", ".ahgrc exists but not mentioned in README.md")
        else:
            print("  [OK] .ahgrc referenced in README.md")
        if ".ahgrc" not in skill_text:
            fail("NEW-002", ".ahgrc exists but not mentioned in SKILL.md")
        else:
            print("  [OK] .ahgrc referenced in SKILL.md")
        if ".ahgrc" not in gitignore_text:
            fail("NEW-003", ".ahgrc not whitelisted in .gitignore")
        else:
            print("  [OK] .ahgrc whitelisted in .gitignore")
        if ".ahgrc" not in validate_text:
            fail("NEW-004", ".ahgrc not in validate.sh ALLOWED")
        else:
            print("  [OK] .ahgrc in validate.sh ALLOWED")
        if ".ahgrc" not in setup05:
            fail("NEW-005", "setup/05 does not deploy .ahgrc")
        else:
            print("  [OK] .ahgrc deployed by setup/05")
    else:
        fail("NEW-006", ".ahgrc does not exist")

    # 6b. post-checkout hook
    print("\n  --- post-checkout hook ---")
    if file_exists(".git-hooks/post-checkout"):
        print("  [OK] .git-hooks/post-checkout exists")
        if "post-checkout" not in readme_text:
            fail("NEW-007", "post-checkout not mentioned in README.md")
        else:
            print("  [OK] post-checkout referenced in README.md")
        if "post-checkout" not in changelog_text:
            fail("NEW-008", "post-checkout not mentioned in CHANGELOG.md")
        else:
            print("  [OK] post-checkout mentioned in CHANGELOG.md")

        setup03 = read_file("setup/03-install-pre-commit-hook.sh")
        if "post-checkout" in setup03:
            print("  [OK] post-checkout installed by setup/03")
        else:
            fail("NEW-009", "post-checkout not installed by any setup step")

        if ".git-hooks/post-checkout" not in validate_text:
            fail("NEW-010", ".git-hooks/post-checkout not in validate.sh ALLOWED")
        else:
            print("  [OK] .git-hooks/post-checkout in validate.sh ALLOWED")
    else:
        fail("NEW-011", ".git-hooks/post-checkout does not exist")

    # 6c. CONSUMER_GUIDE.md
    print("\n  --- CONSUMER_GUIDE.md ---")
    if file_exists("tools/verify-docs/CONSUMER_GUIDE.md"):
        print("  [OK] tools/verify-docs/CONSUMER_GUIDE.md exists")
        if "CONSUMER_GUIDE" not in readme_text:
            fail("NEW-012", "CONSUMER_GUIDE.md not mentioned in README.md")
        else:
            print("  [OK] CONSUMER_GUIDE.md referenced in README.md")
        if "CONSUMER_GUIDE" not in skill_text:
            fail("NEW-013", "CONSUMER_GUIDE.md not mentioned in SKILL.md")
        else:
            print("  [OK] CONSUMER_GUIDE.md referenced in SKILL.md")
        if "CONSUMER_GUIDE.md" not in validate_text:
            fail("NEW-014", "CONSUMER_GUIDE.md not in validate.sh ALLOWED")
        else:
            print("  [OK] CONSUMER_GUIDE.md in validate.sh ALLOWED")
    else:
        fail("NEW-015", "tools/verify-docs/CONSUMER_GUIDE.md does not exist")

    # 6d. .ahg-setup-stamp
    print("\n  --- .ahg-setup-stamp ---")
    if ".ahg-setup-stamp" in setup09:
        print("  [OK] setup/09 writes .ahg-setup-stamp")
        if ".ahg-setup-stamp" not in skill_text:
            warn("NEW-016", ".ahg-setup-stamp created by setup but not mentioned in SKILL.md")
        if ".ahg-setup-stamp" not in readme_text:
            warn("NEW-017", ".ahg-setup-stamp created by setup but not mentioned in README.md")
    else:
        fail("NEW-018", "setup/09 does not write .ahg-setup-stamp")


# ============================================================
# 7. CONFIG FILE REFERENCES (.ahgrc schema vs setup.sh)
# ============================================================
def check_ahgrc_config():
    header("CHECK 7: .ahgrc Config vs Setup/Scripts")

    ahgrc_text = read_file(".ahgrc")
    line_count_text = read_file("scripts/line-count-check.sh")

    try:
        ahgrc = json.loads(ahgrc_text)
        print(f"  .ahgrc keys: {list(ahgrc.keys())}")
    except json.JSONDecodeError as e:
        fail("AHGRCCFG-001", f".ahgrc is not valid JSON: {e}")
        return

    expected_keys = [
        "line_check_dir", "line_check_limit", "line_check_hard_cap",
        "line_check_glob", "line_check_skip"
    ]
    for key in expected_keys:
        if key not in ahgrc:
            fail("AHGRCCFG-002", f".ahgrc missing expected key: {key}")
        else:
            print(f"  [OK] .ahgrc has key: {key}")

    if ahgrc.get("line_check_limit") != 250:
        fail("AHGRCCFG-003",
             f".ahgrc line_check_limit is {ahgrc.get('line_check_limit')}, expected 250")
    else:
        print("  [OK] .ahgrc line_check_limit = 250")

    if ahgrc.get("line_check_hard_cap") != 400:
        fail("AHGRCCFG-004",
             f".ahgrc line_check_hard_cap is {ahgrc.get('line_check_hard_cap')}, expected 400")
    else:
        print("  [OK] .ahgrc line_check_hard_cap = 400")

    if ".ahgrc" not in line_count_text:
        fail("AHGRCCFG-005", "line-count-check.sh does not reference .ahgrc")
    else:
        print("  [OK] line-count-check.sh references .ahgrc")

    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")
    skill_ahgrc_match = re.search(r'```json\s*\n(\{[^}]+\})\s*\n```', skill_text)
    if skill_ahgrc_match:
        try:
            skill_ahgrc = json.loads(skill_ahgrc_match.group(1))
            skill_keys = set(skill_ahgrc.keys())
            actual_keys = set(ahgrc.keys())
            if not skill_keys.issubset(actual_keys):
                missing = skill_keys - actual_keys
                fail("AHGRCCFG-006",
                     f"SKILL.md .ahgrc example has keys not in actual: {missing}")
            else:
                print("  [OK] SKILL.md .ahgrc example keys are subset of actual .ahgrc")
        except json.JSONDecodeError:
            pass

    setup05 = read_file("setup/05-deploy-monitoring-scripts.sh")
    if ".ahgrc" not in setup05:
        fail("AHGRCCFG-008", "setup/05 does not deploy .ahgrc")
    else:
        print("  [OK] setup/05 deploys .ahgrc")

    changelog_text = read_file("CHANGELOG.md")
    if ".ahgrc" not in changelog_text:
        fail("AHGRCCFG-009", "CHANGELOG.md does not mention .ahgrc")
    else:
        print("  [OK] CHANGELOG.md mentions .ahgrc")


# ============================================================
# 8. CROSS-FILE CONSISTENCY
# ============================================================
def check_cross_file_consistency():
    header("CHECK 8: Cross-File Consistency")

    readme_text = read_file("README.md")
    skill_text = read_file("skills/anti-hallucination-guard/SKILL.md")
    changelog_text = read_file("CHANGELOG.md")
    rules_text = read_file("AGENT_RULES.md")

    # 8a. Rule count claims
    print("\n  --- Rule Count Claims ---")
    for doc_name, doc_text in [
        ("README.md", readme_text), ("SKILL.md", skill_text),
    ]:
        matches = re.findall(r'(\d+)\s+rules?', doc_text, re.IGNORECASE)
        for m in matches:
            if int(m) != 17:
                fail("CROSS-001",
                     f"{doc_name} claims '{m} rules', expected 17")
            else:
                print(f"  [OK] {doc_name}: {m} rules")

    # 8b. Verify-docs section count
    print("\n  --- Verify-docs Section Count ---")
    for doc_name, doc_text in [("README.md", readme_text), ("SKILL.md", skill_text)]:
        has_5 = bool(re.search(r'5[\s-]section', doc_text, re.IGNORECASE) or
                      re.search(r'five section', doc_text, re.IGNORECASE))
        if has_5:
            print(f"  [OK] {doc_name}: mentions 5 sections")
        else:
            warn("CROSS-002", f"{doc_name} does not mention 5 verify-docs sections")

    # 8c. Pre-commit hook phase count
    print("\n  --- Pre-commit Phase Count ---")
    precommit_hook = read_file(".git-hooks/pre-commit")
    phases = re.findall(r'Phase\s+[\d.]+', precommit_hook)
    print(f"  Pre-commit hook has phases: {phases}")
    expected_phases = ["Phase 1", "Phase 2", "Phase 2.5", "Phase 3",
                       "Phase 3.5", "Phase 4", "Phase 5"]
    for phase in expected_phases:
        if phase not in precommit_hook:
            fail("CROSS-003",
                 f"Pre-commit hook missing {phase}")

    # 8d. Script count
    print("\n  --- Script Count ---")
    scripts_dir = list_files("scripts")
    actual_sh_count = len([f for f in scripts_dir if f.endswith(".sh")])
    print(f"  Actual .sh files in scripts/: {actual_sh_count}")

    # Scripts in README "What setup.sh installs" table
    if table_section := re.search(
            r'## What setup\.sh installs(.*?)(?:## |\Z)', readme_text, re.DOTALL):
        readme_script_refs = set(re.findall(r'`scripts/([\w-]+\.sh)`',
                                            table_section.group(1)))
        for s in sorted(readme_script_refs):
            if s != "new-check.sh" and not file_exists(f"scripts/{s}"):
                fail("CROSS-004",
                     f"README references scripts/{s} but file does not exist")

        # Check for scripts NOT in README table
        known_deployed = {
            "ahg.sh", "check-agent.sh", "audit.sh", "validate.sh",
            "sync-task-state.sh", "check-hooks-snapshot.sh",
            "check-hooks-verify.sh", "check-hooks-lib.sh",
            "line-count-check.sh", "co-change-check.sh",
            "branch-protect.sh", "branch-protect-lib.sh",
            "setup-branch-protection.sh"
        }
        for s in sorted(scripts_dir):
            if s.endswith(".sh") and s not in readme_script_refs and s in known_deployed:
                warn("CROSS-005",
                     f"scripts/{s} exists but not in README 'What setup.sh installs' table")

    # 8e. Setup steps count
    print("\n  --- Setup Steps ---")
    setup_dir = list_files("setup")
    setup_sh_count = len([f for f in setup_dir
                          if f.endswith(".sh") and f != "_lib.sh"])
    if setup_sh_count != 9:
        fail("CROSS-006",
             f"setup/ has {setup_sh_count} steps (excluding _lib.sh), expected 9")
    else:
        print(f"  [OK] setup/ has {setup_sh_count} step scripts (01-09)")

    # 8f. Registry item count
    print("\n  --- Registry.json Items ---")
    try:
        registry = json.loads(read_file("registry.json"))
        items = registry.get("items", {})
        rule_count = len([k for k in items if k.startswith("RULE-")])
        std_count = len([k for k in items if k.startswith("STD-")])
        tool_count = len([k for k in items if k.startswith("TOOL-")])
        proc_count = len([k for k in items if k.startswith("PROC-")])
        total = len(items)
        print(f"  RULE-*: {rule_count}, STD-*: {std_count}, "
              f"TOOL-*: {tool_count}, PROC-*: {proc_count}")
        print(f"  Total items: {total}")
        if rule_count != 17:
            fail("CROSS-007",
                 f"registry.json has {rule_count} RULE-* items, expected 17")
    except json.JSONDecodeError:
        fail("CROSS-008", "registry.json is not valid JSON")

    # 8g. Rule level distribution
    print("\n  --- Rule Level Distribution ---")
    try:
        registry = json.loads(read_file("registry.json"))
        items = registry.get("items", {})
        rule_levels = {}
        for k, v in items.items():
            if k.startswith("RULE-"):
                rule_levels[k] = v.get("level", "?")

        critical_rules = [k for k, v in rule_levels.items() if v == "critical"]
        warning_rules = [k for k, v in rule_levels.items() if v == "warning"]

        print(f"  Critical rules: {len(critical_rules)}")
        print(f"  Warning rules: {len(warning_rules)} "
              f"({', '.join(warning_rules)})")

        readme_c = len(re.findall(
            r'\|\s*Rule\s+\d+\s*\|\s*\[C\]', readme_text))
        readme_w = len(re.findall(
            r'\|\s*Rule\s+\d+\s*\|\s*\[W\]', readme_text))

        if readme_c != len(critical_rules):
            fail("CROSS-009",
                 f"README shows {readme_c} [C] rules, "
                 f"registry has {len(critical_rules)} critical")
        else:
            print(f"  [OK] README [C] count ({readme_c}) matches registry")

        if readme_w != len(warning_rules):
            fail("CROSS-010",
                 f"README shows {readme_w} [W] rules, "
                 f"registry has {len(warning_rules)} warning")
        else:
            print(f"  [OK] README [W] count ({readme_w}) matches registry")

        if len(critical_rules) + len(warning_rules) != 17:
            fail("CROSS-011",
                 f"Registry has {len(critical_rules) + len(warning_rules)} "
                 f"rules with levels, expected 17")
        else:
            print(f"  [OK] Total rules with levels: 17")
    except Exception as e:
        fail("CROSS-012", f"Error checking rule levels: {e}")

    # 8h. CHANGELOG v2.5.0 completeness
    print("\n  --- CHANGELOG v2.5.0 Completeness ---")
    v25_section = re.search(
        r'## \[2\.5\.0\].*?(?=## \[|\Z)', changelog_text, re.DOTALL)
    if v25_section:
        v25_text = v25_section.group(0)
        for keyword in [".ahgrc", "post-checkout", "CONSUMER_GUIDE",
                        "setup-stamp"]:
            if keyword in v25_text:
                print(f"  [OK] CHANGELOG v2.5.0 mentions {keyword}")
            else:
                fail("CROSS-013",
                     f"CHANGELOG v2.5.0 does not mention {keyword}")
    else:
        fail("CROSS-014", "CHANGELOG does not have v2.5.0 section")

    # 8i. ID system prefix table
    print("\n  --- ID System Prefix Table ---")
    for prefix in ["RULE", "STD", "TOOL", "PROC"]:
        if prefix in readme_text:
            print(f"  [OK] README mentions {prefix}-* prefix")
        else:
            fail("CROSS-015",
                 f"README does not mention {prefix}-* prefix")

    # 8j. Co-change config
    print("\n  --- Co-change Config ---")
    try:
        cochange = json.loads(read_file(".ahg-cochange.json"))
        pairs = cochange.get("pairs", [])
        print(f"  .ahg-cochange.json has {len(pairs)} co-change pairs")
        for i, pair in enumerate(pairs):
            trigger = pair.get("trigger", "")
            expects = pair.get("expect", [])
            if not trigger:
                fail("CROSS-016", f"Co-change pair {i} has no trigger")
            if not expects:
                fail("CROSS-017", f"Co-change pair {i} has no expect list")
    except json.JSONDecodeError:
        fail("CROSS-018", ".ahg-cochange.json is not valid JSON")

    # 8k. SKILL.md version
    print("\n  --- SKILL.md Consistency ---")
    skill_ver = extract_version(
        skill_text, r'Anti-Hallucination Guard v(\d+\.\d+)')
    if skill_ver and skill_ver != "2.5":
        fail("CROSS-019", f"SKILL.md header says v{skill_ver}, expected v2.5")
    else:
        print(f"  [OK] SKILL.md version: v{skill_ver}")

    # SKILL.md rule table covers 1-17
    skill_rule_nums = set()
    for m in re.finditer(r'\|\s*(\d+)\s*\|\s*\[?(C|W)\]?', skill_text):
        n = int(m.group(1))
        if 1 <= n <= 17:
            skill_rule_nums.add(n)
    expected_nums = set(range(1, 18))
    if skill_rule_nums != expected_nums:
        missing_from_skill = expected_nums - skill_rule_nums
        fail("CROSS-020",
             f"SKILL.md rule table missing rules: {sorted(missing_from_skill)}")
    else:
        print(f"  [OK] SKILL.md rule table covers rules 1-17")

    # 8l. verify-docs.json config validation
    print("\n  --- verify-docs.json Config ---")
    try:
        vd = json.loads(read_file("verify-docs.json"))
        for dc in vd.get("docCoverage", []):
            src_dir = dc.get("sourceDir", "")
            doc_file = dc.get("docFile", "")
            if src_dir and not os.path.isdir(os.path.join(AHG_ROOT, src_dir)):
                fail("CROSS-021",
                     f"verify-docs.json docCoverage sourceDir missing: {src_dir}")
            if doc_file and not file_exists(doc_file):
                fail("CROSS-022",
                     f"verify-docs.json docCoverage docFile missing: {doc_file}")
        print(f"  [OK] verify-docs.json docCoverage entries validated")
    except Exception as e:
        fail("CROSS-023", f"Error validating verify-docs.json: {e}")

    # 8m. validate.sh whitelist covers all actual TS files
    print("\n  --- validate.sh Whitelist vs Actual Files ---")
    validate_lines = read_file("scripts/validate.sh")
    ts_files = list_files_recursive("tools/verify-docs/src", ".ts")
    missing_from_whitelist = []
    for ts_file in ts_files:
        basename = os.path.basename(ts_file)
        if basename not in validate_lines:
            missing_from_whitelist.append(ts_file)
    if missing_from_whitelist:
        for mf in missing_from_whitelist:
            fail("CROSS-024", f"validate.sh ALLOWED missing: {mf}")
    else:
        print(f"  [OK] validate.sh ALLOWED covers all {len(ts_files)} .ts files")


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 70)
    print("  AHG CROSS-CONSISTENCY AUDIT v2")
    print("  Submodule: /home/z/my-project/anti-hallucination-guard/")
    print("  Previous audit: 24 FAIL + 3 WARN")
    print("=" * 70)

    check_rule_count()
    check_file_references()
    check_hook_completeness()
    check_version_consistency()
    check_rule_ids()
    check_new_files()
    check_ahgrc_config()
    check_cross_file_consistency()

    print("\n")
    print("=" * 70)
    print("  AUDIT SUMMARY")
    print("=" * 70)
    print(f"\n  FAIL: {len(results_fail)}")
    for check_id, msg in results_fail:
        print(f"    [FAIL] {check_id}: {msg}")

    print(f"\n  WARN: {len(results_warn)}")
    for check_id, msg in results_warn:
        print(f"    [WARN] {check_id}: {msg}")

    print(f"\n  DIFFERENCE FROM PREVIOUS AUDIT (was 24 FAIL + 3 WARN):")
    prev_fail = 24
    prev_warn = 3
    delta_fail = len(results_fail) - prev_fail
    delta_warn = len(results_warn) - prev_warn

    if delta_fail < 0:
        print(f"    FAIL: {len(results_fail)} (was {prev_fail}, "
              f"FIXED {-delta_fail})")
    elif delta_fail == 0:
        print(f"    FAIL: {len(results_fail)} (was {prev_fail}, UNCHANGED)")
    else:
        print(f"    FAIL: {len(results_fail)} (was {prev_fail}, "
              f"NEW +{delta_fail})")

    if delta_warn < 0:
        print(f"    WARN: {len(results_warn)} (was {prev_warn}, "
              f"FIXED {-delta_warn})")
    elif delta_warn == 0:
        print(f"    WARN: {len(results_warn)} (was {prev_warn}, UNCHANGED)")
    else:
        print(f"    WARN: {len(results_warn)} (was {prev_warn}, "
              f"NEW +{delta_warn})")

    print(f"\n  OVERALL: {'PASS' if len(results_fail) == 0 else 'FAIL'}")
    print("=" * 70)

    return 0 if len(results_fail) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())