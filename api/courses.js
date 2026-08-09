import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_courses',
  orderBy: 'created_at',
  fields: ['project_id', 'name', 'platform', 'total_lectures', 'completed_lectures', 'url', 'status']
});
