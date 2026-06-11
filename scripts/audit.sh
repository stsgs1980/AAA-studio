#!/bin/bash
# anti-hallucination-guard / audit.sh
# Post-session agent audit.
# Run: bash scripts/audit.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKLOG="$PROJECT_ROOT/worklog.md"
REPORT="$PROJECT_ROOT/download/audit-report.txt"
SCORE=0
MAX_SCORE=100

mkdir -p "$(dirname "$REPORT")"

# Cross-platform stat: Linux uses -c, macOS uses -f
get_mtime() {
    stat -c %Y "$1" 2>/dev/null || stat -f %m "$1" 2>/dev/null
}

echo "=== SESSION AUDIT ===" > "$REPORT"
echo "Time: $(date)" >> "$REPORT"
echo "Project: $PROJECT_ROOT" >> "$REPORT"
echo "" >> "$REPORT"

# 1. Worklog exists?
if [ -f "$WORKLOG" ]; then
    BLOCKS=$(grep -c '^---$' "$WORKLOG" 2>/dev/null)
    echo "[+] worklog.md: OK (${BLOCKS} blocks)" >> "$REPORT"
    SCORE=$((SCORE + 20))
else
    echo "[-] worklog.md: NOT FOUND -- agent did not maintain documentation" >> "$REPORT"
fi

# 2. Commit count
COMMITS=$(git -C "$PROJECT_ROOT" rev-list --count HEAD 2>/dev/null || echo 0)
echo "[+] Commits: $COMMITS" >> "$REPORT"
if [ "$COMMITS" -gt 3 ]; then
    SCORE=$((SCORE + 15))
fi

# 3. Changed files
CHANGED=$(git -C "$PROJECT_ROOT" diff --name-only HEAD~3 2>/dev/null)
echo "[+] Changed files (last 3 commits):" >> "$REPORT"
echo "$CHANGED" | head -20 >> "$REPORT"
if [ -n "$CHANGED" ]; then
    SCORE=$((SCORE + 15))
fi

# 4. Duplicate commit messages (sign of loops)
DUPS=$(git -C "$PROJECT_ROOT" log --oneline | sort | uniq -d | head -5)
if [ -n "$DUPS" ]; then
    echo "[!] Duplicate commits (possible loop):" >> "$REPORT"
    echo "$DUPS" >> "$REPORT"
else
    echo "[+] No loops detected" >> "$REPORT"
    SCORE=$((SCORE + 15))
fi

# 5. Worklog size
if [ -f "$WORKLOG" ]; then
    SIZE=$(wc -c < "$WORKLOG")
    LINES=$(wc -l < "$WORKLOG")
    echo "[+] Worklog size: ${SIZE} bytes, ${LINES} lines" >> "$REPORT"
    if [ "$LINES" -gt 20 ]; then
        SCORE=$((SCORE + 15))
    fi
fi

# 6. Last activity
if [ -f "$WORKLOG" ]; then
    LAST=$(get_mtime "$WORKLOG")
    NOW=$(date +%s)
    MIN_AGO=$(( (NOW - LAST) / 60 ))
    echo "[+] Last worklog update: ${MIN_AGO} min ago" >> "$REPORT"
fi

# 7. AGENT_RULES.md exists?
if [ -f "$PROJECT_ROOT/AGENT_RULES.md" ]; then
    echo "[+] AGENT_RULES.md: OK" >> "$REPORT"
    SCORE=$((SCORE + 10))
else
    echo "[-] AGENT_RULES.md: MISSING" >> "$REPORT"
fi

# Result
echo "" >> "$REPORT"
echo "==============================" >> "$REPORT"
echo "SCORE: ${SCORE}/${MAX_SCORE}" >> "$REPORT"
if [ "$SCORE" -ge 70 ]; then
    echo "VERDICT: Acceptable" >> "$REPORT"
elif [ "$SCORE" -ge 40 ]; then
    echo "VERDICT: Needs improvement" >> "$REPORT"
else
    echo "VERDICT: Agent was faking activity" >> "$REPORT"
fi

cat "$REPORT"
