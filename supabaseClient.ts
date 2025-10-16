// --- START OF FILE supabaseClient.ts ---
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Project Settings -> API
const supabaseUrl = 'https://evgvsqcmywfjgzytocmb.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Z3ZzcWNteXdmamd6eXRvY21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTYyMTEsImV4cCI6MjA3NjA5MjIxMX0.n4UcNT0w5u5EGN8K-h8zBWKhCDrckkNanuwvmkF4l-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// --- END OF FILE supabaseClient.ts ---