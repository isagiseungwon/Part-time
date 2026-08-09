import { createClient } from '@supabase/supabase-js';

// service_role 키는 RLS를 우회한다. 서버(Vercel)에서만 사용하며
// 절대 클라이언트로 내보내지 않는다.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// 목록(GET) / 추가(POST) / 수정(PATCH ?id=) / 삭제(DELETE ?id=)
export function crudHandler({ table, orderBy, fields }) {
  return async function handler(req, res) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다' });
    }

    // 넘어온 값 중 허용된 컬럼만 추린다.
    const pick = (body) => {
      const row = {};
      for (const field of fields) {
        if (body[field] !== undefined) row[field] = body[field] === '' ? null : body[field];
      }
      return row;
    };

    const id = req.query?.id;

    try {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order(orderBy, { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (req.method === 'POST') {
        const row = pick(req.body ?? {});
        if (!Object.keys(row).length) {
          return res.status(400).json({ error: `입력할 필드가 없습니다. 사용 가능: ${fields.join(', ')}` });
        }
        const { data, error } = await supabase.from(table).insert([row]).select();
        if (error) throw error;
        return res.status(201).json(data[0]);
      }

      if (req.method === 'PATCH') {
        if (!id) return res.status(400).json({ error: 'id 쿼리 파라미터가 필요합니다' });
        const row = pick(req.body ?? {});
        if (!Object.keys(row).length) {
          return res.status(400).json({ error: '수정할 필드가 없습니다' });
        }
        const { data, error } = await supabase.from(table).update(row).eq('id', id).select();
        if (error) throw error;
        if (!data.length) return res.status(404).json({ error: '해당 id를 찾을 수 없습니다' });
        return res.status(200).json(data[0]);
      }

      if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ error: 'id 쿼리 파라미터가 필요합니다' });
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return res.status(204).end();
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  };
}
