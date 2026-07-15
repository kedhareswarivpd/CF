import { createClient } from '@supabase/supabase-js';

// Anon key is safe to expose client-side by design, but is sourced from env
// vars (with the existing project values as fallback) so it can be rotated
// per-environment without a code change.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
