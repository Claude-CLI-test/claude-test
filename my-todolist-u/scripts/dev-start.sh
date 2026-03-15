#!/usr/bin/env bash

set -euo pipefail

show_port_conflict() {
  local port="$1"
  local service="$2"
  local result

  result=$(ss -ltnp "( sport = :$port )" 2>/dev/null || true)

  if printf '%s\n' "$result" | grep -q "LISTEN"; then
    printf '\n[%s] Port %s is already in use.\n' "$service" "$port"
    printf '%s\n' "$result"
    return 1
  fi

  return 0
}

has_conflict=0

show_port_conflict 3000 "backend" || has_conflict=1
show_port_conflict 5173 "frontend" || has_conflict=1

if [ "$has_conflict" -eq 1 ]; then
  cat <<'EOF'

An earlier dev server is probably still running.
Stop the old process and retry:
  - If you still have the old terminal, press Ctrl+C there.
  - Or inspect listeners: ss -ltnp '( sport = :3000 or sport = :5173 )'
  - Or stop by PID: kill <PID>
EOF
  exit 1
fi

exec concurrently -k -n BE,FE -c blue,green \
  "npm run dev --prefix backend" \
  "bash -lc 'until curl -sf http://localhost:3000/health >/dev/null; do sleep 1; done; npm run dev --prefix frontend'"
