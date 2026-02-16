import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase: VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 未配置，登录与云端同步将不可用。");
}

// Fallback to prevent crash, but functionality will be limited
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(url, key);
