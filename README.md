# 강승원 개인 프로젝트 관리 시스템

강의 · 피트니스 · 독서 · 마인드픽(인스타) · 군대 준비를 한 곳에서 추적하는 시스템.

## 구조

```
api/              Vercel 서버리스 API
supabase/         DB 스키마 (SQL)
obsidian-plugin/  옵시디언 플러그인
```

## 설정 순서

### 1. Supabase
1. supabase.com → 새 프로젝트 생성
2. SQL Editor에 `supabase/schema.sql` 내용 붙여넣고 실행
3. Settings → API 에서 `Project URL`, `anon public key` 복사

### 2. Vercel
1. vercel.com → Add New Project → 이 저장소 선택
2. Environment Variables 에 추가
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy → 배포된 주소 복사 (예: `https://part-time-xxx.vercel.app`)

### 3. 옵시디언 플러그인
1. 볼트의 `.obsidian/plugins/kang-seungwon-dashboard/` 폴더에 `obsidian-plugin` 내용 복사
2. 옵시디언 설정 → Community plugins → 활성화
3. 플러그인 설정에 2번에서 복사한 Vercel 주소 입력

## 사용

- `Show Dashboard` — 전체 진행률 대시보드
- `Refresh All Data` — 최신 데이터 불러오기

## API

| 엔드포인트 | 용도 |
|---|---|
| `/api/projects` | 프로젝트 전체 (강의, 군대준비 등) |
| `/api/fitness` | 체중 · 운동 기록 |
| `/api/books` | 독서 목록 |
| `/api/mindpick` | 인스타 게시물 지표 |

각 엔드포인트는 `GET`(조회) / `POST`(추가)를 지원.
