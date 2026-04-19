#!/usr/bin/env bash
# Pre-commit hook: warn if editing files under someone else's active (🟡) task.
# Install: git config core.hooksPath .githooks

PLAN="PLAN.md"
[ ! -f "$PLAN" ] && exit 0

COMMITTER=$(git config user.name)
CHANGED_FILES=$(git diff --cached --name-only)

while IFS='|' read -r num component files owner status deps notes; do
    files=$(echo "$files" | xargs)
    owner=$(echo "$owner" | xargs)
    status=$(echo "$status" | xargs)

    [ "$status" != "🟡" ] && continue
    [ -z "$files" ] && continue

    clean_owner=$(echo "$owner" | sed 's/\*\*//g' | xargs)
    [ "$clean_owner" = "$COMMITTER" ] && continue

    for changed in $CHANGED_FILES; do
        file_pattern=$(echo "$files" | sed 's/`//g' | xargs)
        if echo "$changed" | grep -q "$file_pattern"; then
            echo ""
            echo "⚠️  WARNING: You are editing '$changed'"
            echo "   which belongs to $clean_owner's active task (🟡)"
            echo "   Check PLAN.md before proceeding."
            echo ""
        fi
    done
done < <(grep '|.*🟡.*|' "$PLAN" 2>/dev/null)

exit 0
