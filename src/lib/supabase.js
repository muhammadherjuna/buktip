import { createClient } from '@supabase/supabase-js';

/**
 * Konfigurasi Supabase Client untuk aplikasi Buktip.
 * 
 * CATATAN:
 * Pastikan Anda telah membuat file `.env.local` pada direktori root proyek
 * dan mengisinya dengan kredensial Supabase Anda:
 * 
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
