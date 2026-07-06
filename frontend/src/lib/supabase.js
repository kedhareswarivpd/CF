import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kimfexrhqjinlrmwukik.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpbWZleHJocWppbmxybXd1a2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDU5NjksImV4cCI6MjA5ODg4MTk2OX0.yfbbbVttwKLW9ihd0TQM2nJaX-3fPlibV0VtV18U7WM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
