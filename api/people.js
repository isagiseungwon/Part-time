import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_people',
  orderBy: 'created_at',
  fields: ['name', 'met_where', 'met_at', 'tags', 'learned', 'next_action', 'last_contact', 'keep', 'notes']
});
