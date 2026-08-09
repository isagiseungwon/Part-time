import { createClient } from '@supabase/supabase-js';

// service_role 키는 RLS를 우회한다. 서버(Vercel)에서만 사용하며
// 절대 클라이언트로 내보내지 않는다.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// GET(목록) / POST(추가) 만 처리하는 공통 핸들러.
export function crudHandler({ table, orderBy, fields }) {
  return async function handler(req, res) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body ?? {};
      const row = {};
      for (const field of fields) {
        if (body[field] !== undefined) row[field] = body[field];
      }

      if (Object.keys(row).length === 0) {
        return res.status(400).json({ error: `입력할 필드가 없습니다. 사용 가능: ${fields.join(', ')}` });
      }

      const { data, error } = await supabase.from(table).insert([row]).select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data[0]);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  };
}
