// Shared communication helpers: languages, live translation, and read-aloud.
// Used by chat (and anywhere) for translate + text-to-speech.

// Major languages: label (sent to the translator) + BCP-47 code (for speech).
export const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Spanish", code: "es-ES" },
  { label: "French", code: "fr-FR" },
  { label: "Portuguese", code: "pt-BR" },
  { label: "German", code: "de-DE" },
  { label: "Italian", code: "it-IT" },
  { label: "Arabic", code: "ar-SA" },
  { label: "Hindi", code: "hi-IN" },
  { label: "Mandarin Chinese", code: "zh-CN" },
  { label: "Japanese", code: "ja-JP" },
  { label: "Korean", code: "ko-KR" },
  { label: "Russian", code: "ru-RU" },
  { label: "Vietnamese", code: "vi-VN" },
  { label: "Tagalog", code: "fil-PH" },
  { label: "Swahili", code: "sw-KE" },
  { label: "Haitian Creole", code: "ht-HT" },
];
export const langByLabel = l => LANGUAGES.find(x => x.label === l) || LANGUAGES[0];

// Live translation via the Claude-powered serverless function. Fails soft.
export async function translateText(text, toLabel) {
  try {
    const r = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, to: toLabel }),
    });
    if (!r.ok) return { translated: text, detected: "" };
    return await r.json();
  } catch (e) { return { translated: text, detected: "" }; }
}

// Read text aloud in the chosen language using the browser's speech engine.
export const TTS_OK = typeof window !== "undefined" && "speechSynthesis" in window;
export function speak(text, lang = "en-US") {
  if (!TTS_OK || !text) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = synth.getVoices().find(x => x.lang === lang) || synth.getVoices().find(x => x.lang && x.lang.startsWith(lang.split("-")[0]));
    if (v) u.voice = v;
    synth.speak(u);
    return true;
  } catch (e) { return false; }
}
export function stopSpeaking() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

// Turn URLs in a message into clickable links (returns text/link segments).
export function linkify(text) {
  const parts = [];
  const re = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: "text", v: text.slice(last, m.index) });
    const url = m[0];
    parts.push({ t: "link", v: url, href: url.startsWith("http") ? url : "https://" + url });
    last = m.index + url.length;
  }
  if (last < text.length) parts.push({ t: "text", v: text.slice(last) });
  return parts;
}
