import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

// service_role key bypasses Row Level Security — backend use only
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

// Verify connection on startup
(async () => {
  const { error } = await supabase.from('bases').select('id').limit(1);
  if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
    console.error('❌ Supabase connection error:', error.message);
  } else {
    console.log('✅ Supabase connection established');
  }
})();

export default supabase;
