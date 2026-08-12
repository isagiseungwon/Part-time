# 강승원 성장 기록

기록하면 경험치가 쌓이고 레벨이 오르는 개인 대시보드.
폰 브라우저에서 열면 끝 — 설치할 것 없음.

**주소: https://part-time-six.vercel.app**

## 구조

```
public/index.html   화면 전체 (단일 파일, 빌드 없음)
api/                Vercel 서버리스 API
supabase/           DB 스키마 (적용 완료, 기록용)
```

## 무엇을 담나

| 탭 | 하는 일 |
|---|---|
| 홈 | 레벨 · 경험치 · 오늘의 퀘스트 · 진행률 링 · 12주 히트맵 · 업적 |
| 📝 노트 | 책 · 강의 · 경험에서 건진 것. **적용했는지**까지 추적 |
| 🧩 막힌 것 | 실행이 막히는 지점 → 시도 → 해결점 |
| 🤝 사람 | 만난 사람과 다음 액션. 30일 미연락이면 먼저 올라온다 |
| 💡 아이디어 | 씨앗 → 만드는 중 → 내보냄 |
| 📖 독서 | 쪽수 진행, 완독 |
| 📚 강의 | 강의별 진도 |
| 💪 운동 | 체중 · 운동 기록 |
| 📱 마인드픽 | 인스타 게시물 지표 |
| 🪖 전역 | 복무 D-day + 복무 중 할 일 |
| ⚡ 블루록 | **능력치 육각형**(몸·두뇌·산출·지속·자각·흡수) · 무기 선언 · 주단위 랭크 · 무대 테스트 · 흡수 목록 |

순위는 산출 하나로만 매긴다(여러 개면 흐려진다).
능력치는 여섯 축으로 본다(하나면 내 모양이 안 보인다).

모든 항목은 목록에서 바로 수정할 수 있다 (아래에서 올라오는 시트).

## 경험치

| 행동 | XP |
|---|---:|
| 강의 1강 | 10 |
| 운동 1회 | 20 |
| 10쪽 읽기 | 5 |
| 완독 1권 | 60 |
| 마인드픽 게시물 | 30 |
| 노트 1개 | 15 |
| 노트 **적용** | 25 |
| 막힌 것 **해결** | 40 |
| 사람 기록 | 15 |
| 아이디어 **내보냄** | 50 |

레벨 N → N+1 에 필요한 XP는 `100 + (N-1)×60`.
연속 기록은 활동이 있는 날이 하루라도 끊기면 초기화된다.

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
| `me_notes` | 노트 (원문 · 해석 · 적용) |
| `me_blockers` | 막힌 것 → 해결 |
| `me_people` | 사람 · 다음 액션 |
| `me_ideas` | 아이디어함 |
| `me_books` | 독서 목록 |
| `me_courses` | 강의 진도 |
| `me_fitness` | 체중 · 운동 |
| `me_mindpick` | 인스타 게시물 지표 |
| `me_military_prep` | 복무 중 할 일 |
| `me_settings` | 입대일 · 전역일 (키-값) |
| `me_projects` · `me_progress` | 프로젝트 전반 (현재 화면에서 미사용) |

## Vercel 환경 변수

| 이름 | 어디서 가져오나 |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (secret) |

## API

| 엔드포인트 | 테이블 |
|---|---|
| `/api/notes` | `me_notes` |
| `/api/blockers` | `me_blockers` |
| `/api/people` | `me_people` |
| `/api/ideas` | `me_ideas` |
| `/api/books` | `me_books` |
| `/api/courses` | `me_courses` |
| `/api/fitness` | `me_fitness` |
| `/api/mindpick` | `me_mindpick` |
| `/api/military` | `me_military_prep` |
| `/api/projects` | `me_projects` |

각 엔드포인트가 지원하는 것:

| 메서드 | 하는 일 |
|---|---|
| `GET` | 목록 조회 |
| `POST` | 추가 |
| `PATCH ?id=` | 수정 |
| `DELETE ?id=` | 삭제 |

`/api/settings` 만 예외 — `me_settings` 는 기본키가 `key` 라서
`GET`(객체 하나) / `POST`(upsert) 만 지원한다.
