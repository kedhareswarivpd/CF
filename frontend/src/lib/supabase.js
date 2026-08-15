import { createClient } from '@supabase/supabase-js';

// Anon key is safe to expose client-side by design, but is sourced from env
// vars (with the existing project values as fallback) so it can be rotated
// per-environment without a code change.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Session is stored in sessionStorage (not localStorage) so tokens do not
// persist after the tab closes, reducing the XSS theft window.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
