import { supabase } from './_supabase.js';

const ALLOWED = new Set(['service_start', 'service_end']);

/* me_settings 는 key 가 기본키라 공통 crudHandler(id 기준)를 쓸 수 없다.
   GET 은 객체 하나로, POST 는 upsert 로 처리한다. */
export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('me_settings').select('key, value');
      if (error) throw error;
      return res.status(200).json(Object.fromEntries(data.map(r => [r.key, r.value])));
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      const body = req.body ?? {};
      const rows = Object.entries(body)
        .filter(([k, v]) => ALLOWED.has(k) && v !== undefined)
        .map(([key, value]) => ({ key, value: value === '' ? null : String(value), updated_at: new Date().toISOString() }));

      if (!rows.length) {
        return res.status(400).json({ error: `저장할 항목이 없습니다. 사용 가능: ${[...ALLOWED].join(', ')}` });
      }

      const { error } = await supabase.from('me_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;

      const { data, error: readErr } = await supabase.from('me_settings').select('key, value');
      if (readErr) throw readErr;
      return res.status(200).json(Object.fromEntries(data.map(r => [r.key, r.value])));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  return res.status(405).json({ error: 'Method not allowed' });
}
