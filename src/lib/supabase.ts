
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase variables. Check your .env.local file. Ensure they are prefixed with VITE_');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

