import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_ideas',
  orderBy: 'created_at',
  fields: ['title', 'detail', 'category', 'status']
});
