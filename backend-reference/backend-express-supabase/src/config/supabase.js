import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

console.log('SUPABASE_URL:', env.supabaseUrl)
console.log('SUPABASE_ANON_KEY:', env.supabaseAnonKey?.slice(0, 20))
console.log('SUPABASE_SERVICE_ROLE_KEY:', env.supabaseServiceRoleKey?.slice(0, 20))


const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, options);
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey || env.supabaseAnonKey,
  options
);
