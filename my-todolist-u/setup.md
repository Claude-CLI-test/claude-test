# 개발 환경 설정 가이드

## 1. VS Code 설치

- [https://code.visualstudio.com](https://code.visualstudio.com) 에서 다운로드 후 설치

---

## 2. NVM 설치 (Node.js 버전 관리)

### 2.1 NVM 설치
- [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases) 에서 `nvm-setup.exe` 다운로드 후 설치

### 2.2 PowerShell에서 Node.js 설치

```powershell
nvm install 24
nvm use 24
node -v
npm -v
```

---

## 3. Python 3.13 이상 설치

- [https://www.python.org/downloads/](https://www.python.org/downloads/) 에서 최신 버전 다운로드
- 설치 첫 화면에서 **`Add Python.exe to Path`** 체크 후 **`Install Now`** 클릭

---

## 4. GitHub 계정 생성

- [https://github.com](https://github.com) 에서 계정 생성

---

## 5. Git 설치 및 설정

### 5.1 Git 설치
- [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win) 에서 **64-bit Git for Windows Setup** 다운로드
- 설치 중 **`Select components`** 화면에서 **`(New) Add a git bash profile to Windows Terminal`** 항목 체크

### 5.2 Git 초기 설정 (Windows 터미널에서 실행)

```bash
git config --global user.name "자신의 영문이름"
git config --global user.email "자신의 이메일 주소"
git config --global init.defaultBranch main
git config --global credential.helper store
git config --global core.editor "notepad"
git config --list
```

---

## 6. GitHub CLI (gh) 설치

```powershell
winget install --id GitHub.cli
```

---

## 7. AI Coding Agent 설치 (Windows 터미널에서)

```bash
# Claude Code
npm install -g @anthropic-ai/claude-code
claude --version

# Qwen
npm install -g @qwen-code/qwen-code

# Gemini CLI
npm install -g @google/gemini-cli
```

---

## 8. AI Agent 실행 (Windows 터미널에서)

```bash
claude    # Claude 실행
gemini    # Gemini 실행
qwen      # Qwen 실행
```

---

## 9. 프로젝트 클론 (Windows 터미널에서)

```powershell
mkdir C:\vibe
cd C:\vibe
git clone https://github.com/sujinchoi-u/my-todolist-u
```

---

## 10. DB 설치 (PostgreSQL은 Ubuntu 위에서 실행, Ubuntu는 Docker/WSL 필요)

### 10.1 WSL 설치 (Windows 터미널에서)

```powershell
wsl --install
```

### 10.2 시스템 아키텍처 확인

**설정 > 시스템 > 정보 > 시스템 종류** 확인:

| 표시 내용 | 아키텍처 |
|---|---|
| 64비트 운영 체제, x64 기반 프로세서 | AMD64 (Intel/AMD CPU) |
| 64비트 운영 체제, ARM 기반 프로세서 | ARM64 (스냅드래곤 등) |

### 10.3 Docker Desktop 설치
- [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) 에서 다운로드
- 설치 옵션:
  - **`Use WSL 2 instead of Hyper-V`**: 반드시 체크
  - **`Allow Windows containers...`**: 체크하지 않음

### 10.4 Ubuntu 설치 (Windows 터미널에서)

```powershell
wsl --install -d Ubuntu
# 계정: sogang / 비밀번호: root
```

### 10.5 PostgreSQL 설치 (Ubuntu 터미널에서)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'post';"
```

### 설치 확인

```bash
node -v          # v18.x.x 이상
npm -v           # 9.x.x 이상
psql --version   # psql 17.x 이상
```

### 10.6 DB 초기화 및 테스트 데이터 생성

```bash
bash tododb-setup.sh
# DB 비밀번호: post
```

---

## 11. 설치 완료 후 애플리케이션 실행 방법

```bash
npm run dev
```

| 항목 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:3000 |

**테스트 계정:**
- `alice@example.com` / `Password1!`
- `bob@example.com` / `Password1!`

---

## 참고. Swagger Mock 서버 설정 및 사용법

백엔드 구현 전에 프론트엔드를 개발하거나, API 명세(요청/응답 형식)를 미리 확인하기 위한 목서버입니다.
실제 DB나 비즈니스 로직은 없으며, `swagger.json` 명세 기반으로 가짜 응답을 자동 생성합니다.

### 의존성 설치 (최초 1회)

```bash
cd mockup
npm install
cd ..
```

### 실행 (프로젝트 루트에서)

```bash
npm run dev:mock
```

| 서비스 | 주소 |
|---|---|
| 목서버 API | http://localhost:4010/api |
| Swagger UI | http://localhost:4010/docs |
| 프론트엔드 | http://localhost:5173 |

### Swagger UI에서 API 테스트하는 법

1. http://localhost:4010/docs 접속
2. 테스트할 API 엔드포인트 클릭
3. **Try it out** 버튼 클릭
4. 파라미터 입력 후 **Execute** 클릭
5. `swagger.json` 명세 기반으로 자동 생성된 가짜 응답 확인
