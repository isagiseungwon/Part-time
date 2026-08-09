import { crudHandler } from './_supabase.js';

export default crudHandler({
  table: 'me_mindpick',
  orderBy: 'post_date',
  fields: ['post_date', 'content', 'post_url', 'reach', 'likes', 'comments', 'saves', 'followers', 'notes']
});
