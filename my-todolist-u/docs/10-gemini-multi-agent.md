# Gemini Multi-Agent Guide

## 목적

Gemini CLI를 planner, backend worker, frontend worker, reviewer 역할로 나눠 반자동 개발 흐름을 만들기 위한 최소 구성이다.

## 구성 요소

- `GEMINI.md`
  - Gemini가 이 저장소에서 따라야 할 공통 작업 정책
- `agents/prompts/planner.md`
  - 작업 분해 전용 프롬프트
- `agents/prompts/backend.md`
  - backend/database/swagger 전용 프롬프트
- `agents/prompts/frontend.md`
  - frontend/mockup 전용 프롬프트
- `agents/prompts/reviewer.md`
  - 결과 검토 전용 프롬프트
- `scripts/gemini-multi-agent.sh`
  - planner -> workers 병렬 실행 -> reviewer 순서로 호출하는 실행기

## 실행 전 준비

`setup.md` 기준으로 Node, Gemini CLI, DB 준비를 먼저 끝낸다.

```bash
npm install -g @google/gemini-cli
docker start my-todolist-postgres
npm run dev
```

## 기본 사용법

```bash
./scripts/gemini-multi-agent.sh --task "로그인 에러 메시지를 개선하고 관련 테스트를 보강해줘"
```

작업 내용을 파일로 넘기고 싶으면:

```bash
./scripts/gemini-multi-agent.sh --task-file docs/task.md
```

## 자주 쓰는 옵션

```bash
./scripts/gemini-multi-agent.sh --frontend-only --task "로그인 페이지 접근성 개선"
./scripts/gemini-multi-agent.sh --backend-only --task "refresh token 예외 처리 보강"
./scripts/gemini-multi-agent.sh --no-review --task "간단한 UI 문구 수정"
./scripts/gemini-multi-agent.sh --dry-run --task "실행 준비만 확인"
```

## 환경 변수

```bash
GEMINI_MODEL=gemini-2.5-pro ./scripts/gemini-multi-agent.sh --task "..."
GEMINI_APPROVAL_MODE=yolo ./scripts/gemini-multi-agent.sh --task "..."
GEMINI_REVIEW_APPROVAL_MODE=plan ./scripts/gemini-multi-agent.sh --task "..."
```

## 산출물 위치

런타임 결과는 Git 추적 대상이 아닌 `.gemini-agents/` 아래에 저장된다.

- `.gemini-agents/runs/<timestamp>/`
  - task, planner output, worker output, reviewer output, summary
- `.gemini-agents/workspaces/<timestamp>/`
  - backend/frontend 전용 임시 작업공간

## 현재 버전의 제한

- worker 자동 동기화 대상은 `backend/`, `database/`, `swagger/`, `frontend/`, `mockup/` 로 제한
- 루트 파일이나 문서 수정은 자동 병합 대상이 아니므로 사람이 따로 정리하는 편이 안전
- 삭제된 파일 동기화는 자동 반영하지 않음
- reviewer는 기본적으로 읽기 전용 모드

## 추천 운영 방식

1. planner와 worker 결과를 먼저 확인
2. reviewer 결과로 회귀 위험을 점검
3. 마지막 테스트와 문서 정리는 사람이 마무리
