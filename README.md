# 강승원 개인 프로젝트 관리 시스템

강의 · 피트니스 · 독서 · 마인드픽(인스타) · 군대 준비를 한 곳에서 추적하는 시스템.

## 구조

```
api/              Vercel 서버리스 API
supabase/         DB 스키마 (적용 완료, 기록용)
obsidian-plugin/  옵시디언 플러그인
```

## 진행 상황

- [x] Supabase 테이블 7개 생성 (RLS 켜짐)
- [ ] Vercel 배포
- [ ] 옵시디언 플러그인 설치

## 1. Supabase — 완료됨 ✅

기존 프로젝트(`isagiseungwon's Project`)에 `me_` 접두사로 생성했다.
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

RLS를 켜두고 정책은 두지 않았다. 즉 anon 키로는 아무것도 못 읽는다.
접근은 Vercel 서버가 `service_role` 키로만 한다.

## 2. Vercel 설정

1. vercel.com → Add New Project → 이 저장소 선택
2. Environment Variables 에 2개 추가

   | 이름 | 어디서 가져오나 |
   |---|---|
   | `SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (secret) |

3. Deploy → 배포 주소 복사

> ⚠️ `service_role` 키는 DB 전체 권한을 가진다. Vercel 환경 변수에만 넣고
> 깃에 커밋하거나 옵시디언 설정에 넣지 말 것.

## 3. 옵시디언 플러그인

1. 볼트의 `.obsidian/plugins/kang-seungwon-dashboard/` 폴더를 만들고 `obsidian-plugin` 내용 복사
2. 설정 → Community plugins → 활성화
3. 플러그인 설정에 2번의 Vercel 주소 입력

## API

| 엔드포인트 | 테이블 |
|---|---|
| `/api/projects` | `me_projects` |
| `/api/courses` | `me_courses` |
| `/api/fitness` | `me_fitness` |
| `/api/books` | `me_books` |
| `/api/mindpick` | `me_mindpick` |
| `/api/military` | `me_military_prep` |

각각 `GET`(목록 조회) / `POST`(추가) 지원.
