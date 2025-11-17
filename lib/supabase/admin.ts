// lib/supabaseAdmin.ts  OR  src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly named and accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Check .env.local and Netlify environment variables.");
}
if (!supabaseServiceRoleKey) {
  throw new Error("Missing environment variable SUPABASE_SERVICE_ROLE_KEY. Check .env.local and Netlify environment variables.");
}

// Create a single supabase client for interacting with your database
// This client uses the SERVICE_ROLE_KEY for backend operations,
// bypassing RLS. It should ONLY be used in secure backend environments.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});