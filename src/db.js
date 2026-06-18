// Supabase-backed data layer: real accounts + shared marketplace.
// Every function fails soft (returns null/[] on error) so the UI never crashes
// if the network blips — it just falls back to seed/demo content.
import { supabase } from "./supabase";

// ── AUTH ─────────────────────────────────────────────────────────────────────
const REDIRECT = typeof window !== "undefined" ? window.location.origin : undefined;
// meta = { profile, listing } stashed in user_metadata so we can build the row
// after the user verifies their email and signs in.
export async function signUp(email, password, meta = {}) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(), password,
    options: { data: meta, emailRedirectTo: REDIRECT },
  });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}
export function onAuth(cb) {
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session));
  return () => data?.subscription?.unsubscribe?.();
}
export async function getMeta() {
  try { const { data } = await supabase.auth.getUser(); return data?.user?.user_metadata || {}; } catch (e) { return {}; }
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}
export async function signOut() { try { await supabase.auth.signOut(); } catch (e) {} }

export async function currentUserId() {
  try { const { data } = await supabase.auth.getUser(); return data?.user?.id || null; } catch (e) { return null; }
}

// ── PROFILES ─────────────────────────────────────────────────────────────────
export async function saveProfile(uid, profile) {
  try {
    const { error } = await supabase.from("profiles").upsert({ id: uid, data: profile, updated_at: new Date().toISOString() });
    return !error;
  } catch (e) { return false; }
}
export async function loadProfile(uid) {
  try {
    const { data, error } = await supabase.from("profiles").select("data").eq("id", uid).maybeSingle();
    if (error || !data) return null;
    return { ...data.data, id: uid };
  } catch (e) { return null; }
}

// ── LISTINGS (shared) ─────────────────────────────────────────────────────────
const rowToListing = r => ({ ...r.data, id: r.id, uid: r.uid });
export async function loadListings() {
  try {
    const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(500);
    if (error || !data) return [];
    return data.map(rowToListing);
  } catch (e) { return []; }
}
export async function addListing(uid, listing) {
  try {
    const { data, error } = await supabase.from("listings")
      .insert({ uid, cat: listing.cat, type: listing.type, data: listing })
      .select("*").single();
    if (error || !data) return null;
    return rowToListing(data);
  } catch (e) { return null; }
}
