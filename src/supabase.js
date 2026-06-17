// Supabase client — real accounts + shared marketplace data across all devices.
// The publishable key is explicitly safe for the browser (Row Level Security
// guards every table), so it's fine to ship. Env vars override if you ever rotate.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.REACT_APP_SUPABASE_URL || "https://jdyxvwxfmkfhrnosestf.supabase.co";
const KEY = process.env.REACT_APP_SUPABASE_KEY || "sb_publishable_pG1OxPP1CtSGEk_9XRqMyg_GH0E54sC";

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
export const SUPABASE_ON = !!(URL && KEY);
