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
- [x] Vercel 배포 — https://part-time-six.vercel.app
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

컴파일이 필요 없다. `obsidian-plugin/` 안의 3개 파일을 그대로 복사하면 된다.

```
<볼트>/.obsidian/plugins/kang-seungwon-dashboard/
    manifest.json
    main.js
    styles.css
```

1. 위 경로로 폴더를 만들고 3개 파일 복사
   (`.obsidian` 은 숨김 폴더다. 안 보이면 숨김 파일 표시를 켠다.)
2. 옵시디언 → 설정 → 커뮤니티 플러그인 → **제한 모드 끄기**
3. 설치된 플러그인 목록에서 **강승원 대시보드** 켜기
4. 플러그인 설정에서 API 주소 확인 (기본값이 이미 들어있다)
5. 왼쪽 리본의 대시보드 아이콘 클릭, 또는 명령어 `대시보드 열기`

명령어 `API 연결 확인` 으로 서버 연결만 따로 점검할 수 있다.

> 폰에서 폴더를 만들기 번거로우면, PC 옵시디언에서 한 번 설치한 뒤
> 동기화하는 편이 빠르다.

## 데이터 넣기

지금은 읽기 화면만 있다. 데이터 입력은 둘 중 하나로 한다.

- Supabase 대시보드 → Table Editor → 해당 `me_*` 테이블에서 직접 입력
- `POST /api/<엔드포인트>` 로 JSON 전송

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
