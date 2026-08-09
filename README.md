# 강승원 개인 프로젝트 관리 시스템

강의 · 피트니스 · 독서 · 마인드픽(인스타) · 군대 준비를 한 곳에서 추적한다.
폰 브라우저에서 쓰는 관리자 페이지 + Supabase.

**주소: https://part-time-six.vercel.app**

## 구조

```
public/index.html   관리자 페이지 (설치 필요 없음, 브라우저로 열면 끝)
api/                Vercel 서버리스 API
supabase/           DB 스키마 (적용 완료, 기록용)
```

## 진행 상황

- [x] Supabase 테이블 7개 생성 (RLS 켜짐)
- [x] Vercel 배포
- [x] 관리자 페이지

## 보안

3중으로 막혀 있다.

1. **Vercel Authentication** — 사이트 자체가 Vercel 계정 로그인 뒤에 있다.
   로그인하지 않은 사람은 페이지도 API도 못 본다.
2. **RLS** — 모든 `me_*` 테이블에 RLS를 켜고 정책을 두지 않았다.
   Supabase anon 키를 알아도 아무것도 못 읽는다.
3. **service_role 키는 서버에만** — Vercel 환경 변수에만 있고
   브라우저로 나가지 않는다. 깃에 커밋하지 말 것.

## Supabase

기존 프로젝트(`isagiseungwon's Project`)에 `me_` 접두사로 만들었다.
직원 자동화 테이블(`employees`, `work_log` 등)과 이름으로 분리된다.

| 테이블 | 용도 |
|---|---|
| `me_projects` | 프로젝트 전반 |
| `me_courses` | 강의 진도 |
| `me_fitness` | 체중 · 운동 |
| `me_books` | 독서 목록 |
| `me_mindpick` | 인스타 게시물 지표 |
| `me_military_prep` | 군대 준비 항목 |
| `me_progress` | 날짜별 진행률 기록 |

## Vercel 환경 변수

| 이름 | 어디서 가져오나 |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (secret) |

## API

| 엔드포인트 | 테이블 |
|---|---|
| `/api/projects` | `me_projects` |
| `/api/courses` | `me_courses` |
| `/api/fitness` | `me_fitness` |
| `/api/books` | `me_books` |
| `/api/mindpick` | `me_mindpick` |
| `/api/military` | `me_military_prep` |

각 엔드포인트가 지원하는 것:

| 메서드 | 하는 일 |
|---|---|
| `GET` | 목록 조회 |
| `POST` | 추가 |
| `PATCH ?id=` | 수정 |
| `DELETE ?id=` | 삭제 |
