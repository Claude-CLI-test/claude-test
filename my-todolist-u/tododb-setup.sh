#!/bin/bash
set -e


echo "========================================="
echo " My TodoList - 자동 셋업 스크립트"
echo "========================================="


# PostgreSQL 비밀번호 입력
read -sp "PostgreSQL postgres 계정 비밀번호를 입력하세요: " DB_PASSWORD
echo ""


# 1. PostgreSQL 연결 확인
echo ""
echo "[1/6] PostgreSQL 연결 확인 중..."
if ! PGPASSWORD="$DB_PASSWORD" psql -U postgres -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
  echo "PostgreSQL 연결 실패. 비밀번호 또는 PostgreSQL 실행 상태를 확인하세요."
  exit 1
fi
echo "  -> PostgreSQL 연결 성공"


# 2. DB 생성 (이미 있으면 스킵)
echo ""
echo "[2/6] 데이터베이스 생성 중..."
if PGPASSWORD="$DB_PASSWORD" psql -U postgres -h localhost -lqt | cut -d \| -f 1 | grep -qw my_todolist; then
  echo "  -> my_todolist DB가 이미 존재합니다 (스킵)"
else
  PGPASSWORD="$DB_PASSWORD" psql -U postgres -h localhost -c "CREATE DATABASE my_todolist;"
  echo "  -> my_todolist DB 생성 완료"
fi


# 3. 스키마 및 시드 데이터 적용
echo ""
echo "[3/6] DB 스키마 및 시드 데이터 적용 중..."
PGPASSWORD="$DB_PASSWORD" psql -U postgres -h localhost -d my_todolist -f database/schema.sql
PGPASSWORD="$DB_PASSWORD" psql -U postgres -h localhost -d my_todolist -f database/seed.sql
echo "  -> 스키마 및 시드 데이터 적용 완료"


# 4. 의존성 설치
echo ""
echo "[4/6] npm 의존성 설치 중..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo "  -> 의존성 설치 완료"


# 5. 환경 변수 파일 생성
echo ""
echo "[5/6] 환경 변수 파일 생성 중..."


if [ ! -f backend/.env ]; then
  cat > backend/.env << EOF
NODE_ENV=development
PORT=3000
DB_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/my_todolist
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
EOF
  echo "  -> backend/.env 생성 완료"
else
  echo "  -> backend/.env 이미 존재 (스킵)"
fi


if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "  -> frontend/.env 생성 완료"
else
  echo "  -> frontend/.env 이미 존재 (스킵)"
fi


# 6. 완료
echo ""
echo "========================================="
echo " 셋업 완료!"
echo "========================================="
echo ""
echo " 실행 방법:  npm run dev"
echo ""
echo " 접속 주소:"
echo "   프론트엔드: http://localhost:5173"
echo "   백엔드 API: http://localhost:3000"
echo ""
echo " 테스트 계정:"
echo "   alice@example.com / Password1!"
echo "   bob@example.com   / Password1!"
echo "========================================="



