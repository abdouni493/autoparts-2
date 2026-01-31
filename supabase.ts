
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gthvapfgoillbdjifita.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aHZhcGZnb2lsbGJkamlmaXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTU5MzMsImV4cCI6MjA4NTM3MTkzM30.tKFYl4_gfGY1tP-k3wOkUQKe4-tr7aMg4VGNqa75ldg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
