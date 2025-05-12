
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oblczzgltjqysfnccbkh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGN6emdsdGpxeXNmbmNjYmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDA2NTQsImV4cCI6MjA2MTUxNjY1NH0.ekyKhDkcu3aX4zAUU8RdqyCcvAh6L6dk11dr-Ytt_H8";
//This is also public key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const isSupabaseConfigured = () => {
  return true; 
};
