import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_projects',
  orderBy: 'created_at',
  fields: ['category', 'name', 'description', 'total_units', 'current_units', 'target_date', 'status']
});
