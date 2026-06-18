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

// ── TRADES + MESSAGES (real, shared, realtime) ───────────────────────────────
const isUuid = v => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v);
export { isUuid };

export async function createTrade(meUid, themUid, data) {
  if (!isUuid(themUid)) return null; // can't open a real trade with a demo/seed listing
  try {
    const { data: row, error } = await supabase.from("trades")
      .insert({ participants: [meUid, themUid], data, status: "pending" })
      .select("*").single();
    if (error || !row) return null;
    return row;
  } catch (e) { return null; }
}
export async function loadTrades(uid) {
  try {
    const { data, error } = await supabase.from("trades")
      .select("*").contains("participants", [uid]).order("created_at", { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) { return []; }
}
export async function updateTrade(id, patch) {
  try { const { error } = await supabase.from("trades").update(patch).eq("id", id); return !error; }
  catch (e) { return false; }
}
export async function loadMessages(tradeId) {
  try {
    const { data, error } = await supabase.from("messages")
      .select("*").eq("trade_id", tradeId).order("created_at", { ascending: true });
    if (error || !data) return [];
    return data;
  } catch (e) { return []; }
}
export async function sendMessage(tradeId, fromUid, data) {
  try {
    const { data: row, error } = await supabase.from("messages")
      .insert({ trade_id: tradeId, from_uid: fromUid, data }).select("*").single();
    if (error || !row) return null;
    return row;
  } catch (e) { return null; }
}
// Live updates: calls cb(newMessage) whenever a message is inserted on this trade.
export function subscribeMessages(tradeId, cb) {
  const ch = supabase
    .channel(`msgs-${tradeId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `trade_id=eq.${tradeId}` }, payload => cb(payload.new))
    .subscribe();
  return () => { try { supabase.removeChannel(ch); } catch (e) {} };
}
