import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing Supabase browser env vars");
}

// Safe for client-side (uses anon key)
export const supabaseBrowser = createClient(supabaseUrl, anonKey);