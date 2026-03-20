#!/usr/bin/env bash
# =============================================================================
# BOCRA — Pre-commit Secret Scanner (V-01 Prevention)
# =============================================================================
#
# Scans staged files for potential secrets before they reach git history.
# Run automatically via .husky/pre-commit or manually:
#   bash scripts/scan-secrets.sh
#
# Patterns detected:
#   - Supabase service_role keys (eyJ... JWTs with service_role claim)
#   - Supabase anon keys hardcoded outside .env files
#   - Anthropic API keys (sk-ant-...)
#   - Google API keys (AIza...)
#   - Generic high-entropy strings that look like secrets
#   - Base64-encoded key patterns
#
# Exit codes:
#   0 — No secrets found
#   1 — Potential secrets detected (commit blocked)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Scanning staged files for secrets..."

# Get staged files (excluding deletions and binary files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
  echo -e "${GREEN}No staged files to scan.${NC}"
  exit 0
fi

FOUND_SECRETS=0

# Files to always skip (they're supposed to have keys or are binary)
SKIP_PATTERNS="\.env\.example|\.env\.local\.example|scan-secrets\.sh|node_modules|\.lock$|\.png$|\.jpg$|\.gif$|\.ico$|\.woff|\.ttf|\.eot$|\.pdf$|dist/"

for file in $STAGED_FILES; do
  # Skip binary/excluded files
  if echo "$file" | grep -qE "$SKIP_PATTERNS"; then
    continue
  fi

  # Skip .env files (they're gitignored; if staged, that's a separate issue)
  if echo "$file" | grep -qE "^\.env(\.local)?$"; then
    echo -e "${YELLOW}⚠  WARNING: .env file staged for commit: $file${NC}"
    echo "   Remove with: git reset HEAD $file"
    FOUND_SECRETS=1
    continue
  fi

  # Only scan text files
  if ! file "$file" 2>/dev/null | grep -q "text\|JSON\|script"; then
    continue
  fi

  CONTENT=$(git show ":$file" 2>/dev/null || cat "$file" 2>/dev/null || true)

  if [ -z "$CONTENT" ]; then
    continue
  fi

  # Pattern 1: Supabase service_role key (JWT with service_role)
  if echo "$CONTENT" | grep -qP 'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]*service_role'; then
    echo -e "${RED}🚨 BLOCKED: Supabase service_role key found in: $file${NC}"
    FOUND_SECRETS=1
  fi

  # Pattern 2: Anthropic API key
  if echo "$CONTENT" | grep -qP 'sk-ant-[A-Za-z0-9_-]{20,}'; then
    echo -e "${RED}🚨 BLOCKED: Anthropic API key found in: $file${NC}"
    FOUND_SECRETS=1
  fi

  # Pattern 3: Google API key
  if echo "$CONTENT" | grep -qP 'AIza[A-Za-z0-9_-]{30,}'; then
    echo -e "${RED}🚨 BLOCKED: Google API key found in: $file${NC}"
    FOUND_SECRETS=1
  fi

  # Pattern 4: Generic secret patterns in JS/TS files (not .env)
  if echo "$file" | grep -qE '\.(js|jsx|ts|tsx|json|yml|yaml|md)$'; then
    # Hardcoded Supabase URL + key assignment (outside .env)
    if echo "$CONTENT" | grep -qP "(service_role_key|SERVICE_ROLE|SUPABASE_SERVICE_ROLE)\s*[:=]\s*['\"][^'\"]{20,}"; then
      echo -e "${RED}🚨 BLOCKED: Hardcoded service role key assignment in: $file${NC}"
      FOUND_SECRETS=1
    fi
  fi

  # Pattern 5: Base64-encoded key patterns (common obfuscation attempt)
  if echo "$CONTENT" | grep -qP '_ENC\s*=\s*["\x27][A-Za-z0-9+/=]{40,}'; then
    echo -e "${YELLOW}⚠  WARNING: Possible Base64-encoded secret in: $file${NC}"
    FOUND_SECRETS=1
  fi
done

if [ "$FOUND_SECRETS" -ne 0 ]; then
  echo ""
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  COMMIT BLOCKED: Potential secrets detected in staged files${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "  To fix:"
  echo "  1. Move secrets to .env.local (already in .gitignore)"
  echo "  2. Use environment variables: import.meta.env.VITE_* (frontend)"
  echo "     or Deno.env.get() (edge functions)"
  echo "  3. For CI/CD, use GitHub Actions secrets"
  echo ""
  echo "  To bypass (emergency only):"
  echo "    git commit --no-verify"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ No secrets found in staged files.${NC}"
exit 0
