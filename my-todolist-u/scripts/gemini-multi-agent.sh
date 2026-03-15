#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd -- "$SCRIPT_DIR/.." && pwd)
PROMPT_DIR="$REPO_ROOT/agents/prompts"
RUNTIME_ROOT="$REPO_ROOT/.gemini-agents"
RUNS_DIR="$RUNTIME_ROOT/runs"
WORKSPACES_DIR="$RUNTIME_ROOT/workspaces"

GEMINI_BIN=${GEMINI_BIN:-gemini}
GEMINI_MODEL=${GEMINI_MODEL:-}
GEMINI_APPROVAL_MODE=${GEMINI_APPROVAL_MODE:-yolo}
GEMINI_REVIEW_APPROVAL_MODE=${GEMINI_REVIEW_APPROVAL_MODE:-plan}

TASK_TEXT=""
TASK_FILE=""
RUN_BACKEND=1
RUN_FRONTEND=1
RUN_PLANNER=1
RUN_REVIEWER=1
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage:
  ./scripts/gemini-multi-agent.sh --task "작업 설명"
  ./scripts/gemini-multi-agent.sh --task-file docs/task.md

Options:
  --task TEXT           작업 설명을 직접 전달
  --task-file PATH      작업 설명 파일 경로
  --backend-only        backend worker만 실행
  --frontend-only       frontend worker만 실행
  --no-planner          planner 생략
  --no-review           reviewer 생략
  --dry-run             실제 Gemini 실행 없이 준비 단계만 수행
  -h, --help            도움말 출력

Environment:
  GEMINI_BIN=gemini
  GEMINI_MODEL=gemini-2.5-pro
  GEMINI_APPROVAL_MODE=yolo
  GEMINI_REVIEW_APPROVAL_MODE=plan

Artifacts:
  .gemini-agents/runs/<timestamp>/
  .gemini-agents/workspaces/<timestamp>/
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "필수 명령을 찾을 수 없습니다: $1"
}

while (($# > 0)); do
  case "$1" in
    --task)
      shift
      (($# > 0)) || die "--task 뒤에 내용이 필요합니다"
      TASK_TEXT=$1
      ;;
    --task-file)
      shift
      (($# > 0)) || die "--task-file 뒤에 경로가 필요합니다"
      TASK_FILE=$1
      ;;
    --backend-only)
      RUN_FRONTEND=0
      ;;
    --frontend-only)
      RUN_BACKEND=0
      ;;
    --no-planner)
      RUN_PLANNER=0
      ;;
    --no-review)
      RUN_REVIEWER=0
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "알 수 없는 옵션: $1"
      ;;
  esac
  shift
done

[[ $RUN_BACKEND -eq 1 || $RUN_FRONTEND -eq 1 ]] || die "backend 또는 frontend worker 중 하나는 실행해야 합니다"

if [[ -n "$TASK_FILE" ]]; then
  [[ -f "$TASK_FILE" ]] || die "작업 파일을 찾을 수 없습니다: $TASK_FILE"
  TASK_TEXT=$(cat "$TASK_FILE")
fi

[[ -n "$TASK_TEXT" ]] || die "--task 또는 --task-file 중 하나는 필요합니다"

require_cmd "$GEMINI_BIN"
require_cmd rsync
require_cmd date

RUN_ID=$(date -u +"%Y%m%dT%H%M%SZ")
RUN_DIR="$RUNS_DIR/$RUN_ID"
WORKSPACE_ROOT="$WORKSPACES_DIR/$RUN_ID"
mkdir -p "$RUN_DIR" "$WORKSPACE_ROOT"

TASK_PATH="$RUN_DIR/task.md"
PLAN_PROMPT="$RUN_DIR/planner.prompt.md"
PLAN_OUTPUT="$RUN_DIR/planner.output.md"
BACKEND_PROMPT="$RUN_DIR/backend.prompt.md"
BACKEND_OUTPUT="$RUN_DIR/backend.output.md"
FRONTEND_PROMPT="$RUN_DIR/frontend.prompt.md"
FRONTEND_OUTPUT="$RUN_DIR/frontend.output.md"
REVIEW_PROMPT="$RUN_DIR/reviewer.prompt.md"
REVIEW_OUTPUT="$RUN_DIR/reviewer.output.md"
SUMMARY_PATH="$RUN_DIR/summary.txt"

BACKEND_WORKSPACE="$WORKSPACE_ROOT/backend"
FRONTEND_WORKSPACE="$WORKSPACE_ROOT/frontend"

printf '%s\n' "$TASK_TEXT" > "$TASK_PATH"

copy_into_workspace() {
  local workspace=$1
  shift

  mkdir -p "$workspace"
  for rel_path in "$@"; do
    [[ -e "$REPO_ROOT/$rel_path" ]] || continue
    rsync -a \
      --exclude node_modules \
      --exclude .env \
      --exclude .gemini-agents \
      "$REPO_ROOT/$rel_path" "$workspace/"
  done
}

prune_workspace_modules() {
  local workspace=$1

  find "$workspace" -type d -name node_modules -prune -exec rm -rf {} +
}

link_runtime_dependencies() {
  local workspace=$1
  local rel_path=$2
  local target=$REPO_ROOT/$rel_path
  local link=$workspace/$rel_path

  [[ -e "$target" ]] || return 0
  mkdir -p "$(dirname "$link")"
  [[ -e "$link" ]] && return 0
  ln -s "$target" "$link"
}

sync_back() {
  local workspace=$1
  shift

  for rel_path in "$@"; do
    [[ -e "$workspace/$rel_path" ]] || continue
    mkdir -p "$(dirname "$REPO_ROOT/$rel_path")"
    rsync -a \
      --exclude node_modules \
      --exclude .env \
      "$workspace/$rel_path" "$(dirname "$REPO_ROOT/$rel_path")/"
  done
}

build_prompt() {
  local role=$1
  local output_path=$2
  local workspace_note=$3

  cat "$PROMPT_DIR/$role.md" > "$output_path"
  {
    echo
    echo "## 작업 요청"
    cat "$TASK_PATH"
    echo
    echo "## Planner 메모"
    if [[ -f "$PLAN_OUTPUT" ]]; then
      cat "$PLAN_OUTPUT"
    else
      echo "planner 생략"
    fi
    echo
    echo "## 실행 메모"
    echo "$workspace_note"
  } >> "$output_path"
}

run_agent() {
  local role=$1
  local workdir=$2
  local prompt_path=$3
  local output_path=$4
  local approval_mode=$5

  local -a args
  args=(--output-format text --approval-mode "$approval_mode")
  if [[ -n "$GEMINI_MODEL" ]]; then
    args+=(--model "$GEMINI_MODEL")
  fi

  if [[ $DRY_RUN -eq 1 ]]; then
    {
      echo "[dry-run] role=$role"
      echo "[dry-run] workdir=$workdir"
      echo "[dry-run] approval_mode=$approval_mode"
      echo "[dry-run] prompt=$prompt_path"
    } > "$output_path"
    return 0
  fi

  (
    cd "$workdir"
    "$GEMINI_BIN" "${args[@]}" -p "stdin의 지침을 수행하고, 중간 탐색 로그는 생략한 채 최종 결과만 간결하게 작성하세요." < "$prompt_path"
  ) > "$output_path" 2>&1
}

copy_into_workspace "$BACKEND_WORKSPACE" README.md setup.md GEMINI.md CLAUDE.md backend database swagger
copy_into_workspace "$FRONTEND_WORKSPACE" README.md setup.md GEMINI.md CLAUDE.md frontend mockup docs/9-APP-style-guide.md
prune_workspace_modules "$BACKEND_WORKSPACE"
prune_workspace_modules "$FRONTEND_WORKSPACE"
link_runtime_dependencies "$BACKEND_WORKSPACE" backend/node_modules
link_runtime_dependencies "$FRONTEND_WORKSPACE" frontend/node_modules
link_runtime_dependencies "$FRONTEND_WORKSPACE" node_modules

if [[ $RUN_PLANNER -eq 1 ]]; then
  build_prompt planner "$PLAN_PROMPT" "읽기 전용 planner 역할이다."
  run_agent planner "$REPO_ROOT" "$PLAN_PROMPT" "$PLAN_OUTPUT" plan
fi

if [[ $RUN_BACKEND -eq 1 ]]; then
  build_prompt backend "$BACKEND_PROMPT" "작업 디렉토리: $BACKEND_WORKSPACE"
fi

if [[ $RUN_FRONTEND -eq 1 ]]; then
  build_prompt frontend "$FRONTEND_PROMPT" "작업 디렉토리: $FRONTEND_WORKSPACE"
fi

BACKEND_STATUS=skipped
FRONTEND_STATUS=skipped

if [[ $RUN_BACKEND -eq 1 ]]; then
  run_agent backend "$BACKEND_WORKSPACE" "$BACKEND_PROMPT" "$BACKEND_OUTPUT" "$GEMINI_APPROVAL_MODE" &
  BACKEND_PID=$!
fi

if [[ $RUN_FRONTEND -eq 1 ]]; then
  run_agent frontend "$FRONTEND_WORKSPACE" "$FRONTEND_PROMPT" "$FRONTEND_OUTPUT" "$GEMINI_APPROVAL_MODE" &
  FRONTEND_PID=$!
fi

if [[ $RUN_BACKEND -eq 1 ]]; then
  if wait "$BACKEND_PID"; then
    BACKEND_STATUS=success
    sync_back "$BACKEND_WORKSPACE" backend database swagger
  else
    BACKEND_STATUS=failed
  fi
fi

if [[ $RUN_FRONTEND -eq 1 ]]; then
  if wait "$FRONTEND_PID"; then
    FRONTEND_STATUS=success
    sync_back "$FRONTEND_WORKSPACE" frontend mockup
  else
    FRONTEND_STATUS=failed
  fi
fi

if [[ $RUN_REVIEWER -eq 1 ]]; then
  build_prompt reviewer "$REVIEW_PROMPT" "리뷰 대상 run 디렉토리: $RUN_DIR"
  run_agent reviewer "$REPO_ROOT" "$REVIEW_PROMPT" "$REVIEW_OUTPUT" "$GEMINI_REVIEW_APPROVAL_MODE"
fi

{
  echo "run_id=$RUN_ID"
  echo "task_file=$TASK_PATH"
  echo "planner_output=$PLAN_OUTPUT"
  echo "backend_output=$BACKEND_OUTPUT"
  echo "frontend_output=$FRONTEND_OUTPUT"
  echo "review_output=$REVIEW_OUTPUT"
  echo "backend_status=$BACKEND_STATUS"
  echo "frontend_status=$FRONTEND_STATUS"
} > "$SUMMARY_PATH"

cat <<EOF
Run complete: $RUN_ID
- task: $TASK_PATH
- planner: $PLAN_OUTPUT
- backend: $BACKEND_OUTPUT ($BACKEND_STATUS)
- frontend: $FRONTEND_OUTPUT ($FRONTEND_STATUS)
- reviewer: $REVIEW_OUTPUT
- summary: $SUMMARY_PATH
EOF
