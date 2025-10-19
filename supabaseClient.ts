
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The Supabase client is no longer created here with static credentials.
// Instead, we export a factory function that can be called with user-provided credentials.
export const createSupabaseClient = (url: string, key: string): SupabaseClient => {
  if (!url || !key) {
    throw new Error("Supabase URL and Key are required.");
  }
  return createClient(url, key);
};
