import { supabase, crudHandler } from './_supabase.js';

/* Vercel 무료 플랜의 서버리스 함수 상한이 12개라, 엔드포인트마다 파일을 두면
   테이블이 늘어나는 순간 배포가 막힌다. 동적 라우트 하나로 전부 받는다. */
const RESOURCES = {
  projects:  { table: 'me_projects',      orderBy: 'created_at',
               fields: ['category', 'name', 'description', 'total_units', 'current_units', 'target_date', 'status'] },
  courses:   { table: 'me_courses',       orderBy: 'created_at',
               fields: ['project_id', 'name', 'platform', 'total_lectures', 'completed_lectures', 'url', 'status'] },
  fitness:   { table: 'me_fitness',       orderBy: 'date',
               fields: ['date', 'weight', 'body_fat', 'exercise_type', 'sets', 'reps', 'notes'] },
  books:     { table: 'me_books',         orderBy: 'created_at',
               fields: ['title', 'author', 'status', 'current_page', 'total_pages', 'rating', 'notes', 'started_at', 'finished_at'] },
  mindpick:  { table: 'me_mindpick',      orderBy: 'post_date',
               fields: ['post_date', 'content', 'post_url', 'reach', 'likes', 'comments', 'saves', 'followers', 'notes'] },
  military:  { table: 'me_military_prep', orderBy: 'created_at',
               fields: ['task', 'category', 'priority', 'status', 'target_date', 'completed_at', 'notes'] },
  notes:     { table: 'me_notes',         orderBy: 'created_at',
               fields: ['source_type', 'source_id', 'source_label', 'title', 'quote', 'insight', 'action', 'applied', 'updated_at'] },
  blockers:  { table: 'me_blockers',      orderBy: 'created_at',
               fields: ['title', 'category', 'source', 'detail', 'attempts', 'solution', 'status', 'solved_at'] },
  people:    { table: 'me_people',        orderBy: 'created_at',
               fields: ['name', 'met_where', 'met_at', 'tags', 'learned', 'next_action', 'last_contact', 'keep', 'notes'] },
  ideas:     { table: 'me_ideas',         orderBy: 'created_at',
               fields: ['title', 'detail', 'category', 'status'] },
  mastery:   { table: 'me_mastery',       orderBy: 'created_at',
               fields: ['category', 'term', 'meaning', 'cue', 'why', 'level', 'reps', 'lapses',
                        'unaided_count', 'last_review', 'next_review', 'when_cue'] },
  drills:    { table: 'me_drills',        orderBy: 'date',
               fields: ['date', 'mastery_id', 'term_snapshot', 'recalled', 'unaided', 'note'] },
  selfcheck: { table: 'me_selfcheck',     orderBy: 'date',
               fields: ['date', 'area', 'self_score', 'other_score', 'evidence', 'gap_note', 'action'] },
  goals:     { table: 'me_goals',         orderBy: 'created_at',
               fields: ['title', 'category', 'metric', 'start_value', 'current_value', 'target_value',
                        'direction', 'deadline', 'why', 'status', 'when_cue', 'updated_at'] },
  steps:     { table: 'me_steps',         orderBy: 'order_index',
               fields: ['goal_id', 'title', 'order_index', 'done', 'done_at', 'target_date', 'note', 'when_cue'] },
  reviews:   { table: 'me_reviews',       orderBy: 'week_start',
               fields: ['week_start', 'went_well', 'went_bad', 'focus', 'snapshot'] },
  income:    { table: 'me_income',        orderBy: 'date',
               fields: ['date', 'kind', 'source', 'amount', 'note'] }
};

const HANDLERS = Object.fromEntries(
  Object.entries(RESOURCES).map(([name, cfg]) => [name, crudHandler(cfg)])
);

/* me_settings 는 기본키가 key 라 id 기준 crudHandler 를 쓸 수 없다. */
const SETTING_KEYS = new Set(['service_start', 'service_end', 'income_target']);

async function settingsHandler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('me_settings').select('key, value');
    if (error) throw error;
    return res.status(200).json(Object.fromEntries(data.map(r => [r.key, r.value])));
  }

  if (req.method === 'POST' || req.method === 'PATCH') {
    const rows = Object.entries(req.body ?? {})
      .filter(([k, v]) => SETTING_KEYS.has(k) && v !== undefined)
      .map(([key, value]) => ({ key, value: value === '' ? null : String(value), updated_at: new Date().toISOString() }));

    if (!rows.length) {
      return res.status(400).json({ error: `저장할 항목이 없습니다. 사용 가능: ${[...SETTING_KEYS].join(', ')}` });
    }
    const { error } = await supabase.from('me_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;

    const { data, error: readErr } = await supabase.from('me_settings').select('key, value');
    if (readErr) throw readErr;
    return res.status(200).json(Object.fromEntries(data.map(r => [r.key, r.value])));
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  return res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
  const resource = req.query?.resource;

  if (resource === 'settings') {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다' });
      }
      return await settingsHandler(req, res);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const h = HANDLERS[resource];
  if (!h) {
    return res.status(404).json({ error: `알 수 없는 엔드포인트: ${resource}`, available: [...Object.keys(RESOURCES), 'settings'] });
  }
  return h(req, res);
}
