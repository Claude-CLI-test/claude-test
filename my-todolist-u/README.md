# my-todolist

> AI 에이전트(Claude, Qwen, Gemini)를 활용한 풀스택 코딩 연습 프로젝트
> 학생 일정 관리 할일 앱 (Student Todo List)

## 스크린샷

> 추후 추가 예정

<!-- 로그인 화면 -->
<!-- ![로그인](docs/screenshots/login.png) -->
<!-- 할일 목록 화면 -->
<!-- ![홈](docs/screenshots/home.png) -->

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| 인증 | JWT (Access Token + HttpOnly Refresh Token) |
| 테스트 | Vitest, Jest, Playwright |
| 배포 | GitHub Actions + Vercel |
| AI 에이전트 | Claude Code, Qwen, Gemini CLI |

---

## 프로젝트 구조

```
my-todolist-u/
├── frontend/          # React 프론트엔드
├── backend/           # Express 백엔드
├── database/          # PostgreSQL 스키마 및 시드 데이터
├── docs/              # 기획 및 설계 문서
├── swagger/           # OpenAPI 3.0 명세
├── e2e/               # Playwright E2E 테스트
├── mockup/            # 백엔드 없이 개발용 목서버
├── .github/workflows/ # GitHub Actions CI/CD
├── .claude/           # Claude AI 에이전트 설정
└── setup.md           # 로컬 개발 환경 설정 가이드
```

---

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- 할일 생성 / 조회 / 수정 / 삭제
- 할일 완료 상태 전환 (pending → completed)
- 마감일 초과 자동 감지 (`is_overdue`)
- 다국어 지원 (한국어 / English)

---

## 로컬 환경 설정

처음 시작하는 경우 **[setup.md](./setup.md)** 를 따라 환경을 구성하세요.

아래 항목들을 단계별로 안내합니다:

1. VS Code 설치
2. NVM + Node.js 설치
3. Python 설치
4. GitHub 계정 생성
5. Git 설치 및 설정
6. GitHub CLI 설치
7. AI Coding Agent 설치 (Claude, Qwen, Gemini)
8. Docker + WSL + Ubuntu 설치
9. 프로젝트 클론 (`C:\vibe`)
10. Claude Ubuntu 샌드박스 환경 설정
11. PostgreSQL 설치 및 DB 초기화

---

## 실행 방법

### 환경 변수 설정

```bash
# backend/.env 파일 생성 (backend/.env.example 참고)
cp backend/.env.example backend/.env

# frontend/.env 파일 생성 (frontend/.env.example 참고)
cp frontend/.env.example frontend/.env
```

### 의존성 설치

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 개발 서버 실행 (프론트 + 백엔드 동시)

```bash
npm run dev
```

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:3000 |
| API 문서 (Swagger) | http://localhost:3000/api-docs |

### 목서버로 실행 (백엔드 없이)

```bash
npm run dev:mock
```

### 테스트 계정

| 이메일 | 비밀번호 |
|---|---|
| alice@example.com | Password1! |
| bob@example.com | Password1! |

---

## 테스트 실행

```bash
# 프론트엔드 단위 테스트
cd frontend && npm test

# 백엔드 단위 테스트
cd backend && npm test

# 백엔드 커버리지
cd backend && npm run test:coverage

# E2E 테스트
npx playwright test
```

---

## API 문서

개발 서버 실행 후 아래 주소에서 Swagger UI를 확인할 수 있습니다.

```
http://localhost:3000/api-docs
```

주요 엔드포인트:

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/todos | 할일 목록 조회 |
| POST | /api/todos | 할일 생성 |
| PATCH | /api/todos/:id | 할일 수정 |
| DELETE | /api/todos/:id | 할일 삭제 |
| PATCH | /api/todos/:id/status | 상태 변경 |

---

## 배포

- **프론트엔드**: Vercel (`frontend/vercel.json`)
- **백엔드**: Vercel (`backend/vercel.json`)
- **CI/CD**: GitHub Actions (`.github/workflows/`)

프로덕션 API: `http://sjc-todolist-be.vercel.app/api`
