import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jjyhcaeyugnhyldcekzq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_PW07DypKIBgOViEM1yAnvA_nlQjNL-5";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
