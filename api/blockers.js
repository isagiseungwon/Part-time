import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_blockers',
  orderBy: 'created_at',
  fields: ['title', 'category', 'source', 'detail', 'attempts', 'solution', 'status', 'solved_at']
});
