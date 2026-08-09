import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_books',
  orderBy: 'created_at',
  fields: ['title', 'author', 'status', 'current_page', 'total_pages', 'rating', 'notes', 'started_at', 'finished_at']
});
