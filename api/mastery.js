import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_mastery',
  orderBy: 'created_at',
  fields: ['category', 'term', 'meaning', 'cue', 'why', 'level', 'reps', 'lapses',
           'unaided_count', 'last_review', 'next_review']
});
