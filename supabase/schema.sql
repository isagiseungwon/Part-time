-- 개인 비서 시스템 테이블 (me_ 접두사로 직원 자동화 테이블과 분리)
-- 2026-08-09 적용 완료. 참고용 기록.

create table me_projects (
  id bigint primary key generated always as identity,
  category text not null,
  name text not null,
  description text,
  total_units int not null default 0,
  current_units int not null default 0,
  target_date date,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table me_courses (
  id bigint primary key generated always as identity,
  project_id bigint references me_projects(id) on delete set null,
  name text not null,
  platform text,
  total_lectures int not null default 0,
  completed_lectures int not null default 0,
  url text,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);

create table me_fitness (
  id bigint primary key generated always as identity,
  date date not null,
  weight numeric(5,2),
  body_fat numeric(4,1),
  exercise_type text,
  sets int,
  reps int,
  notes text,
  created_at timestamptz not null default now()
);

create table me_books (
  id bigint primary key generated always as identity,
  title text not null,
  author text,
  status text not null default 'want_to_read',
  current_page int not null default 0,
  total_pages int,
  rating int,
  notes text,
  started_at date,
  finished_at date,
  created_at timestamptz not null default now()
);

create table me_mindpick (
  id bigint primary key generated always as identity,
  post_date date not null,
  content text,
  post_url text,
  reach int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  saves int not null default 0,
  followers int,
  notes text,
  created_at timestamptz not null default now()
);

create table me_military_prep (
  id bigint primary key generated always as identity,
  task text not null,
  category text,
  priority text not null default 'medium',
  status text not null default 'pending',
  target_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table me_progress (
  id bigint primary key generated always as identity,
  project_id bigint references me_projects(id) on delete cascade,
  date date not null default current_date,
  progress_value int,
  notes text,
  created_at timestamptz not null default now()
);

create index on me_courses (project_id);
create index on me_fitness (date desc);
create index on me_mindpick (post_date desc);
create index on me_progress (project_id, date desc);

-- RLS 활성화: 정책을 두지 않아 anon/authenticated 는 접근 불가.
-- Vercel 서버가 service_role 키로만 접근한다.
alter table me_projects      enable row level security;
alter table me_courses       enable row level security;
alter table me_fitness       enable row level security;
alter table me_books         enable row level security;
alter table me_mindpick      enable row level security;
alter table me_military_prep enable row level security;
alter table me_progress      enable row level security;
