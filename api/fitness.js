import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('fitness')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } else if (method === 'POST') {
    try {
      const { date, weight, exercise_type, sets, reps, notes } = req.body;
      const { data, error } = await supabase
        .from('fitness')
        .insert([{ date, weight, exercise_type, sets, reps, notes }])
        .select();

      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
