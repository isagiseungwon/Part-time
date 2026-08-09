import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_fitness',
  orderBy: 'date',
  fields: ['date', 'weight', 'body_fat', 'exercise_type', 'sets', 'reps', 'notes']
});
