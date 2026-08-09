import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_drills',
  orderBy: 'date',
  fields: ['date', 'mastery_id', 'term_snapshot', 'recalled', 'unaided', 'note']
});
