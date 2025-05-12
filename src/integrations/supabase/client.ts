import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oblczzgltjqysfnccbkh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGN6emdsdGpxeXNmbmNjYmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDA2NTQsImV4cCI6MjA2MTUxNjY1NH0.ekyKhDkcu3aX4zAUU8RdqyCcvAh6L6dk11dr-Ytt_H8";
//This is public key, Its fine
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);