#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_KEYS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  DATABASE_URL
  GITHUB_APP_ID
  GITHUB_APP_PRIVATE_KEY
  WORKER_ID
  POLL_INTERVAL_MS
)

ensure_from_example() {
  local dest="$1"
  local example="$2"
  if [ ! -f "$dest" ]; then
    cp "$example" "$dest"
    echo "Created ${dest#"$ROOT"/} from $(basename "$example")"
  fi
}

set_key_in_file() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp
  tmp="$(mktemp)"
  awk -v key="$key" -v val="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" key "=" {
      print key "=" val
      found = 1
      next
    }
    { print }
    END {
      if (!found) print key "=" val
    }
  ' "$file" >"$tmp"
  mv "$tmp" "$file"
}

merge_shell_into() {
  local file="$1"
  for key in "${ENV_KEYS[@]}"; do
    local value="${!key:-}"
    [ -n "$value" ] || continue
    set_key_in_file "$file" "$key" "$value"
  done
}

ensure_from_example "$ROOT/.env" "$ROOT/.env.example"
ensure_from_example "$ROOT/apps/web/.env.local" "$ROOT/apps/web/.env.example"

merge_shell_into "$ROOT/.env"
merge_shell_into "$ROOT/apps/web/.env.local"

echo "Environment files ready at .env and apps/web/.env.local"
