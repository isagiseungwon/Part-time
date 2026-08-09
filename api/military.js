import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_military_prep',
  orderBy: 'created_at',
  fields: ['task', 'category', 'priority', 'status', 'target_date', 'completed_at', 'notes']
});
