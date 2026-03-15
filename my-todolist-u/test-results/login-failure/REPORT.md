# 로그인 실패 E2E 테스트 보고서 (한국어 UI)

- **날짜**: 2026-03-04
- **Spec**: `e2e/login-failure.spec.ts`
- **브라우저**: Chromium (headless)
- **언어**: 한국어 (ko)
- **결과**: 7 통과 / 0 실패

---

## 테스트 케이스

| # | 테스트 케이스 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | 이메일/비밀번호 모두 빈 값으로 로그인 시도 | PASS | [01-empty-fields.png](./01-empty-fields.png) |
| 2 | 이메일 형식 오류 (@ 없음) | PASS | [02-invalid-email-format.png](./02-invalid-email-format.png) |
| 3 | 존재하지 않는 이메일로 로그인 | PASS | [03-nonexistent-email.png](./03-nonexistent-email.png) |
| 4 | 이메일은 맞고 비밀번호가 틀린 경우 | PASS | [04-wrong-password.png](./04-wrong-password.png) |
| 5 | 이메일만 입력하고 비밀번호 비운 경우 | PASS | [05-missing-password.png](./05-missing-password.png) |
| 6 | 비밀번호만 입력하고 이메일 비운 경우 | PASS | [06-missing-email.png](./06-missing-email.png) |
| 7 | 비밀번호에 공백만 입력한 경우 | PASS | [07-whitespace-password.png](./07-whitespace-password.png) |

---

## 비고

- 기본 언어(ko)로 실행 (localStorage 별도 설정 없음)
- 3, 4, 7번 케이스는 백엔드 API 호출이 필요 (`npm run dev` 실행 상태에서 테스트)
- 1, 2, 5, 6번 케이스는 프론트엔드 유효성 검사로 처리 (API 호출 없음)
