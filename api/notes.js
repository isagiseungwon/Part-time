import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_notes',
  orderBy: 'created_at',
  fields: ['source_type', 'source_id', 'source_label', 'title', 'quote', 'insight', 'action', 'applied', 'updated_at']
});
