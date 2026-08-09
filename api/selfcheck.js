import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_selfcheck',
  orderBy: 'date',
  fields: ['date', 'area', 'self_score', 'other_score', 'evidence', 'gap_note', 'action']
});
