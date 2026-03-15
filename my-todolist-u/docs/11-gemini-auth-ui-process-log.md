# Gemini Multi-Agent 로그인/회원가입 UI 작업 전 과정 기록

## 1. 문서 목적

이 문서는 `frontend`의 로그인 페이지와 회원가입 페이지를 Gemini 기반 멀티 에이전트로 수정하는 과정에서:

- 실제 Gemini 에이전트들이 수행한 작업
- 오케스트레이터 스크립트가 수행한 작업
- 외부 개입(Codex/사람이 직접 수행한 작업)이 있었던 지점
- 왜 그 개입이 필요했는지
- 그 문제가 Gemini 에이전트만으로도 해결 가능했는지

를 순차적으로 최대한 빠짐없이 정리한 기록이다.

이 문서는 다음 증거를 바탕으로 작성했다.

- 실행 스크립트: `scripts/gemini-multi-agent.sh`
- 런 기록: `.gemini-agents/runs/20260315T131745Z`, `.gemini-agents/runs/20260315T132827Z`, `.gemini-agents/runs/20260315T133603Z`
- 워크스페이스: `.gemini-agents/workspaces/20260315T132827Z`, `.gemini-agents/workspaces/20260315T133603Z`
- 최종 반영 파일: `frontend/src/components/AuthLayout.tsx`, `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/SignupPage.tsx`, `frontend/src/i18n/en.ts`, `frontend/src/i18n/ko.ts` 등
- 최종 검증: `frontend`에서 실행한 `npm test`, `npm run build`

## 2. 중요한 한계와 복원 기준

### 2-1. 완전한 미시 로그는 원천적으로 남아 있지 않다

`scripts/gemini-multi-agent.sh`의 `run_agent()`는 Gemini에 다음 성격의 지시를 준다.

- 표준 입력으로 전달된 프롬프트를 수행
- "중간 탐색 로그는 생략"
- "최종 결과만 간결하게 작성"

즉, 각 Gemini 에이전트가 내부적으로 어떤 파일을 몇 번 읽고 어떤 도구 호출을 어떤 순서로 했는지 같은 미시 로그는 run 산출물에 남지 않는다.

따라서 이 문서의 기준은 다음과 같다.

- `task.md`, `planner.output.md`, `frontend.output.md`, `reviewer.output.md`에 **직접 기록된 내용**은 사실로 기록
- run 디렉토리에 없는 파일은 **생성되지 않았거나 실행이 완료되지 않은 것**으로 기록
- 워크스페이스 파일과 최종 반영 파일 비교를 통해 **실제로 남은 산출물**을 복원
- 직접 터미널에서 수행한 수동 작업은 **외부 개입**으로 명시
- 추정이 필요한 부분은 **추정**이라고 분리해서 기술

이 문서는 "관측 가능한 전과정"을 최대한 빠짐없이 정리한 것이다. 다만 Gemini 내부의 숨겨진 미시 실행까지 1:1로 재현할 수는 없다.

## 3. 이번 작업에 참여한 주체

### 3-1. 오케스트레이터

- `scripts/gemini-multi-agent.sh`
- 역할: run 디렉토리 생성, workspace 복사, 프롬프트 조합, Gemini 실행, 성공 시 sync-back, reviewer 실행, summary 생성

### 3-2. Gemini 에이전트

- `planner`
- `frontend`
- `reviewer`
- `backend`

이번 로그인/회원가입 UI 작업에서는 실질적으로 `planner`, `frontend`, `reviewer`가 관여했고, 실제 파일 수정은 `frontend` 워커가 담당했다. `backend`는 UI 작업 범위상 건너뛰어진 run이 있었다.

### 3-3. 외부 개입 주체

- Codex/사람 수동 개입
- 역할: 실패한 run 이후 Tailwind 기반 정비, 디자인 보정, 테스트/빌드 문제 수정, 최종 검증, 개발 서버 실행 문제 정리

### 3-4. Gemini가 실제로 한 일만 따로

- `20260315T131745Z`에서 planner/backend/frontend/reviewer가 로그인 및 refresh 흐름을 읽기 전용으로 분석했고, 실제 UI 수정 전 멀티 에이전트 파이프라인이 동작하는지 점검했다.
- `20260315T132827Z`에서 planner는 로그인/회원가입 UI 개편 계획을 세웠고, frontend 워커는 Tailwind 설정 추가와 로그인/회원가입 페이지의 1차 Tailwind 전환을 시도했지만 편집 실패로 실행을 정상 종료하지 못했다.
- `20260315T133603Z`에서 planner는 범위를 더 좁혀 `LoginPage.tsx`, `SignupPage.tsx`, `AuthLayout.tsx`, 관련 i18n/테스트 갱신 계획을 세웠고, frontend 워커는 실제로 공용 레이아웃 생성, 페이지 리팩터링, CSS Module 제거, 테스트 수정까지 수행했다.
- `20260315T133603Z`의 reviewer는 시각적 회귀 테스트, 모바일 반응형 세부 구현, 공용 컴포넌트 구조에 대한 잔여 리스크를 기록했다.
- Gemini가 최종본의 큰 뼈대는 만들었지만, 디자인 완성도와 후속 안정화까지 단독으로 마무리하지는 못했다.

### 3-5. 외부 개입만 따로

- `20260315T132827Z` 실패 후, 원본 저장소에서 `frontend/package.json`, `frontend/package-lock.json`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/src/index.css`를 직접 정비해 Tailwind 기반을 안정화했다.
- `frontend`에서 `npm install`을 직접 실행해 의존성과 lockfile을 실제 반영 상태로 맞췄다.
- `20260315T133603Z` 성공 run 이후에도 결과물이 "실제 운영하는 일정 관리 서비스" 수준에는 못 미친다고 판단해 `AuthLayout.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `en.ts`, `ko.ts`를 직접 추가 보정했다.
- 수동 보정 이후 드러난 `ReactNode` 타입 import 문제와 `SignupPage`의 중복 문구로 인한 테스트 모호성도 외부에서 직접 수정했다.
- 최종적으로 `frontend`에서 `npm test`, `npm run build`를 직접 실행해 각각 `104 passed`, 빌드 성공을 확인했다.
- 화면 확인 과정에서 생긴 dev 서버 포트 충돌 문제를 줄이기 위해 `scripts/dev-start.sh`, 루트 `package.json`, `frontend/vite.config.ts`도 직접 정리했다.

### 3-6. 멀티 에이전트 운영 개선 포인트만 따로

- 첫 UI 작업 run이 실패한 가장 큰 이유는 Tailwind 설치, 설정, 화면 전면 개편, 테스트 수정까지 한 번에 묶어 워커 부담이 너무 컸기 때문이다. 다음부터는 `환경 준비 -> UI 개편 -> 테스트 정리`를 분리하는 편이 낫다.
- 현재 오케스트레이터는 워커 실패 시 자동 재시도, 프롬프트 보강, 부분 산출물 재활용이 없다. 실패한 run을 자동 복구하는 루프가 필요하다.
- `replace` 실패가 run 전체 중단으로 이어졌으므로, 프롬프트에 "부분 치환 실패 시 전체 파일 재작성 우선" 원칙을 기본값으로 두는 편이 안전하다.
- reviewer가 기능/리스크 검토에는 유용했지만 시각 완성도를 밀어올리는 역할은 약했다. 디자인 전용 reviewer나 스크린샷 기반 2차 리뷰가 필요하다.
- "실제 서비스처럼" 같은 추상적 요구만으로는 결과가 평균적 UI로 수렴하기 쉽다. 레퍼런스, 톤, 정보 계층, 금지 패턴을 더 구체적으로 주는 편이 좋다.
- 이번 사례를 보면 Gemini만으로도 상당 부분 해결 가능했지만, 품질을 높이려면 1회전 실행이 아니라 `생성 -> 리뷰 -> 재수정`의 다회전 구조가 필요하다.

## 4. 오케스트레이터가 실제로 수행하는 순서

`scripts/gemini-multi-agent.sh` 기준 실제 실행 순서는 다음과 같다.

1. run ID 생성
2. `.gemini-agents/runs/<run_id>`와 `.gemini-agents/workspaces/<run_id>` 생성
3. 작업 텍스트를 `task.md`로 저장
4. backend/frontend 전용 workspace로 일부 경로만 복사
5. workspace 안의 `node_modules` 제거
6. 원본 저장소의 `node_modules`를 심볼릭 링크로 연결
7. planner 프롬프트 생성 및 실행
8. backend/frontend 프롬프트 생성
9. backend/frontend 워커 실행
10. 성공한 워커의 결과만 원본 저장소로 sync-back
11. reviewer 프롬프트 생성 및 실행
12. `summary.txt` 생성

즉, 여러 에이전트가 있는 구조이긴 하지만, 실제로는:

- planner 먼저
- backend/frontend 워커
- 마지막 reviewer

순으로 움직인다.

## 5. 선행 맥락: UI 수정 전 읽기 전용 점검 run

### 5-1. run ID

- `20260315T131745Z`

### 5-2. 이 run의 목적

`task.md` 기준으로 이 run은 로그인과 refresh 흐름을 읽고 planner/backend/frontend/reviewer 관점에서 개선 필요 여부를 요약하는 읽기 전용 실행이었다.

즉, **로그인/회원가입 UI 개편 작업 그 자체는 아니고**, 멀티 에이전트 파이프라인과 인증 흐름 분석을 검증하는 선행 run이었다.

### 5-3. 실제 결과

- `summary.txt` 존재
- `planner.output.md`, `backend.output.md`, `frontend.output.md`, `reviewer.output.md` 존재
- `backend_status=success`
- `frontend_status=success`
- 파일 수정 없음

### 5-4. 의미

이 run은 UI를 바꾸지 않았지만, 이후 실제 UI 작업에 멀티 에이전트를 적용하기 전에:

- 오케스트레이터가 동작하는지
- planner/backend/frontend/reviewer 역할 분리가 가능한지
- 인증 관련 컨텍스트를 에이전트들이 읽을 수 있는지

를 확인한 사전 검증 run이었다.

## 6. 실제 UI 개편 1차 시도: 실패/미완료 run

### 6-1. run ID

- `20260315T132827Z`

### 6-2. 이 run의 작업 요청

`task.md` 기준 요약:

- `frontend` 안에서 실제 코드 수정
- 로그인/회원가입 페이지를 Tailwind CSS 기반으로 전면 개편
- Tailwind가 없으면 설정과 의존성 추가
- 인증 로직, i18n, 검증, 라우팅 유지
- 오렌지/화이트 계열 생산성 앱 느낌
- `frontend/` 중심으로 작업

### 6-3. run 디렉토리에 실제로 남은 파일

이 run 디렉토리에는 다음만 남아 있다.

- `task.md`
- `planner.prompt.md`
- `planner.output.md`
- `frontend.prompt.md`
- `frontend.output.md`

다음 파일은 없다.

- `summary.txt`
- `reviewer.output.md`
- `backend.output.md`

즉, 이 run은 **전체 파이프라인을 정상 종료하지 못했다**고 보는 것이 맞다.

### 6-4. planner가 기록한 계획

`planner.output.md` 기준:

- Tailwind 의존성 확인 및 필요 시 추가
- `tailwind.config.js`, `index.css` 설정
- 로그인/회원가입 페이지 식별
- Tailwind 기반 UI 재설계
- 테스트 업데이트 및 실행
- reviewer는 Tailwind 적용 여부, 기능 보존, 모바일 반응성, 테스트 통과 여부를 확인하도록 계획

### 6-5. frontend 워커가 실제로 남긴 로그

`frontend.output.md`에서 관측된 핵심은 다음이다.

- YOLO 모드 활성화
- `replace` 도구 실행 실패 2회
- 에러 문구:
  - `Error executing tool replace: Error: Failed to edit, could not find the string to replace.`

이 로그만 봐도 첫 번째 실제 수정 run은 편집 단계에서 삐끗했고, 복구 루프를 끝까지 밟지 못했음을 알 수 있다.

### 6-6. 실패 run의 workspace를 확인했을 때 실제로 남아 있던 산출물

`.gemini-agents/workspaces/20260315T132827Z/frontend/frontend/`를 직접 확인한 결과:

- `frontend/package.json`에 Tailwind 관련 의존성 추가 흔적 존재
  - `tailwindcss: ^4.2.1`
  - `postcss: ^8.5.8`
  - `autoprefixer: ^10.4.27`
- `frontend/tailwind.config.js` 생성
- `frontend/postcss.config.js` 생성
- `frontend/src/index.css` 상단에 Tailwind 지시어 존재
- `frontend/src/pages/LoginPage.tsx`는 Tailwind 기반의 단순 단일 카드형 로그인 페이지로 변경됨
- `frontend/src/pages/SignupPage.tsx`는 Tailwind 기반의 단순 단일 카드형 회원가입 페이지로 변경됨
- `frontend/src/components/AuthLayout.tsx`는 **존재하지 않음**
- `frontend/src/i18n/en.ts`, `frontend/src/i18n/ko.ts`에는 최종 run에서 쓰인 프로모션용 새 키들이 아직 없음

즉, 이 run은 다음 상태까지는 갔다.

- Tailwind 설정 일부 생성
- 로그인/회원가입 페이지를 Tailwind 문법으로 일부 교체

하지만 다음은 완성하지 못했다.

- 공용 `AuthLayout.tsx`
- "실제 서비스 같은" 양면 레이아웃
- reviewer 단계
- summary 생성
- 신뢰 요소/서비스 소개/테스트 계정 안내를 포함한 최종 수준 디자인

### 6-7. 왜 Gemini 에이전트가 여기서 직접 끝까지 해결하지 못했는가

관측 가능한 원인은 4가지다.

1. 편집 방식이 깨지기 쉬웠다.
   `frontend.output.md`에 남은 `replace` 실패는 에이전트가 기존 문자열 치환 방식에 의존했고, 실제 파일 내용과 정확히 맞지 않아 편집이 끊겼음을 보여준다.

2. 작업 범위가 첫 run에서 너무 넓었다.
   이 run은 한 번에 Tailwind 설치, 설정 파일 생성, 페이지 전면 개편, 테스트까지 모두 수행하려고 했다.

3. 실패 후 자동 복구 루프가 없었다.
   현재 오케스트레이터는 워커 실패 시 자동으로 프롬프트를 보강해 재시도하지 않는다.

4. 중간 로그 억제 때문에 상태 파악이 제한됐다.
   스크립트가 애초에 "중간 탐색 로그는 생략"하도록 했기 때문에, 어디서 얼마나 막혔는지 세부 복구 정보가 부족했다.

### 6-8. 이 문제는 Gemini 에이전트만으로도 해결 가능했는가

결론부터 말하면 **충분히 가능했을 확률이 높다.**

다만 당시 실행 방식에서는 성공 확률이 낮았다.

가능했을 이유:

- 이후 2차 run에서 더 구체적인 제약과 지시를 주자 실제로 성공했다.
- 특히 "파일 편집이 잘 안 맞으면 부분 치환 대신 파일 전체를 다시 작성해도 된다"는 방향이 편집 실패 복구에 유효했다.
- Tailwind 기반과 범위를 미리 정리해 주면 워커는 페이지 전면 재작성 자체는 수행 가능했다.

당시 실패한 이유:

- 첫 run은 "설정 + 디자인 + 테스트"를 한 번에 처리했다.
- 워커가 부분 치환 실패 후 충분한 재계획을 끝까지 하지 못했다.
- 오케스트레이터가 실패 run의 부분 결과를 자동으로 재활용하지 않았다.

## 7. 1차 실패 후 외부 개입: Tailwind 기반 수동 정비

### 7-1. 외부에서 실제로 수행한 작업

실패 run 이후, 원본 저장소 기준으로 직접 다음 작업을 했다.

- `frontend/package.json` 수동 정비
- `frontend/package-lock.json` 갱신
- `frontend/tailwind.config.js` 추가
- `frontend/postcss.config.js` 추가
- `frontend/src/index.css`에 Tailwind 지시어 반영
- `frontend`에서 `npm install` 실행

최종 반영 기준 의존성 버전은 다음과 같다.

- `tailwindcss: ^3.4.17`
- `postcss: ^8.4.49`
- `autoprefixer: ^10.4.20`

### 7-2. 왜 외부 개입이 필요했는가

1차 run의 workspace 안에는 Tailwind 설정이 생성됐지만, 그 run 자체가 정상 완료되지 않아:

- summary가 없고
- reviewer도 없고
- 최종 sync-back이 믿을 수 있는 상태로 끝났다고 보기 어려웠다

그래서 원본 저장소 기준으로 **안정적인 Tailwind 기반을 먼저 확정**하는 것이 더 안전했다.

### 7-3. 이 부분도 Gemini 에이전트만으로 해결 가능했는가

이 역시 **가능했을 확률이 높다.**

다만 조건이 필요했다.

- 첫 run을 재시도하거나
- Tailwind 설정만 별도 좁은 task로 분리하거나
- 설정 변경 후 반드시 summary와 sync-back까지 완료되는 성공 run을 만들어야 했다

외부 개입을 택한 이유는 "에이전트가 절대 못해서"가 아니라, **실패한 상태를 계속 물고 가기보다 기반을 먼저 고정하는 것이 더 빠르고 결정적이었기 때문**이다.

## 8. 실제 UI 개편 2차 시도: 성공 run

### 8-1. run ID

- `20260315T133603Z`

### 8-2. 이 run의 작업 요청

`task.md` 기준 요약:

- Tailwind는 이미 설정돼 있으니 `package.json`, `package-lock.json`, Tailwind/PostCSS 설정은 수정하지 말 것
- `LoginPage.tsx`, `SignupPage.tsx` 중심으로 UI 전면 개편
- 필요 시 `frontend/src/components`에 공용 프레젠테이션 컴포넌트 추가 가능
- 기존 CSS Module 의존성 제거 가능
- 인증 로직, i18n 키, 검증, 제출 동작, 라우팅 유지
- 보조 영역이 있는 프로덕션 느낌의 양면 레이아웃
- 모바일 대응
- 관련 테스트 수정 및 실행
- 파일 편집이 잘 안 맞으면 부분 치환 대신 전체 재작성 허용

이 프롬프트는 1차 run보다 훨씬 성공하기 좋은 형태였다.

### 8-3. summary 기준 실제 상태

`summary.txt` 기준:

- `run_id=20260315T133603Z`
- `backend_status=skipped`
- `frontend_status=success`

즉, 이번 UI 작업의 실제 파일 수정 주체는 `frontend` 워커였고, `backend`는 의도적으로 건너뛰었다.

### 8-4. planner가 실제로 수행 계획으로 남긴 내용

`planner.output.md` 기준 주요 계획:

- `LoginPage.tsx`, `SignupPage.tsx` 구조 분석
- `AuthLayout.tsx` 생성
- 두 페이지를 Tailwind 기반 양면 레이아웃으로 리팩터링
- CSS Module 제거
- 모바일 반응성 확보
- 관련 테스트 실행 및 수정

### 8-5. frontend 워커가 실제로 수행했다고 기록한 작업

`frontend.output.md` 기준으로 워커가 남긴 작업 흐름은 다음과 같다.

1. `LoginPage.tsx`, `SignupPage.tsx` 읽기
2. `AuthLayout.tsx` 공용 레이아웃 설계
3. `en.ts`, `ko.ts`에 새 키 추가 필요성 인식
4. 로그인/회원가입 페이지를 `AuthLayout` 기반으로 리팩터링
5. `LoginPage.module.css` 제거
6. `App.tsx`, `index.css` 점검
7. `frontend` 테스트 실행
8. `LoginPage.test.tsx`, `SignupPage.test.tsx` 실패 분석 및 수정
9. `AuthContext.test.tsx` 실패 분석
10. `AuthContext.tsx` 구현을 바꾸지 않고, 현재 설계에 맞게 `AuthContext.test.tsx`를 조정
11. 다시 테스트 실행
12. `frontend` 테스트 104개 통과 확인
13. E2E까지 고려했지만 실제 완료 기록은 남기지 못함

### 8-6. frontend 워커가 사실상 만들어낸 변경 범위

run 산출물과 현재 저장소 비교 기준으로, Gemini frontend 워커가 반영한 핵심 범위는 다음과 같다.

- `frontend/src/components/AuthLayout.tsx` 생성
- `frontend/src/pages/LoginPage.tsx` 리팩터링
- `frontend/src/pages/SignupPage.tsx` 리팩터링
- `frontend/src/i18n/en.ts` 키 추가/문구 변경
- `frontend/src/i18n/ko.ts` 키 추가/문구 변경
- `frontend/src/pages/LoginPage.test.tsx` 수정
- `frontend/src/pages/SignupPage.test.tsx` 수정
- `frontend/src/contexts/AuthContext.test.tsx` 수정
- `frontend/src/pages/LoginPage.module.css` 제거

### 8-7. reviewer가 실제로 남긴 내용

`reviewer.output.md`는 주로 residual risk를 남겼다.

핵심 포인트:

- 시각적 회귀 테스트 업데이트 여부 불확실
- 모바일 반응성 세부 구현 계획 부족 우려
- 공용 컴포넌트 가이드라인 부재 우려

중요한 점은 reviewer가 **기능/검증/리스크 관점의 리뷰는 했지만**, "정말 실제 서비스처럼 세련됐는가"라는 미학적 판단을 강하게 수행하지는 못했다는 것이다.

## 9. 2차 성공 run 이후 외부 개입: 디자인 품질 보정

### 9-1. 왜 성공 run 뒤에도 외부 개입이 필요했는가

2차 run은 구조적으로는 성공했다.

- Tailwind 사용
- 공통 레이아웃 생성
- 테스트 수정
- 기능 유지

하지만 사용자 요구인 "**실제 운영하는 일정 관리 서비스처럼**"이라는 수준에서는 여전히 부족했다.

그 이유는 다음과 같다.

1. 프롬프트가 여전히 추상적이었다.
   "실제 서비스처럼"은 충분히 구체적인 비주얼 명세가 아니다.

2. 워커가 안전한 평균값으로 수렴했다.
   Gemini 출력은 구조적으로는 나쁘지 않았지만, 실제 서비스 레벨의 강한 시각 언어까지는 밀어붙이지 못했다.

3. reviewer가 디자인 평론가 역할까지 하진 않았다.
   reviewer는 요구사항 충족과 리스크 점검에는 유용했지만, 시각 완성도까지 밀도 있게 압박하지 않았다.

### 9-2. 외부에서 실제로 추가 수정한 내용

성공 run 이후 최종 반영본은 그대로 두지 않고, 원본 저장소에서 직접 다음 수정을 더했다.

#### `frontend/src/components/AuthLayout.tsx`

- `variant` prop 추가
- 단순 회색/인디고 톤 레이아웃을 오렌지/화이트 계열 일정 관리 서비스 톤으로 재설계
- 상단 브랜드 헤더 정리
- 언어 토글을 pill 형태로 보정
- 좌측 소개 영역을 실제 서비스형 홍보 패널로 재설계
- `24h`, `3 View`, `Mobile` 카드 추가
- 데모 계정을 `alice@example.com`, `bob@example.com`, `Password1!`로 명시

#### `frontend/src/pages/LoginPage.tsx`

- `AuthLayout`에 `variant="login"` 전달
- 버튼/인풋/에러 배너를 브랜드 톤에 맞게 재정리
- placeholder를 `alice@example.com` 기준으로 보정
- 테스트 계정 힌트 카드를 더 명확히 배치

#### `frontend/src/pages/SignupPage.tsx`

- `AuthLayout`에 `variant="signup"` 전달
- `apiError`와 `emailError`를 분리해 오류 의미를 명확히 함
- 버튼/인풋/보조 카드 재정리
- 회원가입용 보조 설명을 생산성 앱 톤으로 수정

#### `frontend/src/i18n/en.ts`, `frontend/src/i18n/ko.ts`

- 일반적인 "productivity" 톤 문구를 학생 일정/마감/수업/팀 일정 중심 문구로 교체
- `loginSubtitle`, `signupSubtitle`를 더 구체적으로 수정
- 프로모션 문구를 "실제 일정 관리 서비스"에 가깝게 교체

#### 삭제

- `frontend/src/pages/LoginPage.css`
- `frontend/src/pages/LoginPage.module.css`

### 9-3. 이것은 왜 Gemini가 직접 끝내지 못했는가

핵심은 "불가능"이 아니라 "현재 에이전트 구성으로는 품질 바가 낮았다"이다.

직접 못 끝낸 이유:

1. 비주얼 기준이 추상적이었다.
   레퍼런스 서비스, 레이아웃 밀도, 타이포 방향, 정보 계층이 충분히 구체적이지 않았다.

2. 피드백 루프가 1회전이었다.
   현재 구조는 planner -> worker -> reviewer 1회전 후 종료다. 화면을 보고 다시 다듬는 반복 루프가 없었다.

3. reviewer가 시각 품질보다 기능/리스크에 무게를 뒀다.

4. 실제 브라우저 스크린샷 기반 재비평 루프가 없었다.

### 9-4. 이 부분은 Gemini 에이전트만으로도 해결 가능했는가

결론은 **가능했을 확률이 높다.**

필요했을 조건:

- 프롬프트에 더 구체적인 디자인 목표 명시
- 실제 레퍼런스 설명 또는 이미지 기준 제공
- reviewer를 "디자인 크리틱" 역할로 강화
- 1회성이 아니라 2~3회 반복 수정 루프 운영
- 화면 캡처를 다시 입력해 재수정하는 사이클 추가

즉, 에이전트 능력 자체의 한계라기보다 **운영 방식과 평가 기준의 한계**에 더 가까웠다.

## 10. 외부 개입으로 생긴 추가 문제와 그 해결

### 10-1. 문제 1: `AuthLayout.tsx` 타입 import 문제

외부 디자인 보정 이후 `npm run build` 단계에서:

- `ReactNode`를 일반 import로 쓴 부분이 타입 전용 import여야 하는 문제가 드러났다

해결:

- `import { ReactNode } from 'react'`를
- `import type { ReactNode } from 'react'`로 수정

이 문제는 Gemini run의 원래 산출물이라기보다, 후속 수동 보정 과정에서 정리된 최종본에서 드러난 문제다.

### 10-2. 문제 2: `SignupPage.tsx`의 중복 문구로 인한 테스트 모호성

외부 디자인 보정 이후 `npm test` 단계에서:

- 비밀번호 힌트 문구가 두 곳에서 중복되어 Testing Library 쿼리가 모호해졌다

해결:

- 하단 보조 카드 문구를 `passwordHint`와 겹치지 않는 별도 문장으로 바꿨다

즉, 이 문제는 Gemini가 남긴 버그라기보다 **외부 보정 과정에서 새로 생긴 테스트 충돌**이었다.

### 10-3. 이 두 문제는 Gemini 에이전트만으로도 해결 가능했는가

둘 다 **매우 쉽게 해결 가능했다.**

오히려 이 두 문제는:

- 최종 수동 편집 뒤에
- 다시 한 번 frontend 워커나 reviewer에게
- "현재 build/test 실패만 해결해라"

라고 주면 충분히 해결 가능한 종류였다.

이번에는 속도와 확실성을 위해 외부에서 바로 수정했다.

## 11. 후속 실행 이슈: 실제 화면 확인 중 생긴 환경 문제

이 UI 작업 자체와 별개로, 실제 브라우저 확인 과정에서는 개발 서버 환경 문제도 있었다.

### 11-1. 사용자가 본 화면이 기대와 달라 보였던 이유

후속 확인 시점에는:

- 예전 프론트/백엔드 dev 서버가 이미 떠 있었고
- 새로 `npm run dev`를 다시 실행하면서
- `3000`, `5173` 포트 충돌이 발생했다

그 결과:

- 오래 떠 있던 서버를 계속 보고 있었을 가능성
- `5173`이 아니라 `5174`로 프론트가 올라가며 혼선이 생긴 가능성

이 있었다.

### 11-2. 외부에서 수행한 후속 정리

이 문제를 줄이기 위해 추가로:

- `scripts/dev-start.sh` 추가
- 루트 `package.json`의 `dev` 스크립트를 이 스크립트로 교체
- `frontend/vite.config.ts`에 `port: 5173`, `strictPort: true` 설정

을 반영했다.

이 작업은 로그인/회원가입 UI 디자인 자체를 만드는 작업은 아니지만, **최종 결과를 제대로 확인하기 위한 실행 환경 안정화**에 해당한다.

## 12. 최종 검증

최종 반영 상태에서 `frontend` 기준으로 직접 검증한 결과는 다음과 같다.

### 12-1. 단위 테스트

실행:

- `npm test`

결과:

- Test Files: `11 passed`
- Tests: `104 passed (104)`

### 12-2. 프로덕션 빌드

실행:

- `npm run build`

결과:

- 빌드 성공
- `dist/assets/index-DygRPr75.css`
- `dist/assets/index-CyEtJ25A.js`

즉, 최종본은 최소한 다음을 만족한다.

- 타입체크/번들링 가능
- 프론트 단위 테스트 통과
- 로그인/회원가입 UI의 구조 및 테스트 기대치 정합성 확보

## 13. 최종적으로 누가 무엇을 했는지 한 줄 요약

### Gemini planner

- 작업을 분해하고 프론트 워커가 해야 할 구조를 계획했다.

### Gemini frontend worker

- 로그인/회원가입 페이지의 Tailwind 전환, 공통 레이아웃 초안, i18n 확장, 관련 테스트 수정의 큰 뼈대를 만들었다.

### Gemini reviewer

- 리스크와 테스트 관점의 검토를 남겼지만, 시각 완성도까지는 충분히 밀어붙이지 못했다.

### 오케스트레이터

- workspace 분리, 프롬프트 생성, 워커 실행, 성공분 sync-back, 산출물 저장을 수행했다.

### 외부 개입(Codex/수동)

- 1차 실패 run 이후 Tailwind 기반을 안정화했다.
- 2차 성공 run 이후 디자인 품질을 실제 서비스 수준에 맞추도록 수동 보정했다.
- 수동 보정으로 생긴 build/test 이슈를 직접 수정했다.
- 최종 테스트와 빌드를 실행했다.
- 실제 화면 확인 중 생긴 포트 충돌 문제를 줄이기 위해 dev 실행 스크립트도 정리했다.

## 14. 최종 결론

이번 작업은 "**Gemini 에이전트가 큰 구조와 초안을 만들고, 외부 개입이 품질과 안정성을 마무리한 케이스**"로 정리하는 것이 가장 정확하다.

정확히 말하면:

- 1차 run은 실패/미완료
- 외부 개입으로 Tailwind 기반 안정화
- 2차 run은 구조적 성공
- 그러나 디자인 품질은 추가 외부 보정 필요
- 최종 build/test는 외부에서 검증 및 마무리

따라서 "Gemini만으로 전부 끝냈다"고 쓰면 부정확하고, 반대로 "Gemini가 거의 못 했다"고 써도 부정확하다.

가장 사실에 가까운 표현은 다음이다.

> Gemini가 로그인/회원가입 UI 개편의 초안, 구조, 테스트 보정의 상당 부분을 수행했고, 외부 개입이 실패한 기반 작업 복구, 디자인 품질 상향, 최종 검증과 실행 환경 안정화를 담당했다.
